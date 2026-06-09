export type MarketStore = {
  readonly id: string
  readonly nameKo: string
  readonly nameZh: string
  readonly categoryKo: string
  readonly categoryZh: string
  readonly monthlyRevenue: number
  readonly peakMonthlyRevenue: number
  readonly avgOrderValue: number
  readonly conversion: number
  readonly margin: number
  readonly noteKo: string
  readonly noteZh: string
  readonly updatedAt: string
  readonly isDeleted: boolean
}

export type MarketMetrics = {
  readonly monthlyCustomers: number
  readonly requiredVisitors: number
  readonly dailyVisitors: number
  readonly revenueRatioToLinkland: number
}
