import { Plus, Trash2 } from "lucide-react"
import type { DynamicItem, ExpenseSection, Language } from "../types/calculator"
import { createItem } from "../lib/defaults"
import { localized } from "../lib/i18n"

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
          <div key={item.id} className="grid min-w-0 grid-cols-[1fr_86px_56px_28px_72px_32px] items-center gap-2 rounded-md border border-[#dfd5c7] bg-[#fffdfa] p-2">
            <input
              className="rounded border border-[#d9cfc1] bg-white px-2 py-2 text-sm"
              value={language === "zh" ? item.nameZh : item.nameKo}
              onChange={(event) =>
                update(item.id, language === "zh" ? { nameZh: event.target.value } : { nameKo: event.target.value })
              }
            />
            <input
              className="rounded border border-[#d9cfc1] bg-white px-2 py-2 text-right text-sm"
              type="number"
              value={item.value}
              onChange={(event) => update(item.id, { value: Number(event.target.value) })}
            />
            <select
              className="rounded border border-[#d9cfc1] bg-white px-1 py-2 text-xs"
              value={item.type}
              onChange={(event) =>
                update(item.id, { type: event.target.value === "rate" ? "rate" : "amount" })
              }
            >
              <option value="amount">{localized("금액", "金额", language)}</option>
              <option value="rate">{localized("비율", "比例", language)}</option>
            </select>
            <input
              className="rounded border border-[#d9cfc1] bg-white px-1 py-2 text-center text-xs"
              value={item.unit}
              onChange={(event) => update(item.id, { unit: event.target.value })}
            />
            {showRecoverable ? (
              <label className="flex items-center gap-1 text-xs text-[#5f6f7a]">
                <input
                  type="checkbox"
                  checked={item.recoverable === true}
                  onChange={(event) => update(item.id, { recoverable: event.target.checked })}
                />
                {localized("회수 가능", "可回收", language)}
              </label>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={!item.removable}
              onClick={() => onChange(items.filter((candidate) => candidate.id !== item.id))}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#d9cfc1] text-[#5f6f7a] hover:border-[#c65d3b] hover:text-[#c65d3b] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
