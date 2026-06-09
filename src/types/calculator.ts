export type Language = "ko" | "zh"

export type MoneyUnit = "KRW" | "CNY"

export type ItemType = "amount" | "rate"

export type ExpenseSection = "offlineFixed" | "onlineCosts" | "investment"

export type DynamicItem = {
  readonly id: string
  readonly nameKo: string
  readonly nameZh: string
  readonly value: number
  readonly unit: string
  readonly type: ItemType
  readonly recoverable: boolean
  readonly removable: boolean
}

export type CalculatorInput = {
  readonly offlineMonthlyRevenue: number
  readonly offlineMarginRate: number
  readonly onlineMonthlyRevenue: number
  readonly onlineMarginRate: number
  readonly monthlyVisitors: number
  readonly avgOrderValue: number
  readonly conversionRate: number
  readonly transferPremiumYear2: number
  readonly transferPremiumYear3: number
  readonly transferPremiumYear4: number
  readonly transferPremiumYear5: number
  readonly judgmentMemo: string
  readonly offlineFixed: readonly DynamicItem[]
  readonly onlineCosts: readonly DynamicItem[]
  readonly investment: readonly DynamicItem[]
}

export type SectionTotals = {
  readonly offlineFixedMonthly: number
  readonly onlineMonthlyCost: number
  readonly initialCash: number
  readonly recoverableInvestment: number
  readonly nonRecoverableInvestment: number
}

export type CalculatorResult = {
  readonly offlineContribution: number
  readonly offlineNetProfit: number
  readonly onlineContribution: number
  readonly onlineNetProfit: number
  readonly combinedMonthlyProfit: number
  readonly yearlyProfit: number
  readonly initialCash: number
  readonly recoverableInvestment: number
  readonly paybackMonths: number | null
  readonly offlineBepRevenue: number
  readonly offlineBepVisitors: number
  readonly riskLevel: "low" | "medium" | "high"
  readonly transferRecovery: readonly TransferRecovery[]
  readonly totals: SectionTotals
}

export type TransferRecovery = {
  readonly year: 2 | 3 | 4 | 5
  readonly premium: number
  readonly cumulativeProfit: number
  readonly recoveredAmount: number
  readonly roiRate: number
}
