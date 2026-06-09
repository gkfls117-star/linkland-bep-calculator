import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
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
  const [openTypeItemId, setOpenTypeItemId] = useState<string | null>(null)

  const update = (itemId: string, patch: Partial<DynamicItem>): void => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
  }

  const updateType = (item: DynamicItem, type: DynamicItem["type"]): void => {
    update(item.id, { type, unit: type === "rate" ? "%" : localized("원", "元", language) })
    setOpenTypeItemId(null)
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
          <div key={item.id} className="space-y-1">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_144px_34px_32px] items-center gap-2 rounded-md py-1 text-sm text-[#4f4841] transition-colors hover:bg-[#faf8f3]">
              <EditableText
                ariaLabel={localized("항목명 수정", "编辑项目名", language)}
                className="min-w-0 whitespace-normal pr-2 leading-relaxed"
                inputClassName="min-w-0 w-full"
                truncate={false}
                value={language === "zh" ? item.nameZh : item.nameKo}
                onChange={(value) =>
                  update(item.id, language === "zh" ? { nameZh: value } : { nameKo: value })
                }
              />
              <FormattedNumberInput
                className="w-full"
                decimals={item.type === "rate" ? 2 : 0}
                value={item.value}
                onChange={(value) => update(item.id, { value })}
              />
              <UnitTypeButton
                item={item}
                language={language}
                open={openTypeItemId === item.id}
                onToggle={() => setOpenTypeItemId(openTypeItemId === item.id ? null : item.id)}
                onSelect={(type) => updateType(item, type)}
              />
              <button
                type="button"
                disabled={!item.removable}
                onClick={() => onChange(items.filter((candidate) => candidate.id !== item.id))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent text-[#9a938b] hover:border-[#c65d3b] hover:bg-white hover:text-[#c65d3b] disabled:cursor-not-allowed disabled:opacity-25"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {showRecoverable && (
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_144px_34px_32px] items-center gap-2">
                <label className="col-span-3 col-start-2 flex items-center justify-end gap-1 whitespace-nowrap text-xs text-[#5f6f7a]">
                  <input
                    type="checkbox"
                    checked={item.recoverable === true}
                    onChange={(event) => update(item.id, { recoverable: event.target.checked })}
                  />
                  {localized("회수 가능", "可回收", language)}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

type UnitTypeButtonProps = {
  readonly item: DynamicItem
  readonly language: Language
  readonly open: boolean
  readonly onToggle: () => void
  readonly onSelect: (type: DynamicItem["type"]) => void
}

const UnitTypeButton = ({ item, language, open, onToggle, onSelect }: UnitTypeButtonProps) => (
  <div className="relative">
    <button
      type="button"
      className="h-10 w-full rounded-md border border-transparent bg-transparent text-center text-xs text-[#7b746d] hover:border-slate-200 hover:bg-white"
      onClick={onToggle}
    >
      {item.type === "rate" ? "%" : localized("원", "元", language)}
    </button>
    {open && (
      <div className="absolute right-0 top-11 z-30 w-24 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
        <button
          type="button"
          className="block w-full rounded px-2 py-2 text-left text-xs font-bold text-[#111827] hover:bg-[#f7f5f1]"
          onClick={() => onSelect("amount")}
        >
          {localized("금액", "金额", language)}
        </button>
        <button
          type="button"
          className="block w-full rounded px-2 py-2 text-left text-xs font-bold text-[#111827] hover:bg-[#f7f5f1]"
          onClick={() => onSelect("rate")}
        >
          {localized("비율", "比例", language)}
        </button>
      </div>
    )}
  </div>
)
