import { Plus, Save, Trash2 } from "lucide-react"
import type { Language, MoneyUnit } from "../types/calculator"
import type { MarketStore } from "../types/market"
import { marketMetrics } from "../lib/calc"
import { newId } from "../lib/defaults"
import { formatMoney, formatNumber, formatPercent } from "../lib/format"
import { localized, t } from "../lib/i18n"
import { CardBlock } from "./CardBlock"

type MarketAnalysisProps = {
  readonly stores: readonly MarketStore[]
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly linklandRevenue: number
  readonly onSave: (store: MarketStore, isNew: boolean) => void
  readonly onDelete: (store: MarketStore) => void
}

export const MarketAnalysis = ({
  stores,
  language,
  currency,
  exchangeRate,
  linklandRevenue,
  onSave,
  onDelete,
}: MarketAnalysisProps) => {
  const addStore = (): void => {
    onSave(
      {
        id: newId("store"),
        nameKo: "새 매장",
        nameZh: "新门店",
        categoryKo: "카테고리",
        categoryZh: "类别",
        monthlyRevenue: 0,
        peakMonthlyRevenue: 0,
        avgOrderValue: 0,
        conversion: 10,
        margin: 50,
        noteKo: "",
        noteZh: "",
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      },
      true,
    )
  }

  return (
    <CardBlock title={t("market", language)}>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={addStore}
          className="inline-flex items-center gap-1 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white"
        >
          <Plus size={15} /> {localized("매장 추가", "添加门店", language)}
        </button>
      </div>
      <div className="grid gap-3">
        {stores.map((store) => (
          <MarketRow
            key={store.id}
            store={store}
            language={language}
            currency={currency}
            exchangeRate={exchangeRate}
            linklandRevenue={linklandRevenue}
            onSave={onSave}
            onDelete={onDelete}
          />
        ))}
      </div>
    </CardBlock>
  )
}

type MarketRowProps = {
  readonly store: MarketStore
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly linklandRevenue: number
  readonly onSave: (store: MarketStore, isNew: boolean) => void
  readonly onDelete: (store: MarketStore) => void
}

const MarketRow = ({
  store,
  language,
  currency,
  exchangeRate,
  linklandRevenue,
  onSave,
  onDelete,
}: MarketRowProps) => {
  const metrics = marketMetrics(store, linklandRevenue)
  const patch = (updates: Partial<MarketStore>): void =>
    onSave({ ...store, ...updates, updatedAt: new Date().toISOString() }, false)

  return (
    <div className="rounded-lg border border-line bg-paper/40 p-3">
      <div className="grid gap-2 md:grid-cols-6">
        <input
          className="rounded border border-line px-2 py-1 text-sm md:col-span-2"
          value={language === "zh" ? store.nameZh : store.nameKo}
          onChange={(event) =>
            patch(language === "zh" ? { nameZh: event.target.value } : { nameKo: event.target.value })
          }
        />
        <input
          className="rounded border border-line px-2 py-1 text-sm md:col-span-2"
          value={language === "zh" ? store.categoryZh : store.categoryKo}
          onChange={(event) =>
            patch(language === "zh" ? { categoryZh: event.target.value } : { categoryKo: event.target.value })
          }
        />
        <button type="button" className="rounded border border-line px-2 py-1 text-steel" onClick={() => onSave(store, false)}>
          <Save size={15} className="mx-auto" />
        </button>
        <button type="button" className="rounded border border-line px-2 py-1 text-clay" onClick={() => onDelete(store)}>
          <Trash2 size={15} className="mx-auto" />
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-5">
        <NumberInput label={localized("월매출", "月销售额", language)} value={store.monthlyRevenue} onChange={(value) => patch({ monthlyRevenue: value })} />
        <NumberInput label={localized("피크 월매출", "峰值月销售额", language)} value={store.peakMonthlyRevenue} onChange={(value) => patch({ peakMonthlyRevenue: value })} />
        <NumberInput label={localized("객단가", "客单价", language)} value={store.avgOrderValue} onChange={(value) => patch({ avgOrderValue: value })} />
        <NumberInput label={localized("전환율(%)", "转化率(%)", language)} value={store.conversion} onChange={(value) => patch({ conversion: value })} />
        <NumberInput label={localized("공헌이익률(%)", "贡献利润率(%)", language)} value={store.margin} onChange={(value) => patch({ margin: value })} />
      </div>
      <textarea
        className="mt-2 w-full rounded border border-line px-2 py-1 text-sm"
        value={language === "zh" ? store.noteZh : store.noteKo}
        onChange={(event) =>
          patch(language === "zh" ? { noteZh: event.target.value } : { noteKo: event.target.value })
        }
      />
      <div className="mt-3 grid gap-2 text-xs text-steel md:grid-cols-4">
        <span>{localized("월 구매고객", "月购买客户", language)}: {formatNumber(metrics.monthlyCustomers, language)}</span>
        <span>{localized("필요 월 방문자", "所需月访客", language)}: {formatNumber(metrics.requiredVisitors, language)}</span>
        <span>{localized("일평균 방문자", "日均访客", language)}: {formatNumber(metrics.dailyVisitors, language)}</span>
        <span>
          {localized("링크랜드 대비", "相对 Linkland", language)}: {formatPercent(metrics.revenueRatioToLinkland * 100, language)}
          {" · "}
          {formatMoney(store.monthlyRevenue, currency, exchangeRate, true)}
        </span>
      </div>
    </div>
  )
}

type NumberInputProps = {
  readonly label: string
  readonly value: number
  readonly onChange: (value: number) => void
}

const NumberInput = ({ label, value, onChange }: NumberInputProps) => (
  <label className="grid gap-1 text-xs text-steel">
    {label}
    <input
      className="rounded border border-line px-2 py-1 text-right text-sm text-ink"
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
)
