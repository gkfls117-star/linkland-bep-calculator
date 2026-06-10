import { useCallback, useEffect, useMemo, useState } from "react"
import { calculateBep, withCalculatedOfflineRevenue } from "./lib/calc"
import {
  defaultScenario,
  isDefaultJudgmentMemo,
  isDefaultScenarioName,
  localizedDefaultJudgmentMemo,
  localizedDefaultScenarioName,
  newId,
} from "./lib/defaults"
import { localized } from "./lib/i18n"
import {
  deleteMarketStoreFromSheets,
  deleteScenarioFromSheets,
  hasSheetsConfig,
  saveMarketStoreToSheets,
  saveScenarioToSheets,
} from "./lib/sheetsApi"
import {
  loadMarketStores,
  loadActiveScenarioId,
  loadScenarios,
  loadSettings,
  saveActiveScenarioId,
  saveMarketStores,
  saveScenarios,
  saveSettings,
  scenarioByIdOrFirst,
  type AppSettings,
  withDefaultScenarioFallback,
} from "./lib/storage"
import type { CalculatorInput, Language, MoneyUnit } from "./types/calculator"
import type { MarketStore } from "./types/market"
import type { Scenario, SyncState } from "./types/scenario"
import { useScenarioAutosave } from "./hooks/useScenarioAutosave"
import { useSheetsReload } from "./hooks/useSheetsReload"
import { AppHeader } from "./components/AppHeader"
import { InputPanel } from "./components/InputPanel"
import { ResultsSection } from "./components/ResultsSection"
import { SidebarNav } from "./components/SidebarNav"

export const App = () => {
  const [initialScenario] = useState(() => {
    const initialScenarios = loadScenarios()
    return {
      active: scenarioByIdOrFirst(initialScenarios, loadActiveScenarioId()),
      scenarios: initialScenarios,
    }
  })
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [scenarios, setScenarios] = useState<readonly Scenario[]>(initialScenario.scenarios)
  const [stores, setStores] = useState<readonly MarketStore[]>(() => loadMarketStores())
  const [activeScenarioId, setActiveScenarioId] = useState<string>(initialScenario.active.id)
  const [input, setInput] = useState<CalculatorInput>(() =>
    withCalculatedOfflineRevenue(initialScenario.active.data),
  )
  const [saveName, setSaveName] = useState(() => initialScenario.active.name)
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
  const displayScenarios = useMemo(
    () => scenarios.map((scenario) => localizeDefaultScenarioForDisplay(scenario, settings.language)),
    [scenarios, settings.language],
  )
  const activeScenario = displayScenarios.find((scenario) => scenario.id === activeScenarioId)

  const applyScenarios = useCallback((next: readonly Scenario[]): void => {
    const visible = withDefaultScenarioFallback(next
      .filter((scenario) => !scenario.isDeleted)
      .map((scenario) => ({ ...scenario, data: withCalculatedOfflineRevenue(scenario.data) })))
    setScenarios(visible)
    saveScenarios(visible)
    const selected = scenarioByIdOrFirst(visible, loadActiveScenarioId())
    setActiveScenarioId(selected.id)
    saveActiveScenarioId(selected.id)
    setInput(withCalculatedOfflineRevenue(selected.data))
    setSaveName(isDefaultScenarioName(selected.name) ? localizedDefaultScenarioName(settings.language) : selected.name)
  }, [settings.language])

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

  useEffect(() => {
    setSaveName((current) =>
      isDefaultScenarioName(current) ? localizedDefaultScenarioName(settings.language) : current,
    )
    setInput((current) =>
      isDefaultJudgmentMemo(current.judgmentMemo)
        ? { ...current, judgmentMemo: localizedDefaultJudgmentMemo(settings.language) }
        : current,
    )
  }, [settings.language])

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
    saveActiveScenarioId(scenario.id)
    setInput(withCalculatedOfflineRevenue(scenario.data))
    setSaveName(isDefaultScenarioName(scenario.name) ? localizedDefaultScenarioName(settings.language) : scenario.name)
  }

  const resetDefaultScenario = (): void => {
    const scenario = defaultScenario()
    const next = [scenario, ...scenarios.filter((candidate) => candidate.id !== scenario.id)]
    setScenarios(next)
    saveScenarios(next)
    selectScenario(scenario)
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
    saveActiveScenarioId(scenario.id)
    if (!hasSheetsConfig(sheetsConfig)) return
    try {
      applyScenarios(await saveScenarioToSheets(sheetsConfig, scenario, isNew ? "addScenario" : "updateScenario"))
      setSyncState({ kind: "sheets", message: localized("Sheets 저장 완료", "Sheets 保存完成", settings.language) })
    } catch (error) {
      setSyncState({ kind: "error", message: error instanceof Error ? error.message : "save failed" })
    }
  }

  const deleteScenario = async (scenario: Scenario): Promise<void> => {
    const next = withDefaultScenarioFallback(scenarios.filter((candidate) => candidate.id !== scenario.id))
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
        <AppHeader
          settings={settings}
          syncMessage={syncState.message}
          onSettingsChange={setSettings}
          onReload={() => {
            void reload()
          }}
        />
        <div className="grid items-start gap-4 min-[1350px]:grid-cols-[150px_440px_minmax(0,1fr)]">
          <SidebarNav language={settings.language} />
          <InputPanel
            input={input}
            language={settings.language}
            highlightedKey={highlightedKey}
            onChange={(next) => setInput(withCalculatedOfflineRevenue(next))}
          />
          <ResultsSection
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
            onResetDefault={resetDefaultScenario}
            onHighlight={setHighlightedKey}
            scenarios={displayScenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={selectScenario}
            stores={stores}
            onSaveStore={(store, isNew) => {
              void saveStore(store, isNew)
            }}
            onDeleteStore={(store) => {
              void deleteStore(store)
            }}
            onDeleteScenario={(scenario) => {
              void deleteScenario(scenario)
            }}
          />
        </div>
      </div>
    </main>
  )
}

const localizeDefaultScenarioForDisplay = (scenario: Scenario, language: Language): Scenario => {
  if (scenario.id !== "default_linkland") return scenario
  return {
    ...scenario,
    name: isDefaultScenarioName(scenario.name) ? localizedDefaultScenarioName(language) : scenario.name,
    data: {
      ...scenario.data,
      judgmentMemo: isDefaultJudgmentMemo(scenario.data.judgmentMemo)
        ? localizedDefaultJudgmentMemo(language)
        : scenario.data.judgmentMemo,
    },
  }
}
