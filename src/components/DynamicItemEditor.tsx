import { Plus, Trash2 } from "lucide-react"
import type { DynamicItem, ExpenseSection, Language } from "../types/calculator"
import { createItem } from "../lib/defaults"
import { localized } from "../lib/i18n"
import { EditableText } from "./EditableText"
import { FormattedNumberInput } from "./FormattedNumberInput"

type DynamicItemEditorProps = {
  readonly title: string
  readonly section: ExpenseSection
  readonly language: Language
  readonly items: readonly DynamicItem[]
  readonly showRecoverable: boolean
  readonly onChange: (items: readonly DynamicItem[]) => void
}

export const DynamicItemEditor = ({
  title,
  section,
  language,
  items,
  showRecoverable,
  onChange,
}: DynamicItemEditorProps) => {
  const update = (itemId: string, patch: Partial<DynamicItem>): void => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
  }

  const updateType = (item: DynamicItem, type: DynamicItem["type"]): void => {
    update(item.id, { type, unit: type === "rate" ? "%" : localized("원", "元", language) })
  }

  const add = (): void => {
    onChange([
      ...items,
      createItem(section, localized("새 항목", "新项目", language), "新项目", 0, "월", "amount", false),
    ])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#1f1b16]">{title}</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-[#d9cfc1] bg-white px-3 py-1 text-xs font-bold text-[#5f6f7a] hover:border-[#4f6f5a]"
          onClick={add}
        >
          <Plus size={14} /> {localized("항목 추가", "添加项目", language)}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_144px_76px_28px_auto] items-center gap-2 rounded-md border border-[#dfd5c7] bg-[#fffdfa] p-2"
          >
            <EditableText
              ariaLabel={localized("항목명 수정", "编辑项目名", language)}
              className="min-w-0 px-2"
              inputClassName="min-w-0"
              value={language === "zh" ? item.nameZh : item.nameKo}
              onChange={(value) =>
                update(item.id, language === "zh" ? { nameZh: value } : { nameKo: value })
              }
            />
            <FormattedNumberInput
              decimals={item.type === "rate" ? 2 : 0}
              value={item.value}
              onChange={(value) => update(item.id, { value })}
            />
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-[#1f2937] outline-none focus:border-[#111827]"
              value={item.type}
              onChange={(event) => updateType(item, event.target.value === "rate" ? "rate" : "amount")}
            >
              <option value="amount">{localized("금액", "金额", language)}</option>
              <option value="rate">{localized("비율", "比例", language)}</option>
            </select>
            <span className="text-center text-xs text-[#7b746d]">
              {item.type === "rate" ? "%" : localized("원", "元", language)}
            </span>
            <div className="flex items-center justify-end gap-2">
              {showRecoverable && (
                <label className="flex items-center gap-1 whitespace-nowrap text-xs text-[#5f6f7a]">
                  <input
                    type="checkbox"
                    checked={item.recoverable === true}
                    onChange={(event) => update(item.id, { recoverable: event.target.checked })}
                  />
                  {localized("회수 가능", "可回收", language)}
                </label>
              )}
              <button
                type="button"
                disabled={!item.removable}
                onClick={() => onChange(items.filter((candidate) => candidate.id !== item.id))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-[#5f6f7a] hover:border-[#c65d3b] hover:text-[#c65d3b] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
