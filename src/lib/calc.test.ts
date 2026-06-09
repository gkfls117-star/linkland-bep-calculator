import { describe, expect, it } from "vitest"
import { calculateBep, calculateOfflineMonthlyRevenue, marketMetrics } from "./calc"
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

  it("Given visitor assumptions When calculating offline revenue Then monthly sales are derived automatically", () => {
    const input = { ...defaultInput, offlineMonthlyRevenue: 1 }
    const result = calculateBep(input)

    expect(calculateOfflineMonthlyRevenue(input)).toBe(60000000)
    expect(result.offlineContribution).toBe(37200000)
  })

  it("Given locked online rate costs When calculating online profit Then they stay proportional to online revenue", () => {
    const input = {
      ...defaultInput,
      onlineMonthlyRevenue: 100000000,
      onlineCosts: defaultInput.onlineCosts.map((item) =>
        item.id === "online_platform" ? { ...item, type: "amount" as const } : item,
      ),
    }

    const result = calculateBep(input)

    expect(result.totals.onlineMonthlyCost).toBe(15300000)
  })

  it("Given recoverable investment When calculating payback Then only net investment is recovered", () => {
    const recoverableItem = defaultInput.investment.find((item) => item.id === "invest_deposit")
    const nonRecoverableItem = defaultInput.investment.find((item) => item.id === "invest_fitout")
    expect(recoverableItem).toBeDefined()
    expect(nonRecoverableItem).toBeDefined()
    if (recoverableItem === undefined || nonRecoverableItem === undefined) return

    const input = {
      ...defaultInput,
      offlineFixed: [],
      onlineCosts: [],
      onlineMonthlyRevenue: 0,
      investment: [
        { ...recoverableItem, value: 80000000, recoverable: true },
        { ...nonRecoverableItem, value: 20000000, recoverable: false },
      ],
    }

    const result = calculateBep(input)

    expect(result.initialCash).toBe(100000000)
    expect(result.totals.nonRecoverableInvestment).toBe(20000000)
    expect(result.paybackMonths).toBeCloseTo(20000000 / result.combinedMonthlyProfit)
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
