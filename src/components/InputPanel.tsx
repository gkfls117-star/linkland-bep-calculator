import type { CalculatorInput, Language } from "../types/calculator"
import { withCalculatedOfflineRevenue } from "../lib/calc"
import { localized } from "../lib/i18n"
import { DynamicItemEditor } from "./DynamicItemEditor"
import { FormattedNumberInput } from "./FormattedNumberInput"

type InputPanelProps = {
  readonly input: CalculatorInput
  readonly language: Language
  readonly highlightedKey: string | null
  readonly onChange: (input: CalculatorInput) => void
}

export const InputPanel = ({ input, language, highlightedKey, onChange }: InputPanelProps) => {
  const setNumber = (key: keyof CalculatorInput, value: number): void => {
    onChange(withCalculatedOfflineRevenue({ ...input, [key]: value }))
  }

  return (
    <aside className="soft-card min-w-0 space-y-4 p-5 lg:sticky lg:top-5">
      <div className="flex gap-3">
        <button type="button" className="rounded-md bg-[#111827] px-5 py-2 text-sm font-black text-white">
          {localized("오프라인 ON", "线下 ON", language)}
        </button>
        <button type="button" className="rounded-md bg-[#111827] px-5 py-2 text-sm font-black text-white">
          {localized("온라인 ON", "线上 ON", language)}
        </button>
      </div>
      {(["offline", "cost", "online", "transfer"] as const).map((group) => (
        <div key={group} className="grid gap-2">
          <p className={sectionClass(group)}>{sectionTitle(group, language)}</p>
          {numberFields(language)
            .filter((field) => field.group === group)
            .map((field) => (
              <label key={field.key} className={rowClass(highlightedKey === field.key)}>
                <span>{field.label}</span>
                <FormattedNumberInput
                  className="w-36"
                  decimals={field.unit === "%" ? 2 : 0}
                  readOnly={field.readOnly === true}
                  value={Number(input[field.key])}
                  onChange={(value) => {
                    if (field.readOnly !== true) setNumber(field.key, value)
                  }}
                />
                <span className="w-8 text-xs text-[#7b746d]">{field.unit}</span>
              </label>
            ))}
        </div>
      ))}
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
          className="min-h-20 rounded-md border border-[#d9cfc1] bg-white px-3 py-2 text-sm text-[#1f2937]"
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
  readonly unit: string
  readonly group: "offline" | "cost" | "online" | "transfer"
  readonly readOnly?: boolean
}

const numberFields = (language: Language): readonly NumberField[] => [
  { key: "monthlyVisitors", label: localized("월 방문객", "月访客", language), unit: localized("명", "人", language), group: "offline" },
  { key: "conversionRate", label: localized("구매 전환율", "购买转化率", language), unit: "%", group: "offline" },
  { key: "avgOrderValue", label: localized("객단가", "客单价", language), unit: localized("원", "韩元", language), group: "offline" },
  { key: "offlineMonthlyRevenue", label: localized("오프라인 월매출", "线下月销售额", language), unit: localized("원", "韩元", language), group: "offline", readOnly: true },
  { key: "offlineMarginRate", label: localized("자체 제조 제품 원가율", "自制产品成本率", language), unit: "%", group: "cost" },
  { key: "onlineMonthlyRevenue", label: localized("온라인 월매출", "线上月销售额", language), unit: localized("원", "韩元", language), group: "online" },
  { key: "onlineMarginRate", label: localized("온라인 제품 원가율", "线上产品成本率", language), unit: "%", group: "online" },
  { key: "transferPremiumYear2", label: localized("2년차 권리금", "第2年转让费", language), unit: localized("원", "韩元", language), group: "transfer" },
  { key: "transferPremiumYear3", label: localized("3년차 권리금", "第3年转让费", language), unit: localized("원", "韩元", language), group: "transfer" },
  { key: "transferPremiumYear4", label: localized("4년차 권리금", "第4年转让费", language), unit: localized("원", "韩元", language), group: "transfer" },
  { key: "transferPremiumYear5", label: localized("5년차 권리금", "第5年转让费", language), unit: localized("원", "韩元", language), group: "transfer" },
]

const rowClass = (active: boolean): string =>
  `grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm text-[#4f4841] ${
    active ? "row-focus rounded-md" : ""
  }`

const sectionClass = (group: NumberField["group"]): string => {
  const color = group === "online" ? "bg-[#edf7ff] text-[#0369a1]" : "bg-[#fbf5df] text-[#b45309]"
  return `rounded-xl px-3 py-2 text-sm font-black ${color}`
}

const sectionTitle = (group: NumberField["group"], language: Language): string => {
  switch (group) {
    case "offline":
      return localized("오프라인 유입/전환", "线下流量/转化", language)
    case "cost":
      return localized("자체 제조 원가율 / 변동비", "自制成本率 / 变动费", language)
    case "online":
      return localized("온라인 판매", "线上销售", language)
    case "transfer":
      return localized("양도/권리금 회수", "转让费回收", language)
  }
}
