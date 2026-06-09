import { Trash2 } from "lucide-react"
import type { Language, MoneyUnit } from "../types/calculator"
import type { Scenario } from "../types/scenario"
import { calculateBep } from "../lib/calc"
import { formatMoney, formatMonths } from "../lib/format"
import { localized, t } from "../lib/i18n"
import { CardBlock } from "./CardBlock"
import { DataTable, type DataColumn } from "./DataTable"

type ScenarioTableProps = {
  readonly scenarios: readonly Scenario[]
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly onSelect: (scenario: Scenario) => void
  readonly onDelete: (scenario: Scenario) => void
}

export const ScenarioTable = ({
  scenarios,
  language,
  currency,
  exchangeRate,
  onSelect,
  onDelete,
}: ScenarioTableProps) => {
  const columns: readonly DataColumn<Scenario>[] = [
    {
      key: "name",
      header: localized("시나리오", "方案", language),
      render: (scenario) => (
        <button type="button" className="font-bold text-moss" onClick={() => onSelect(scenario)}>
          {scenario.name}
        </button>
      ),
    },
    {
      key: "monthlyProfit",
      header: localized("월 순이익", "月净利润", language),
      align: "right",
      render: (scenario) =>
        formatMoney(calculateBep(scenario.data).combinedMonthlyProfit, currency, exchangeRate),
    },
    {
      key: "initialCash",
      header: t("initialCash", language),
      align: "right",
      render: (scenario) => formatMoney(calculateBep(scenario.data).initialCash, currency, exchangeRate),
    },
    {
      key: "payback",
      header: t("payback", language),
      align: "right",
      render: (scenario) => formatMonths(calculateBep(scenario.data).paybackMonths, language),
    },
    {
      key: "updatedAt",
      header: localized("수정일", "更新时间", language),
      render: (scenario) => new Date(scenario.updatedAt).toLocaleString(),
    },
    {
      key: "delete",
      header: "",
      align: "center",
      render: (scenario) => (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-steel hover:border-clay hover:text-clay"
          onClick={() => onDelete(scenario)}
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ]

  return (
    <CardBlock title={t("scenarioTable", language)}>
      <DataTable
        columns={columns}
        rows={scenarios}
        getRowKey={(scenario) => scenario.id}
        emptyText={localized("저장된 시나리오가 없습니다.", "没有已保存的方案。", language)}
      />
    </CardBlock>
  )
}
