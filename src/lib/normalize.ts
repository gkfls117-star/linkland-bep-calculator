import { z } from "zod"
import type { CalculatorInput } from "../types/calculator"
import type { MarketStore } from "../types/market"
import type { Scenario, ScenarioRow } from "../types/scenario"
import { withCalculatedOfflineRevenue } from "./calc"
import { defaultInput } from "./defaults"

const itemSchema = z.object({
  id: z.string(),
  nameKo: z.string(),
  nameZh: z.string(),
  value: z.number().finite(),
  unit: z.string(),
  type: z.union([z.literal("amount"), z.literal("rate")]),
  recoverable: z.boolean().default(false),
  removable: z.boolean(),
})

const inputSchema = z.object({
  offlineEnabled: z.boolean().default(true),
  onlineEnabled: z.boolean().default(true),
  offlineMonthlyRevenue: z.number().finite(),
  offlineMarginRate: z.number().finite(),
  onlineMonthlyRevenue: z.number().finite(),
  onlineMarginRate: z.number().finite(),
  monthlyVisitors: z.number().finite(),
  avgOrderValue: z.number().finite(),
  conversionRate: z.number().finite(),
  transferPremiumYear2: z.number().finite(),
  transferPremiumYear3: z.number().finite(),
  transferPremiumYear4: z.number().finite(),
  transferPremiumYear5: z.number().finite(),
  judgmentMemo: z.string(),
  offlineFixed: z.array(itemSchema),
  onlineCosts: z.array(itemSchema),
  investment: z.array(itemSchema),
})

const scenarioRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataJson: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
  isDeleted: z.boolean(),
})

const marketStoreSchema = z.object({
  id: z.string(),
  nameKo: z.string(),
  nameZh: z.string(),
  categoryKo: z.string(),
  categoryZh: z.string(),
  monthlyRevenue: z.number().finite(),
  peakMonthlyRevenue: z.number().finite(),
  avgOrderValue: z.number().finite(),
  conversion: z.number().finite(),
  margin: z.number().finite(),
  noteKo: z.string(),
  noteZh: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean(),
})

export const normalizeInput = (value: unknown): CalculatorInput => {
  const parsed = inputSchema.safeParse(value)
  if (parsed.success) return withCalculatedOfflineRevenue(parsed.data)
  return withCalculatedOfflineRevenue(defaultInput)
}

export const normalizeScenarioRows = (value: unknown): readonly Scenario[] => {
  const rowArray = z.array(scenarioRowSchema).safeParse(value)
  if (!rowArray.success) return []
  return rowArray.data
    .filter((row) => !row.isDeleted)
    .map((row) => ({
      id: row.id,
      name: row.name,
      data: parseScenarioData(row.dataJson),
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
      isDeleted: row.isDeleted,
    }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

export const normalizeMarketStores = (value: unknown): readonly MarketStore[] => {
  const parsed = z.array(marketStoreSchema).safeParse(value)
  if (!parsed.success) return []
  return parsed.data
    .filter((store) => !store.isDeleted)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

const parseScenarioData = (dataJson: string): CalculatorInput => {
  try {
    return normalizeInput(JSON.parse(dataJson))
  } catch (error) {
    if (error instanceof SyntaxError) return defaultInput
    throw error
  }
}
