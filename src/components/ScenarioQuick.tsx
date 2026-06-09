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
  <CardBlock title={t("scenarioQuick", language)} className="p-5">
    <p className="mb-3 text-sm text-[#6b625c]">
      {localized("시나리오를 불러와도 입력값에 바로 반영됩니다. 저장은 좌측 하단 박스에서 합니다.", "载入方案会立即反映到输入值。保存请使用右侧保存框。", language)}
    </p>
    <div className="mb-3 rounded-2xl bg-[#f4f2ee] px-4 py-3 text-sm font-bold text-[#4f4841]">
      {localized("현재 합산이익", "当前合计利润", language)}{" "}
      {scenarios[0] !== undefined
        ? formatMoney(calculateBep(scenarios[0].data).combinedMonthlyProfit, currency, exchangeRate, true)
        : "-"}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-[#f4f2ee] text-xs text-[#4f4841]">
          <tr>
            <th className="px-3 py-3 text-left">{localized("시나리오", "方案", language)}</th>
            <th className="px-3 py-3 text-right">{localized("합산매출", "合计销售额", language)}</th>
            <th className="px-3 py-3 text-right">{localized("합산이익", "合计利润", language)}</th>
            <th className="px-3 py-3 text-right">{localized("순투자 회수", "净投资回收", language)}</th>
            <th className="px-3 py-3 text-center">{localized("작업", "操作", language)}</th>
          </tr>
        </thead>
        <tbody>
      {scenarios.slice(0, 4).map((scenario) => {
        const result = calculateBep(scenario.data)
        return (
          <tr key={scenario.id} className={`border-b border-slate-200 ${scenario.id === activeId ? "bg-[#fffbed]" : ""}`}>
            <td className="px-3 py-3 font-bold text-[#111827]">{scenario.name}</td>
            <td className="px-3 py-3 text-right">{formatMoney(scenario.data.offlineMonthlyRevenue + scenario.data.onlineMonthlyRevenue, currency, exchangeRate, true)}</td>
            <td className="px-3 py-3 text-right">{formatMoney(result.combinedMonthlyProfit, currency, exchangeRate, true)}</td>
            <td className="px-3 py-3 text-right">{formatMonths(result.paybackMonths, language)}</td>
            <td className="px-3 py-3 text-center">
              <button type="button" onClick={() => onSelect(scenario)} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#111827] shadow-sm">
                {localized("불러오기", "载入", language)}
              </button>
            </td>
          </tr>
        )
      })}
        </tbody>
      </table>
    </div>
  </CardBlock>
)

export const scenarioResult = (scenario: Scenario): CalculatorResult => calculateBep(scenario.data)
