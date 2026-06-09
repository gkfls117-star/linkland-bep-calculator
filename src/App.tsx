import { useCallback, useEffect, useMemo, useState } from "react"
import { calculateBep, withCalculatedOfflineRevenue } from "./lib/calc"
import { defaultScenario, newId } from "./lib/defaults"
import { localized, t } from "./lib/i18n"
import {
  deleteMarketStoreFromSheets,
  deleteScenarioFromSheets,
  hasSheetsConfig,
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
import { useScenarioAutosave } from "./hooks/useScenarioAutosave"
import { useSheetsReload } from "./hooks/useSheetsReload"
import { Dashboard } from "./components/Dashboard"
import { InputPanel } from "./components/InputPanel"
import { LanguageCurrencySwitch } from "./components/LanguageCurrencySwitch"
import { MarketAnalysis } from "./components/MarketAnalysis"
import { ScenarioQuick } from "./components/ScenarioQuick"
import { ScenarioTable } from "./components/ScenarioTable"
import { SidebarNav } from "./components/SidebarNav"

export const App = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [scenarios, setScenarios] = useState<readonly Scenario[]>(() => loadScenarios())
  const [stores, setStores] = useState<readonly MarketStore[]>(() => loadMarketStores())
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => loadScenarios()[0]?.id ?? "default")
  const [input, setInput] = useState<CalculatorInput>(() =>
    withCalculatedOfflineRevenue(loadScenarios()[0]?.data ?? defaultScenario().data),
  )
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
    const visible = next
      .filter((scenario) => !scenario.isDeleted)
      .map((scenario) => ({ ...scenario, data: withCalculatedOfflineRevenue(scenario.data) }))
    setScenarios(visible)
    saveScenarios(visible)
    const first = visible[0]
    if (first !== undefined) {
      setActiveScenarioId(first.id)
      setInput(withCalculatedOfflineRevenue(first.data))
      setSaveName(first.name)
    }
  }, [])

  const { isReadyForAutosave, reload } = useSheetsReload({
    applyScenarios,
    language: settings.language,
    setStores,
    setSyncState,
    sheetsConfig,
  })

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useScenarioAutosave({
    activeScenarioId,
    applyScenarios,
    enabled: isReadyForAutosave,
    input,
    language: settings.language,
    saveName,
    setSyncState,
    sheetsConfig,
  })

  const selectScenario = (scenario: Scenario): void => {
    setActiveScenarioId(scenario.id)
    setInput(withCalculatedOfflineRevenue(scenario.data))
    setSaveName(scenario.name)
  }

  const upsertScenario = async (isNew: boolean): Promise<void> => {
    const now = new Date().toISOString()
    const scenario: Scenario = {
      id: isNew ? newId("scenario") : activeScenarioId,
      name: saveName.trim().length > 0 ? saveName.trim() : localized("새 시나리오", "新方案", settings.language),
      data: withCalculatedOfflineRevenue(input),
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
    <main className="min-h-screen bg-[#fbfaf8] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-4 py-5 lg:px-5">
        <header className="mb-5 grid gap-3 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-[26px] font-black tracking-normal text-[#05070d]">
              {localized("성수 연무장길 링크랜드 BEP / 임차 투자 계산기", "圣水练武场路 Linkland BEP / 租赁投资计算器", settings.language)}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6b625c]">
              {localized(
                "입력값 변경 시 대시보드가 바로 반영되는 안정 버전입니다.",
                "输入值变化时仪表盘会立即反映的稳定版本。",
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
        <div className="grid items-start gap-4 min-[1350px]:grid-cols-[150px_440px_minmax(0,1fr)]">
          <SidebarNav language={settings.language} />
          <InputPanel
            input={input}
            language={settings.language}
            highlightedKey={highlightedKey}
            onChange={(next) => setInput(withCalculatedOfflineRevenue(next))}
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
