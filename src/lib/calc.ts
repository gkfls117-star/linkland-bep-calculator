import type {
  CalculatorInput,
  CalculatorResult,
  DynamicItem,
  ExpenseSection,
  SectionTotals,
  TransferRecovery,
} from "../types/calculator"
import type { MarketMetrics, MarketStore } from "../types/market"

const percent = (value: number): number => value / 100

const remainingPercent = (value: number): number => 1 - percent(value)

const lockedOnlineRateItemIds = new Set(["online_platform", "online_ads"])

export const calculateOfflineMonthlyRevenue = (input: CalculatorInput): number =>
  input.monthlyVisitors * percent(input.conversionRate) * input.avgOrderValue

export const withCalculatedOfflineRevenue = (input: CalculatorInput): CalculatorInput => ({
  ...input,
  offlineMonthlyRevenue: calculateOfflineMonthlyRevenue(input),
})

export const activeOfflineMonthlyRevenue = (input: CalculatorInput): number =>
  input.offlineEnabled ? input.offlineMonthlyRevenue : 0

export const activeOnlineMonthlyRevenue = (input: CalculatorInput): number =>
  input.onlineEnabled ? input.onlineMonthlyRevenue : 0

const effectiveItemType = (item: DynamicItem, section: ExpenseSection): DynamicItem["type"] => {
  if (section === "onlineCosts" && lockedOnlineRateItemIds.has(item.id)) return "rate"
  return item.type
}

const itemCost = (
  item: DynamicItem,
  section: ExpenseSection,
  input: CalculatorInput,
): number => {
  if (effectiveItemType(item, section) === "amount") return item.value
  if (section === "onlineCosts") return activeOnlineMonthlyRevenue(input) * percent(item.value)
  if (section === "offlineFixed") return activeOfflineMonthlyRevenue(input) * percent(item.value)
  return activeOfflineMonthlyRevenue(input) * percent(item.value)
}

export const sumSection = (
  items: readonly DynamicItem[],
  section: ExpenseSection,
  input: CalculatorInput,
): number => items.reduce((total, item) => total + itemCost(item, section, input), 0)

export const calculateTotals = (input: CalculatorInput): SectionTotals => {
  const calculatedInput = withCalculatedOfflineRevenue(input)
  const initialCash = sumSection(calculatedInput.investment, "investment", calculatedInput)
  const recoverableInvestment = calculatedInput.investment.reduce(
    (total, item) => total + (item.recoverable === true ? itemCost(item, "investment", calculatedInput) : 0),
    0,
  )

  return {
    offlineFixedMonthly: calculatedInput.offlineEnabled
      ? sumSection(calculatedInput.offlineFixed, "offlineFixed", calculatedInput)
      : 0,
    onlineMonthlyCost: calculatedInput.onlineEnabled
      ? sumSection(calculatedInput.onlineCosts, "onlineCosts", calculatedInput)
      : 0,
    initialCash,
    recoverableInvestment,
    nonRecoverableInvestment: initialCash - recoverableInvestment,
  }
}

export const calculateBep = (input: CalculatorInput): CalculatorResult => {
  const calculatedInput = withCalculatedOfflineRevenue(input)
  const totals = calculateTotals(calculatedInput)
  const offlineRevenue = activeOfflineMonthlyRevenue(calculatedInput)
  const onlineRevenue = activeOnlineMonthlyRevenue(calculatedInput)
  const offlineContribution = offlineRevenue * remainingPercent(calculatedInput.offlineMarginRate)
  const onlineContribution = onlineRevenue * remainingPercent(calculatedInput.onlineMarginRate)
  const offlineNetProfit = offlineContribution - totals.offlineFixedMonthly
  const onlineNetProfit = onlineContribution - totals.onlineMonthlyCost
  const combinedMonthlyProfit = offlineNetProfit + onlineNetProfit
  const offlineBepRevenue =
    calculatedInput.offlineMarginRate < 100
      ? totals.offlineFixedMonthly / remainingPercent(calculatedInput.offlineMarginRate)
      : 0
  const offlineBepVisitors =
    calculatedInput.avgOrderValue > 0 && calculatedInput.conversionRate > 0
      ? offlineBepRevenue / calculatedInput.avgOrderValue / percent(calculatedInput.conversionRate)
      : 0
  const paybackBaseInvestment = Math.max(totals.nonRecoverableInvestment, 0)
  const paybackMonths =
    combinedMonthlyProfit > 0 ? paybackBaseInvestment / combinedMonthlyProfit : null

  return {
    offlineContribution,
    offlineNetProfit,
    onlineContribution,
    onlineNetProfit,
    combinedMonthlyProfit,
    yearlyProfit: combinedMonthlyProfit * 12,
    initialCash: totals.initialCash,
    recoverableInvestment: totals.recoverableInvestment,
    paybackMonths,
    offlineBepRevenue,
    offlineBepVisitors,
    riskLevel: riskLevel(combinedMonthlyProfit, paybackMonths),
    transferRecovery: transferRecovery(
      calculatedInput,
      combinedMonthlyProfit,
      totals.initialCash,
      totals.recoverableInvestment,
    ),
    totals,
  }
}

const riskLevel = (
  combinedMonthlyProfit: number,
  paybackMonths: number | null,
): CalculatorResult["riskLevel"] => {
  if (combinedMonthlyProfit <= 0 || paybackMonths === null || paybackMonths > 48) return "high"
  if (paybackMonths > 30) return "medium"
  return "low"
}

const transferRecovery = (
  input: CalculatorInput,
  combinedMonthlyProfit: number,
  initialCash: number,
  recoverableInvestment: number,
): readonly TransferRecovery[] => {
  const premiums = [
    [2, input.transferPremiumYear2],
    [3, input.transferPremiumYear3],
    [4, input.transferPremiumYear4],
    [5, input.transferPremiumYear5],
  ] as const

  return premiums.map(([year, premium]) => {
    const cumulativeProfit = combinedMonthlyProfit * year * 12
    const recoveredAmount = cumulativeProfit + premium + recoverableInvestment
    return {
      year,
      premium,
      cumulativeProfit,
      recoveredAmount,
      roiRate: initialCash > 0 ? (recoveredAmount - initialCash) / initialCash : 0,
    }
  })
}

export const marketMetrics = (
  store: MarketStore,
  linklandOfflineRevenue: number,
): MarketMetrics => {
  const monthlyCustomers = store.avgOrderValue > 0 ? store.monthlyRevenue / store.avgOrderValue : 0
  const requiredVisitors =
    store.conversion > 0 ? monthlyCustomers / percent(store.conversion) : 0

  return {
    monthlyCustomers,
    requiredVisitors,
    dailyVisitors: requiredVisitors / 30,
    revenueRatioToLinkland:
      linklandOfflineRevenue > 0 ? store.monthlyRevenue / linklandOfflineRevenue : 0,
  }
}
