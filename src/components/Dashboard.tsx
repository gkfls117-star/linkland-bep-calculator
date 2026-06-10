import type { ReactNode } from "react"
import type { CalculatorInput, CalculatorResult, Language, MoneyUnit } from "../types/calculator"
import { activeOfflineMonthlyRevenue, activeOnlineMonthlyRevenue } from "../lib/calc"
import { formatMoney, formatMonths, formatNumber, formatPercent } from "../lib/format"
import { localized, t } from "../lib/i18n"
import { CardBlock } from "./CardBlock"
import { InfoTip } from "./InfoTip"

type DashboardProps = {
  readonly input: CalculatorInput
  readonly result: CalculatorResult
  readonly language: Language
  readonly currency: MoneyUnit
  readonly exchangeRate: number
  readonly scenarioName: string
  readonly saveName: string
  readonly onSaveNameChange: (name: string) => void
  readonly onOverwrite: () => void
  readonly onSaveAs: () => void
  readonly onResetDefault: () => void
  readonly onHighlight: (key: string | null) => void
}

export const Dashboard = ({
  input,
  result,
  language,
  currency,
  exchangeRate,
  scenarioName,
  saveName,
  onSaveNameChange,
  onOverwrite,
  onSaveAs,
  onResetDefault,
  onHighlight,
}: DashboardProps) => {
  const offlineRevenue = activeOfflineMonthlyRevenue(input)
  const onlineRevenue = activeOnlineMonthlyRevenue(input)
  const combinedRevenue = offlineRevenue + onlineRevenue

  return (
  <div id="dashboard" className="space-y-5">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 min-[1500px]:grid-cols-[1fr_1fr_1fr_1fr_1.35fr]">
      <MetricCard
        label={localized("합산 월매출", "合计月销售额", language)}
        value={formatMoney(combinedRevenue, currency, exchangeRate)}
      />
      <MetricCard
        label={localized("합산 월 영업이익", "合计月营业利润", language)}
        value={formatMoney(result.combinedMonthlyProfit, currency, exchangeRate)}
      />
      <MetricCard
        tone="offline"
        label={localized("오프라인 이익", "线下利润", language)}
        value={formatMoney(result.offlineNetProfit, currency, exchangeRate, true)}
      />
      <MetricCard
        tone="online"
        label={localized("온라인 이익", "线上利润", language)}
        value={formatMoney(result.onlineNetProfit, currency, exchangeRate, true)}
      />
      <MetricCard
        label={localized("투자비 / 회수", "投资 / 回收", language)}
        value={`${formatMoney(result.initialCash, currency, exchangeRate, true)} · ${formatMonths(result.paybackMonths, language)}`}
      />
    </div>
    <div className="grid gap-5 lg:grid-cols-2 min-[1350px]:grid-cols-[1fr_1fr_260px]">
      <ProfitCard title={t("offline", language)} tone="offline">
        <SummaryLine label={localized("월매출", "月销售额", language)} value={formatMoney(offlineRevenue, currency, exchangeRate)} />
        <SummaryLine label={localized("공헌이익", "贡献利润", language)} value={formatMoney(result.offlineContribution, currency, exchangeRate)} />
        <SummaryLine label={localized("고정비", "固定费", language)} value={formatMoney(result.totals.offlineFixedMonthly, currency, exchangeRate)} />
        <SummaryLine label={localized("영업이익", "营业利润", language)} value={formatMoney(result.offlineNetProfit, currency, exchangeRate, true)} />
      </ProfitCard>
      <ProfitCard title={t("online", language)} tone="online">
        <SummaryLine label={localized("월매출", "月销售额", language)} value={formatMoney(onlineRevenue, currency, exchangeRate)} />
        <SummaryLine label={localized("공헌이익", "贡献利润", language)} value={formatMoney(result.onlineContribution, currency, exchangeRate)} />
        <SummaryLine label={localized("온라인 고정비", "线上固定费", language)} value={formatMoney(result.totals.onlineMonthlyCost, currency, exchangeRate)} />
        <SummaryLine label={localized("순수익", "净利润", language)} value={formatMoney(result.onlineNetProfit, currency, exchangeRate, true)} />
      </ProfitCard>
      <CardBlock title={t("combined", language)} className="p-5">
        <SummaryLine label={localized("합산 매출", "合计销售额", language)} value={formatMoney(combinedRevenue, currency, exchangeRate)} tip={localized("오프라인 + 온라인 매출", "线下 + 线上销售额", language)} onTip={(active) => onHighlight(active ? "offlineMonthlyRevenue" : null)} />
        <SummaryLine label={localized("합산 영업이익", "合计营业利润", language)} value={formatMoney(result.combinedMonthlyProfit, currency, exchangeRate)} tip={localized("오프라인 이익 + 온라인 이익", "线下利润 + 线上利润", language)} onTip={(active) => onHighlight(active ? "onlineMonthlyRevenue" : null)} />
        <SummaryLine label={t("initialCash", language)} value={formatMoney(result.initialCash, currency, exchangeRate)} tip={localized("초기 투자비 전체 합계", "初始投资总额", language)} onTip={(active) => onHighlight(active ? "transferPremiumYear3" : null)} />
        <SummaryLine label={localized("회수 가능 투자비", "可回收投资", language)} value={formatMoney(result.recoverableInvestment, currency, exchangeRate)} tip={localized("임차/초기 투자비에서 회수 가능 체크된 항목 합계", "租赁/初始投资中勾选可回收的项目合计", language)} onTip={(active) => onHighlight(active ? "transferPremiumYear3" : null)} />
        <SummaryLine label={t("payback", language)} value={formatMonths(result.paybackMonths, language)} tip={localized("초기 필요 현금 ÷ 합산 월 영업이익", "初始现金 ÷ 合计月营业利润", language)} onTip={(active) => onHighlight(active ? "offlineMarginRate" : null)} />
        <p className="mt-4 rounded-xl bg-[#f8f7f3] p-3 text-xs leading-relaxed text-[#5f6f7a]">
          {input.judgmentMemo}
        </p>
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
          <p className="text-xs font-black text-[#7b746d]">{t("currentSave", language)} · {scenarioName}</p>
          <input className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={saveName} onChange={(event) => onSaveNameChange(event.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-md bg-[#111827] px-3 py-2 text-xs font-black text-white" type="button" onClick={onOverwrite}>{t("overwrite", language)}</button>
            <button className="rounded-md border border-[#111827] px-3 py-2 text-xs font-black text-[#111827]" type="button" onClick={onSaveAs}>{t("saveAs", language)}</button>
            <button className="col-span-2 rounded-md border border-[#d9cfc1] px-3 py-2 text-xs font-black text-[#5f6f7a]" type="button" onClick={onResetDefault}>{localized("기본값 복원", "恢复默认", language)}</button>
          </div>
        </div>
      </CardBlock>
    </div>
    <CardBlock title={localized("2~5년차 양도/권리금 회수", "第2~5年转让费回收", language)} className="p-5">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-steel">
                <th className="py-2 text-left">{localized("연차", "年份", language)}</th>
                <th className="py-2 text-right">{localized("양도/권리금", "转让费", language)}</th>
                <th className="py-2 text-right">{localized("누적 이익", "累计利润", language)}</th>
                <th className="py-2 text-right">{localized("회수액", "回收额", language)}</th>
                <th className="py-2 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {result.transferRecovery.map((row) => (
                <tr key={row.year} className="border-b border-line/60">
                  <td className="py-2">{row.year}{localized("년차", "年", language)}</td>
                  <td className="py-2 text-right">{formatMoney(row.premium, currency, exchangeRate)}</td>
                  <td className="py-2 text-right">
                    {formatMoney(row.cumulativeProfit, currency, exchangeRate)}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(row.recoveredAmount, currency, exchangeRate)}
                  </td>
                  <td className="py-2 text-right">{formatPercent(row.roiRate * 100, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBlock>
  </div>
)
}

type MetricCardProps = {
  readonly label: string
  readonly value: string
  readonly tone?: "default" | "offline" | "online"
}

const MetricCard = ({ label, value, tone = "default" }: MetricCardProps) => (
  <div className={`metric-card soft-card min-h-[110px] overflow-hidden p-4 ${toneClass(tone)}`}>
    <p className="text-sm font-semibold leading-snug text-[#7b746d]">{label}</p>
    <p className="mt-3 max-w-full truncate text-lg font-black leading-tight text-[#05070d] min-[1500px]:text-xl" title={value}>
      {value}
    </p>
  </div>
)

type ProfitCardProps = {
  readonly title: string
  readonly tone: "offline" | "online"
  readonly children: ReactNode
}

const ProfitCard = ({ title, tone, children }: ProfitCardProps) => (
  <section className={`rounded-[18px] border p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] ${toneClass(tone)}`}>
    <h2 className="mb-5 text-lg font-black text-[#05070d]">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
)

type SummaryLineProps = {
  readonly label: string
  readonly value: string
  readonly tip?: string
  readonly onTip?: (active: boolean) => void
}

const SummaryLine = ({ label, value, tip, onTip }: SummaryLineProps) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6e0d8] pb-3 last:border-b-0">
    <p className="flex min-w-0 items-center gap-1 text-sm leading-snug text-[#4f4841]">
      {label}
      {tip !== undefined && onTip !== undefined && <InfoTip text={tip} onToggle={onTip} />}
    </p>
    <p className="max-w-[140px] truncate text-right text-sm font-black text-[#05070d]" title={value}>{value}</p>
  </div>
)

const toneClass = (tone: MetricCardProps["tone"]): string => {
  switch (tone) {
    case "offline":
      return "border-[#f2df97] bg-[#fffbed]"
    case "online":
      return "border-[#cde7f8] bg-[#f0f9ff]"
    case "default":
    case undefined:
      return "border-slate-200 bg-white"
  }
}

const riskLabel = (risk: CalculatorResult["riskLevel"], language: Language): string => {
  switch (risk) {
    case "low":
      return localized("낮음", "低", language)
    case "medium":
      return localized("중간", "中", language)
    case "high":
      return localized("높음", "高", language)
  }
}
