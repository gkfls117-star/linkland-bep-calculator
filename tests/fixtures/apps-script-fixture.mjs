import { createServer } from "node:http"

const args = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1])
}

const host = args.get("--host") ?? "127.0.0.1"
const port = Number(args.get("--port") ?? "4873")
const mode = args.get("--mode") ?? "ok"
const now = new Date().toISOString()

let scenarios = [
  {
    id: "qa_scenario_1",
    name: "QA 시나리오",
    dataJson: JSON.stringify({
      offlineMonthlyRevenue: 60000000,
      offlineMarginRate: 60,
      onlineMonthlyRevenue: 22000000,
      onlineMarginRate: 55,
      monthlyVisitors: 150000,
      avgOrderValue: 50000,
      conversionRate: 0.8,
      transferPremiumYear2: 250000000,
      transferPremiumYear3: 320000000,
      transferPremiumYear4: 380000000,
      transferPremiumYear5: 450000000,
      judgmentMemo: "QA fixture",
      offlineFixed: [],
      onlineCosts: [],
      investment: [],
    }),
    updatedAt: now,
    updatedBy: "fixture",
    isDeleted: false,
  },
]

let marketStores = [
  {
    id: "qa_store_1",
    nameKo: "QA 매장",
    nameZh: "QA 门店",
    categoryKo: "테스트",
    categoryZh: "测试",
    monthlyRevenue: 300000000,
    peakMonthlyRevenue: 400000000,
    avgOrderValue: 30000,
    conversion: 10,
    margin: 55,
    noteKo: "fixture",
    noteZh: "fixture",
    updatedAt: now,
    isDeleted: false,
  },
]

const sendJsonp = (response, callback, payload) => {
  const body = callback === null ? JSON.stringify(payload) : `${callback}(${JSON.stringify(payload)});`
  response.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": callback === null ? "application/json; charset=utf-8" : "application/javascript; charset=utf-8",
  })
  response.end(body)
}

const asString = (params, key, fallback = "") => params.get(key) ?? fallback
const asNumber = (params, key, fallback = 0) => {
  const value = Number(params.get(key) ?? "")
  return Number.isFinite(value) ? value : fallback
}

const listActive = (rows) => rows.filter((row) => row.isDeleted !== true)

const scenarioFromParams = (params) => ({
  id: asString(params, "id", `qa_scenario_${Date.now()}`),
  name: asString(params, "name", "QA 시나리오"),
  dataJson: asString(params, "dataJson", "{}"),
  updatedAt: new Date().toISOString(),
  updatedBy: asString(params, "updatedBy", "fixture"),
  isDeleted: false,
})

const marketStoreFromParams = (params) => ({
  id: asString(params, "id", `qa_store_${Date.now()}`),
  nameKo: asString(params, "nameKo", "QA 매장"),
  nameZh: asString(params, "nameZh", "QA 门店"),
  categoryKo: asString(params, "categoryKo", "테스트"),
  categoryZh: asString(params, "categoryZh", "测试"),
  monthlyRevenue: asNumber(params, "monthlyRevenue", 0),
  peakMonthlyRevenue: asNumber(params, "peakMonthlyRevenue", 0),
  avgOrderValue: asNumber(params, "avgOrderValue", 0),
  conversion: asNumber(params, "conversion", 0),
  margin: asNumber(params, "margin", 0),
  noteKo: asString(params, "noteKo", ""),
  noteZh: asString(params, "noteZh", ""),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
})

const server = createServer((request, response) => {
  const parsed = new URL(request.url ?? "/", `http://${host}:${port}`)
  if (parsed.pathname === "/__shutdown") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
    response.end(JSON.stringify({ status: "ok", shutdown: true }))
    setTimeout(() => server.close(), 10)
    return
  }

  if (parsed.pathname !== "/exec") {
    response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" })
    response.end(JSON.stringify({ status: "error", message: "not found" }))
    return
  }

  const callback = parsed.searchParams.get("callback")
  if (mode === "error") {
    sendJsonp(response, callback, { status: "error", message: "fixture error" })
    return
  }

  switch (parsed.searchParams.get("action")) {
    case "listScenarios":
      sendJsonp(response, callback, { status: "ok", scenarios: listActive(scenarios) })
      return
    case "addScenario":
    case "updateScenario": {
      const scenario = scenarioFromParams(parsed.searchParams)
      scenarios = [scenario, ...scenarios.filter((candidate) => candidate.id !== scenario.id)]
      sendJsonp(response, callback, { status: "ok", scenarios: listActive(scenarios) })
      return
    }
    case "deleteScenario":
      scenarios = scenarios.map((scenario) =>
        scenario.id === parsed.searchParams.get("id") ? { ...scenario, isDeleted: true } : scenario,
      )
      sendJsonp(response, callback, { status: "ok", scenarios: listActive(scenarios) })
      return
    case "listMarketStores":
      sendJsonp(response, callback, { status: "ok", marketStores: listActive(marketStores) })
      return
    case "addMarketStore":
    case "updateMarketStore": {
      const marketStore = marketStoreFromParams(parsed.searchParams)
      marketStores = [marketStore, ...marketStores.filter((candidate) => candidate.id !== marketStore.id)]
      sendJsonp(response, callback, { status: "ok", marketStores: listActive(marketStores) })
      return
    }
    case "deleteMarketStore":
      marketStores = marketStores.map((store) =>
        store.id === parsed.searchParams.get("id") ? { ...store, isDeleted: true } : store,
      )
      sendJsonp(response, callback, { status: "ok", marketStores: listActive(marketStores) })
      return
    default:
      sendJsonp(response, callback, { status: "error", message: "unknown action" })
  }
})

server.listen(port, host, () => {
  console.log(`apps-script fixture listening http://${host}:${port} mode=${mode}`)
})
