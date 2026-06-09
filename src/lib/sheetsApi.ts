import ky from "ky"
import type { MarketStore } from "../types/market"
import type { Scenario } from "../types/scenario"
import { normalizeMarketStores, normalizeScenarioRows } from "./normalize"

type SheetsAction =
  | "listScenarios"
  | "addScenario"
  | "updateScenario"
  | "deleteScenario"
  | "listMarketStores"
  | "addMarketStore"
  | "updateMarketStore"
  | "deleteMarketStore"

type ApiOkResponse = {
  readonly status: "ok"
  readonly scenarios?: unknown
  readonly marketStores?: unknown
}

type ApiErrorResponse = {
  readonly status: "error"
  readonly message: string
}

type ApiResponse = ApiOkResponse | ApiErrorResponse

type SheetsConfig = {
  readonly url: string
  readonly writeKey: string
}

export class SheetsApiError extends Error {
  constructor(readonly detail: string) {
    super(detail)
    this.name = "SheetsApiError"
  }
}

export const hasSheetsConfig = (config: SheetsConfig): boolean => config.url.trim().length > 0

export const listScenarios = async (config: SheetsConfig): Promise<readonly Scenario[]> => {
  const response = await request(config, "listScenarios", {})
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeScenarioRows(response.scenarios)
}

export const saveScenarioToSheets = async (
  config: SheetsConfig,
  scenario: Scenario,
  action: "addScenario" | "updateScenario",
): Promise<readonly Scenario[]> => {
  const response = await request(config, action, {
    id: scenario.id,
    name: scenario.name,
    dataJson: JSON.stringify(scenario.data),
    updatedBy: scenario.updatedBy,
  })
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeScenarioRows(response.scenarios)
}

export const deleteScenarioFromSheets = async (
  config: SheetsConfig,
  scenarioId: string,
): Promise<readonly Scenario[]> => {
  const response = await request(config, "deleteScenario", { id: scenarioId })
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeScenarioRows(response.scenarios)
}

export const listMarketStores = async (config: SheetsConfig): Promise<readonly MarketStore[]> => {
  const response = await request(config, "listMarketStores", {})
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeMarketStores(response.marketStores)
}

export const saveMarketStoreToSheets = async (
  config: SheetsConfig,
  store: MarketStore,
  action: "addMarketStore" | "updateMarketStore",
): Promise<readonly MarketStore[]> => {
  const response = await request(config, action, store)
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeMarketStores(response.marketStores)
}

export const deleteMarketStoreFromSheets = async (
  config: SheetsConfig,
  storeId: string,
): Promise<readonly MarketStore[]> => {
  const response = await request(config, "deleteMarketStore", { id: storeId })
  if (response.status === "error") throw new SheetsApiError(response.message)
  return normalizeMarketStores(response.marketStores)
}

const request = async (
  config: SheetsConfig,
  action: SheetsAction,
  payload: Record<string, string | number | boolean>,
): Promise<ApiResponse> => {
  if (!hasSheetsConfig(config)) return { status: "error", message: "Apps Script URL is empty" }
  return jsonpRequest(config, action, payload)
}

const jsonpRequest = (
  config: SheetsConfig,
  action: SheetsAction,
  payload: Record<string, string | number | boolean>,
): Promise<ApiResponse> =>
  new Promise((resolve, reject) => {
    const callbackName = `__linkland_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`
    const url = new URL(config.url)
    url.searchParams.set("callback", callbackName)
    url.searchParams.set("action", action)
    if (config.writeKey.trim().length > 0) url.searchParams.set("writeKey", config.writeKey)
    for (const [key, value] of Object.entries(payload)) {
      url.searchParams.set(key, String(value))
    }

    const script = document.createElement("script")
    const cleanup = (): void => {
      script.remove()
      Reflect.deleteProperty(window, callbackName)
    }

    Object.defineProperty(window, callbackName, {
      value: (response: ApiResponse): void => {
        cleanup()
        resolve(response)
      },
      configurable: true,
    })

    script.onerror = (): void => {
      cleanup()
      reject(new SheetsApiError("JSONP request failed"))
    }
    script.src = url.toString()
    document.body.appendChild(script)
  })

export const corsRequest = async (
  config: SheetsConfig,
  action: SheetsAction,
  payload: Record<string, string | number | boolean>,
): Promise<ApiResponse> => {
  const url = new URL(config.url)
  url.searchParams.set("action", action)
  if (config.writeKey.trim().length > 0) url.searchParams.set("writeKey", config.writeKey)
  for (const [key, value] of Object.entries(payload)) url.searchParams.set(key, String(value))
  return ky.get(url, { timeout: 15000 }).json<ApiResponse>()
}
