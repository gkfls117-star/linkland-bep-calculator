import { describe, expect, it } from "vitest"
import { calculateBep, marketMetrics } from "./calc"
import { defaultInput, defaultMarketStores } from "./defaults"

describe("calculateBep", () => {
  it("Given default Linkland inputs When calculating BEP Then it returns a high-risk no-payback baseline", () => {
    const result = calculateBep(defaultInput)

    expect(result.offlineNetProfit).toBe(-11800000)
    expect(result.onlineNetProfit).toBeCloseTo(7330000, 0)
    expect(result.combinedMonthlyProfit).toBeCloseTo(-4470000, 0)
    expect(result.paybackMonths).toBeNull()
    expect(result.riskLevel).toBe("high")
  })

  it("Given a recoverable investment item When calculating totals Then recoverable cash is tracked separately", () => {
    const result = calculateBep(defaultInput)

    expect(result.initialCash).toBe(760000000)
    expect(result.recoverableInvestment).toBe(580000000)
    expect(result.totals.nonRecoverableInvestment).toBe(180000000)
  })
})

describe("marketMetrics", () => {
  it("Given Hetras Seongsu data When deriving visitor metrics Then customers and visitors match the sheet assumptions", () => {
    const hetras = defaultMarketStores[0]
    expect(hetras).toBeDefined()
    if (hetras === undefined) return

    const metrics = marketMetrics(hetras, defaultInput.offlineMonthlyRevenue)

    expect(metrics.monthlyCustomers).toBe(30000)
    expect(metrics.requiredVisitors).toBe(150000)
    expect(metrics.dailyVisitors).toBe(5000)
    expect(metrics.revenueRatioToLinkland).toBe(25)
  })
})
