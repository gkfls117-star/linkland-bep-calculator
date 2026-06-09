import type { CalculatorResult, Language, MoneyUnit } from "../types/calculator"
import type { Scenario } from "../types/scenario"
import { calculateBep } from "../lib/calc"
import { formatMoney, formatMonths } from "../lib/format"
import { localized, t } from "../lib/i18n"
import { CardBlock } from "./CardBlock"

type ScenarioQuickProps = {
  readonly scenarios: readonly Scenario[]
  readonly activeId: string
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly onSelect: (scenario: Scenario) => void
}

export const ScenarioQuick = ({
  scenarios,
  activeId,
  language,
  currency,
  exchangeRate,
  onSelect,
}: ScenarioQuickProps) => (
  <CardBlock title={t("scenarioQuick", language)}>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {scenarios.slice(0, 4).map((scenario) => {
        const result = calculateBep(scenario.data)
        return (
          <button
            type="button"
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className={`rounded-lg border p-3 text-left hover:border-moss ${
              scenario.id === activeId ? "border-moss bg-moss/10" : "border-line bg-white"
            }`}
          >
            <p className="truncate text-sm font-bold text-ink">{scenario.name}</p>
            <p className="mt-2 text-xs text-steel">{localized("월 순이익", "月净利润", language)}</p>
            <p className="text-lg font-black text-ink">
              {formatMoney(result.combinedMonthlyProfit, currency, exchangeRate, true)}
            </p>
            <p className="text-xs text-steel">{formatMonths(result.paybackMonths, language)}</p>
          </button>
        )
      })}
    </div>
  </CardBlock>
)

export const scenarioResult = (scenario: Scenario): CalculatorResult => calculateBep(scenario.data)
