import { useCallback, useEffect, useMemo, useState } from "react"
import { calculateBep } from "./lib/calc"
import { defaultScenario, newId } from "./lib/defaults"
import { localized, t } from "./lib/i18n"
import {
  deleteMarketStoreFromSheets,
  deleteScenarioFromSheets,
  hasSheetsConfig,
  listMarketStores,
  listScenarios,
  saveMarketStoreToSheets,
  saveScenarioToSheets,
} from "./lib/sheetsApi"
import {
  loadMarketStores,
  loadScenarios,
  loadSettings,
  saveMarketStores,
  saveScenarios,
  saveSettings,
  type AppSettings,
} from "./lib/storage"
import type { CalculatorInput, MoneyUnit } from "./types/calculator"
import type { MarketStore } from "./types/market"
import type { Scenario, SyncState } from "./types/scenario"
import { Dashboard } from "./components/Dashboard"
import { InputPanel } from "./components/InputPanel"
import { LanguageCurrencySwitch } from "./components/LanguageCurrencySwitch"
import { MarketAnalysis } from "./components/MarketAnalysis"
import { ScenarioQuick } from "./components/ScenarioQuick"
import { ScenarioTable } from "./components/ScenarioTable"

export const App = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [scenarios, setScenarios] = useState<readonly Scenario[]>(() => loadScenarios())
  const [stores, setStores] = useState<readonly MarketStore[]>(() => loadMarketStores())
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => loadScenarios()[0]?.id ?? "default")
  const [input, setInput] = useState<CalculatorInput>(() => loadScenarios()[0]?.data ?? defaultScenario().data)
  const [saveName, setSaveName] = useState(() => loadScenarios()[0]?.name ?? "링크랜드 현재 가정")
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)
  const [syncState, setSyncState] = useState<SyncState>({
    kind: "local",
    message: "localStorage cache",
  })

  const sheetsConfig = useMemo(
    () => ({ url: settings.appsScriptUrl, writeKey: settings.writeKey }),
    [settings.appsScriptUrl, settings.writeKey],
  )
  const currency: MoneyUnit = settings.language === "zh" ? "CNY" : "KRW"
  const result = useMemo(() => calculateBep(input), [input])
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId)

  const applyScenarios = useCallback((next: readonly Scenario[]): void => {
    const visible = next.filter((scenario) => !scenario.isDeleted)
    setScenarios(visible)
    saveScenarios(visible)
    const first = visible[0]
    if (first !== undefined) {
      setActiveScenarioId(first.id)
      setInput(first.data)
      setSaveName(first.name)
    }
  }, [])

  const reload = useCallback(async (): Promise<void> => {
    if (!hasSheetsConfig(sheetsConfig)) {
      setSyncState({ kind: "local", message: localized("로컬 캐시 모드", "本地缓存模式", settings.language) })
      return
    }
    setSyncState({ kind: "syncing", message: localized("Sheets 불러오는 중", "正在读取 Sheets", settings.language) })
    try {
      const [sheetScenarios, sheetStores] = await Promise.all([
        listScenarios(sheetsConfig),
        listMarketStores(sheetsConfig),
      ])
      if (sheetScenarios.length > 0) applyScenarios(sheetScenarios)
      if (sheetStores.length > 0) {
        setStores(sheetStores)
        saveMarketStores(sheetStores)
      }
      setSyncState({ kind: "sheets", message: localized("Sheets 동기화 완료", "Sheets 同步完成", settings.language) })
    } catch (error) {
      if (error instanceof Error) {
        setSyncState({ kind: "error", message: `${localized("로컬 fallback", "本地回退", settings.language)}: ${error.message}` })
      } else {
        setSyncState({ kind: "error", message: localized("로컬 fallback", "本地回退", settings.language) })
      }
    }
  }, [applyScenarios, settings.language, sheetsConfig])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    void reload()
  }, [reload])

  const selectScenario = (scenario: Scenario): void => {
    setActiveScenarioId(scenario.id)
    setInput(scenario.data)
    setSaveName(scenario.name)
  }

  const upsertScenario = async (isNew: boolean): Promise<void> => {
    const now = new Date().toISOString()
    const scenario: Scenario = {
      id: isNew ? newId("scenario") : activeScenarioId,
      name: saveName.trim().length > 0 ? saveName.trim() : localized("새 시나리오", "新方案", settings.language),
      data: input,
      updatedAt: now,
      updatedBy: "browser",
      isDeleted: false,
    }
    const localNext = [scenario, ...scenarios.filter((candidate) => candidate.id !== scenario.id)]
    setScenarios(localNext)
    saveScenarios(localNext)
    setActiveScenarioId(scenario.id)
    if (!hasSheetsConfig(sheetsConfig)) return
    try {
      applyScenarios(await saveScenarioToSheets(sheetsConfig, scenario, isNew ? "addScenario" : "updateScenario"))
      setSyncState({ kind: "sheets", message: localized("Sheets 저장 완료", "Sheets 保存完成", settings.language) })
    } catch (error) {
      setSyncState({ kind: "error", message: error instanceof Error ? error.message : "save failed" })
    }
  }

  const deleteScenario = async (scenario: Scenario): Promise<void> => {
    const next = scenarios.filter((candidate) => candidate.id !== scenario.id)
    setScenarios(next)
    saveScenarios(next)
    if (scenario.id === activeScenarioId && next[0] !== undefined) selectScenario(next[0])
    if (!hasSheetsConfig(sheetsConfig)) return
    try {
      applyScenarios(await deleteScenarioFromSheets(sheetsConfig, scenario.id))
    } catch (error) {
      setSyncState({ kind: "error", message: error instanceof Error ? error.message : "delete failed" })
    }
  }

  const saveStore = async (store: MarketStore, isNew: boolean): Promise<void> => {
    const next = [store, ...stores.filter((candidate) => candidate.id !== store.id)]
    setStores(next)
    saveMarketStores(next)
    if (!hasSheetsConfig(sheetsConfig)) return
    try {
      const synced = await saveMarketStoreToSheets(sheetsConfig, store, isNew ? "addMarketStore" : "updateMarketStore")
      setStores(synced)
      saveMarketStores(synced)
    } catch (error) {
      setSyncState({ kind: "error", message: error instanceof Error ? error.message : "market save failed" })
    }
  }

  const deleteStore = async (store: MarketStore): Promise<void> => {
    const next = stores.filter((candidate) => candidate.id !== store.id)
    setStores(next)
    saveMarketStores(next)
    if (!hasSheetsConfig(sheetsConfig)) return
    try {
      const synced = await deleteMarketStoreFromSheets(sheetsConfig, store.id)
      setStores(synced)
      saveMarketStores(synced)
    } catch (error) {
      setSyncState({ kind: "error", message: error instanceof Error ? error.message : "market delete failed" })
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-[1680px] px-4 py-4 lg:px-6">
        <header className="mb-4 grid gap-3 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-semibold text-clay">{t("subtitle", settings.language)}</p>
            <h1 className="text-3xl font-black tracking-normal text-ink">{t("title", settings.language)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-steel">
              {localized(
                "GitHub Pages 정적 앱, Google Sheets 공용 DB, Apps Script JSONP API 기반",
                "基于 GitHub Pages 静态应用、Google Sheets 公共数据库、Apps Script JSONP API",
                settings.language,
              )}
            </p>
          </div>
          <LanguageCurrencySwitch
            settings={settings}
            syncMessage={syncState.message}
            onSettingsChange={setSettings}
            onReload={() => {
              void reload()
            }}
          />
        </header>
        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <InputPanel
            input={input}
            language={settings.language}
            highlightedKey={highlightedKey}
            onChange={setInput}
          />
          <section className="min-w-0 space-y-4">
            <Dashboard
              input={input}
              result={result}
              language={settings.language}
              currency={currency}
              exchangeRate={settings.exchangeRate}
              scenarioName={activeScenario?.name ?? saveName}
              saveName={saveName}
              onSaveNameChange={setSaveName}
              onOverwrite={() => {
                void upsertScenario(false)
              }}
              onSaveAs={() => {
                void upsertScenario(true)
              }}
              onHighlight={setHighlightedKey}
            />
            <ScenarioQuick
              scenarios={scenarios}
              activeId={activeScenarioId}
              language={settings.language}
              currency={currency}
              exchangeRate={settings.exchangeRate}
              onSelect={selectScenario}
            />
            <MarketAnalysis
              stores={stores}
              language={settings.language}
              currency={currency}
              exchangeRate={settings.exchangeRate}
              linklandRevenue={input.offlineMonthlyRevenue}
              onSave={(store, isNew) => {
                void saveStore(store, isNew)
              }}
              onDelete={(store) => {
                void deleteStore(store)
              }}
            />
            <ScenarioTable
              scenarios={scenarios}
              language={settings.language}
              currency={currency}
              exchangeRate={settings.exchangeRate}
              onSelect={selectScenario}
              onDelete={(scenario) => {
                void deleteScenario(scenario)
              }}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
