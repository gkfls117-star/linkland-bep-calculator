import type { CalculatorInput, CalculatorResult, Language, MoneyUnit } from "../types/calculator"
import type { MarketStore } from "../types/market"
import type { Scenario } from "../types/scenario"
import { Dashboard } from "./Dashboard"
import { MarketAnalysis } from "./MarketAnalysis"
import { ScenarioQuick } from "./ScenarioQuick"
import { ScenarioTable } from "./ScenarioTable"

type ResultsSectionProps = {
  readonly input: CalculatorInput
  readonly result: CalculatorResult
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly scenarioName: string
  readonly saveName: string
  readonly onSaveNameChange: (name: string) => void
  readonly onOverwrite: () => void
  readonly onSaveAs: () => void
  readonly onResetDefault: () => void
  readonly onHighlight: (key: string | null) => void
  readonly scenarios: readonly Scenario[]
  readonly activeScenarioId: string
  readonly onSelectScenario: (scenario: Scenario) => void
  readonly stores: readonly MarketStore[]
  readonly onSaveStore: (store: MarketStore, isNew: boolean) => void
  readonly onDeleteStore: (store: MarketStore) => void
  readonly onDeleteScenario: (scenario: Scenario) => void
}

export const ResultsSection = ({
  input,
  result,
  language,
  currency,
  exchangeRate,
  scenarioName,
  saveName,
  onSaveNameChange,
  onOverwrite,
  onSaveAs,
  onResetDefault,
  onHighlight,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  stores,
  onSaveStore,
  onDeleteStore,
  onDeleteScenario,
}: ResultsSectionProps) => (
  <section className="min-w-0 space-y-4">
    <Dashboard
      input={input}
      result={result}
      language={language}
      currency={currency}
      exchangeRate={exchangeRate}
      scenarioName={scenarioName}
      saveName={saveName}
      onSaveNameChange={onSaveNameChange}
      onOverwrite={onOverwrite}
      onSaveAs={onSaveAs}
      onResetDefault={onResetDefault}
      onHighlight={onHighlight}
    />
    <ScenarioQuick
      currentInput={input}
      scenarios={scenarios}
      activeId={activeScenarioId}
      language={language}
      currency={currency}
      exchangeRate={exchangeRate}
      onSelect={onSelectScenario}
    />
    <section id="market" className="scroll-mt-5">
      <MarketAnalysis
        stores={stores}
        language={language}
        currency={currency}
        exchangeRate={exchangeRate}
        linklandRevenue={input.offlineMonthlyRevenue}
        onSave={onSaveStore}
        onDelete={onDeleteStore}
      />
    </section>
    <section id="scenarios" className="scroll-mt-5">
      <ScenarioTable
        scenarios={scenarios}
        language={language}
        currency={currency}
        exchangeRate={exchangeRate}
        onSelect={onSelectScenario}
        onDelete={onDeleteScenario}
      />
    </section>
  </section>
)
