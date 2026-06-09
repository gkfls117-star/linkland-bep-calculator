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

const itemCost = (
  item: DynamicItem,
  section: ExpenseSection,
  input: CalculatorInput,
): number => {
  if (item.type === "amount") return item.value
  if (section === "onlineCosts") return input.onlineMonthlyRevenue * percent(item.value)
  if (section === "offlineFixed") return input.offlineMonthlyRevenue * percent(item.value)
  return input.offlineMonthlyRevenue * percent(item.value)
}

export const sumSection = (
  items: readonly DynamicItem[],
  section: ExpenseSection,
  input: CalculatorInput,
): number => items.reduce((total, item) => total + itemCost(item, section, input), 0)

export const calculateTotals = (input: CalculatorInput): SectionTotals => {
  const initialCash = sumSection(input.investment, "investment", input)
  const recoverableInvestment = input.investment.reduce(
    (total, item) => total + (item.recoverable === true ? itemCost(item, "investment", input) : 0),
    0,
  )

  return {
    offlineFixedMonthly: sumSection(input.offlineFixed, "offlineFixed", input),
    onlineMonthlyCost: sumSection(input.onlineCosts, "onlineCosts", input),
    initialCash,
    recoverableInvestment,
    nonRecoverableInvestment: initialCash - recoverableInvestment,
  }
}

export const calculateBep = (input: CalculatorInput): CalculatorResult => {
  const totals = calculateTotals(input)
  const offlineContribution = input.offlineMonthlyRevenue * percent(input.offlineMarginRate)
  const onlineContribution = input.onlineMonthlyRevenue * percent(input.onlineMarginRate)
  const offlineNetProfit = offlineContribution - totals.offlineFixedMonthly
  const onlineNetProfit = onlineContribution - totals.onlineMonthlyCost
  const combinedMonthlyProfit = offlineNetProfit + onlineNetProfit
  const offlineBepRevenue =
    input.offlineMarginRate > 0 ? totals.offlineFixedMonthly / percent(input.offlineMarginRate) : 0
  const offlineBepVisitors =
    input.avgOrderValue > 0 && input.conversionRate > 0
      ? offlineBepRevenue / input.avgOrderValue / percent(input.conversionRate)
      : 0
  const paybackMonths =
    combinedMonthlyProfit > 0 ? totals.initialCash / combinedMonthlyProfit : null

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
    transferRecovery: transferRecovery(input, combinedMonthlyProfit, totals.initialCash),
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
): readonly TransferRecovery[] => {
  const premiums = [
    [2, input.transferPremiumYear2],
    [3, input.transferPremiumYear3],
    [4, input.transferPremiumYear4],
    [5, input.transferPremiumYear5],
  ] as const

  return premiums.map(([year, premium]) => {
    const cumulativeProfit = combinedMonthlyProfit * year * 12
    const recoveredAmount = cumulativeProfit + premium
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
