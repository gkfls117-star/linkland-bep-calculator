import type { CalculatorInput, Language } from "../types/calculator"
import { localized } from "../lib/i18n"
import { DynamicItemEditor } from "./DynamicItemEditor"

type InputPanelProps = {
  readonly input: CalculatorInput
  readonly language: Language
  readonly highlightedKey: string | null
  readonly onChange: (input: CalculatorInput) => void
}

export const InputPanel = ({ input, language, highlightedKey, onChange }: InputPanelProps) => {
  const setNumber = (key: keyof CalculatorInput, value: number): void => {
    onChange({ ...input, [key]: value })
  }

  return (
    <aside className="min-w-0 space-y-4 rounded-lg border border-line bg-white/90 p-4 shadow-tight lg:sticky lg:top-4">
      <div>
        <p className="text-xs font-semibold uppercase text-clay">
          {localized("좌측 입력값 패널", "左侧输入面板", language)}
        </p>
        <h2 className="text-xl font-bold text-ink">{localized("가정 조정", "调整假设", language)}</h2>
      </div>
      <div className="grid gap-2">
        {numberFields(language).map((field) => (
          <label
            key={field.key}
            className={`grid gap-1 text-xs text-steel ${highlightedKey === field.key ? "row-focus rounded" : ""}`}
          >
            {field.label}
            <input
              className="rounded-md border border-line px-2 py-2 text-right text-sm text-ink"
              type="number"
              value={Number(input[field.key])}
              onChange={(event) => setNumber(field.key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
      <DynamicItemEditor
        title={localized("오프라인 고정비", "线下固定费", language)}
        section="offlineFixed"
        language={language}
        items={input.offlineFixed}
        showRecoverable={false}
        onChange={(items) => onChange({ ...input, offlineFixed: items })}
      />
      <DynamicItemEditor
        title={localized("온라인 변동비/고정비", "线上变动费/固定费", language)}
        section="onlineCosts"
        language={language}
        items={input.onlineCosts}
        showRecoverable={false}
        onChange={(items) => onChange({ ...input, onlineCosts: items })}
      />
      <DynamicItemEditor
        title={localized("임차/초기 투자비", "租赁/初始投资", language)}
        section="investment"
        language={language}
        items={input.investment}
        showRecoverable={true}
        onChange={(items) => onChange({ ...input, investment: items })}
      />
      <label className="grid gap-1 text-xs text-steel">
        {localized("판단 메모", "判断备忘", language)}
        <textarea
          className="min-h-24 rounded-md border border-line px-2 py-2 text-sm text-ink"
          value={input.judgmentMemo}
          onChange={(event) => onChange({ ...input, judgmentMemo: event.target.value })}
        />
      </label>
    </aside>
  )
}

type NumberField = {
  readonly key: keyof Pick<
    CalculatorInput,
    | "offlineMonthlyRevenue"
    | "offlineMarginRate"
    | "onlineMonthlyRevenue"
    | "onlineMarginRate"
    | "monthlyVisitors"
    | "avgOrderValue"
    | "conversionRate"
    | "transferPremiumYear2"
    | "transferPremiumYear3"
    | "transferPremiumYear4"
    | "transferPremiumYear5"
  >
  readonly label: string
}

const numberFields = (language: Language): readonly NumberField[] => [
  { key: "offlineMonthlyRevenue", label: localized("오프라인 월매출", "线下月销售额", language) },
  { key: "offlineMarginRate", label: localized("오프라인 공헌이익률(%)", "线下贡献利润率(%)", language) },
  { key: "onlineMonthlyRevenue", label: localized("온라인 월매출", "线上月销售额", language) },
  { key: "onlineMarginRate", label: localized("온라인 공헌이익률(%)", "线上贡献利润率(%)", language) },
  { key: "monthlyVisitors", label: localized("월 방문객", "月访客", language) },
  { key: "avgOrderValue", label: localized("객단가", "客单价", language) },
  { key: "conversionRate", label: localized("전환율(%)", "转化率(%)", language) },
  { key: "transferPremiumYear2", label: localized("2년차 양도/권리금", "第2年转让费", language) },
  { key: "transferPremiumYear3", label: localized("3년차 양도/권리금", "第3年转让费", language) },
  { key: "transferPremiumYear4", label: localized("4년차 양도/권리금", "第4年转让费", language) },
  { key: "transferPremiumYear5", label: localized("5년차 양도/권리금", "第5年转让费", language) },
]
