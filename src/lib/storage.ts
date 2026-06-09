import type { Language } from "../types/calculator"
import type { MarketStore } from "../types/market"
import type { Scenario } from "../types/scenario"
import { DEFAULT_EXCHANGE_RATE, defaultMarketStores, defaultScenario } from "./defaults"
import { normalizeInput, normalizeMarketStores } from "./normalize"

const SCENARIOS_KEY = "linkland:bep:scenarios"
const MARKET_KEY = "linkland:bep:marketStores"
const SETTINGS_KEY = "linkland:bep:settings"

export type AppSettings = {
  readonly language: Language
  readonly exchangeRate: number
  readonly appsScriptUrl: string
  readonly writeKey: string
}

export const defaultSettings: AppSettings = {
  language: "ko",
  exchangeRate: DEFAULT_EXCHANGE_RATE,
  appsScriptUrl: import.meta.env["VITE_APPS_SCRIPT_URL"] ?? "",
  writeKey: import.meta.env["VITE_WRITE_KEY"] ?? "",
}

export const loadSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (raw === null) return defaultSettings
  try {
    const value: unknown = JSON.parse(raw)
    return normalizeStoredSettings(value, defaultSettings)
  } catch (error) {
    if (error instanceof SyntaxError) return defaultSettings
    throw error
  }
}

export const normalizeStoredSettings = (value: unknown, fallback: AppSettings): AppSettings => {
  if (!isRecord(value)) return fallback
  return {
    language: value["language"] === "zh" ? "zh" : "ko",
    exchangeRate:
      typeof value["exchangeRate"] === "number" ? value["exchangeRate"] : fallback.exchangeRate,
    appsScriptUrl: nonEmptyStringOrFallback(value["appsScriptUrl"], fallback.appsScriptUrl),
    writeKey: nonEmptyStringOrFallback(value["writeKey"], fallback.writeKey),
  }
}

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const loadScenarios = (): readonly Scenario[] => {
  const raw = localStorage.getItem(SCENARIOS_KEY)
  if (raw === null) return [defaultScenario()]
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return [defaultScenario()]
    return value
      .map((entry) => normalizeCachedScenario(entry))
      .filter((scenario) => scenario !== null)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  } catch (error) {
    if (error instanceof SyntaxError) return [defaultScenario()]
    throw error
  }
}

export const saveScenarios = (scenarios: readonly Scenario[]): void => {
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios))
}

export const loadMarketStores = (): readonly MarketStore[] => {
  const raw = localStorage.getItem(MARKET_KEY)
  if (raw === null) return defaultMarketStores
  try {
    const value: unknown = JSON.parse(raw)
    const stores = normalizeMarketStores(value)
    return stores.length > 0 ? stores : defaultMarketStores
  } catch (error) {
    if (error instanceof SyntaxError) return defaultMarketStores
    throw error
  }
}

export const saveMarketStores = (stores: readonly MarketStore[]): void => {
  localStorage.setItem(MARKET_KEY, JSON.stringify(stores))
}

const normalizeCachedScenario = (value: unknown): Scenario | null => {
  if (typeof value !== "object" || value === null) return null
  const record = value as Record<string, unknown>
  if (typeof record["id"] !== "string" || typeof record["name"] !== "string") return null
  return {
    id: record["id"],
    name: record["name"],
    data: normalizeInput(record["data"]),
    updatedAt: typeof record["updatedAt"] === "string" ? record["updatedAt"] : new Date().toISOString(),
    updatedBy: typeof record["updatedBy"] === "string" ? record["updatedBy"] : "local",
    isDeleted: record["isDeleted"] === true,
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const nonEmptyStringOrFallback = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback
