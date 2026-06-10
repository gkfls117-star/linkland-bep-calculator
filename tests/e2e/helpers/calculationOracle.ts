import { calculateBep, withCalculatedOfflineRevenue } from "../../../src/lib/calc"
import { defaultInput } from "../../../src/lib/defaults"
import { formatMoney, formatMonths } from "../../../src/lib/format"
import type { CalculatorInput, MoneyUnit } from "../../../src/types/calculator"

export type DashboardOracle = {
  readonly combinedRevenue: string
  readonly combinedProfit: string
  readonly offlineProfit: string
  readonly onlineProfit: string
  readonly investmentAndPayback: string
}

export const defaultDashboardOracle = (
  currency: MoneyUnit,
  exchangeRate: number,
): DashboardOracle => dashboardOracle(defaultInput, currency, exchangeRate)

export const dashboardOracle = (
  input: CalculatorInput,
  currency: MoneyUnit,
  exchangeRate: number,
): DashboardOracle => {
  const calculatedInput = withCalculatedOfflineRevenue(input)
  const result = calculateBep(calculatedInput)

  return {
    combinedRevenue: formatMoney(
      calculatedInput.offlineMonthlyRevenue + calculatedInput.onlineMonthlyRevenue,
      currency,
      exchangeRate,
    ),
    combinedProfit: formatMoney(result.combinedMonthlyProfit, currency, exchangeRate),
    offlineProfit: formatMoney(result.offlineNetProfit, currency, exchangeRate, true),
    onlineProfit: formatMoney(result.onlineNetProfit, currency, exchangeRate, true),
    investmentAndPayback: `${formatMoney(result.initialCash, currency, exchangeRate, true)} · ${formatMonths(
      result.paybackMonths,
      "ko",
    )}`,
  }
}
