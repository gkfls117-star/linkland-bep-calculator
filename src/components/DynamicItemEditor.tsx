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
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-steel hover:border-moss hover:text-moss"
          onClick={add}
        >
          <Plus size={14} /> {localized("항목 추가", "添加项目", language)}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="grid min-w-0 grid-cols-12 gap-2 rounded-md border border-line p-2">
            <input
              className="col-span-12 rounded border border-line px-2 py-1 text-sm md:col-span-3"
              value={language === "zh" ? item.nameZh : item.nameKo}
              onChange={(event) =>
                update(item.id, language === "zh" ? { nameZh: event.target.value } : { nameKo: event.target.value })
              }
            />
            <input
              className="col-span-5 rounded border border-line px-2 py-1 text-right text-sm md:col-span-3"
              type="number"
              value={item.value}
              onChange={(event) => update(item.id, { value: Number(event.target.value) })}
            />
            <select
              className="col-span-3 rounded border border-line px-2 py-1 text-sm md:col-span-2"
              value={item.type}
              onChange={(event) =>
                update(item.id, { type: event.target.value === "rate" ? "rate" : "amount" })
              }
            >
              <option value="amount">{localized("금액", "金额", language)}</option>
              <option value="rate">{localized("비율", "比例", language)}</option>
            </select>
            <input
              className="col-span-2 rounded border border-line px-2 py-1 text-sm md:col-span-1"
              value={item.unit}
              onChange={(event) => update(item.id, { unit: event.target.value })}
            />
            {showRecoverable && (
              <label className="col-span-8 flex items-center gap-2 text-xs text-steel md:col-span-2">
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
              className="col-span-2 inline-flex items-center justify-center rounded border border-line text-steel hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-30 md:col-span-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
