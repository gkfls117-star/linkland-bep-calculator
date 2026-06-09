import { AlertTriangle, Banknote, Landmark, TrendingUp } from "lucide-react"
import type { CalculatorInput, CalculatorResult, Language, MoneyUnit } from "../types/calculator"
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
  onHighlight,
}: DashboardProps) => (
  <div className="space-y-4">
    <div className="grid gap-4 xl:grid-cols-4">
      <MetricCard
        label={t("offline", language)}
        value={formatMoney(result.offlineNetProfit, currency, exchangeRate, true)}
        detail={localized("월 순이익", "月净利润", language)}
        icon={<Landmark size={18} />}
        tip={localized("오프라인 매출 x 공헌이익률 - 고정비", "线下销售额 x 贡献利润率 - 固定费", language)}
        onTip={(active) => onHighlight(active ? "offlineMonthlyRevenue" : null)}
      />
      <MetricCard
        label={t("online", language)}
        value={formatMoney(result.onlineNetProfit, currency, exchangeRate, true)}
        detail={localized("월 순이익", "月净利润", language)}
        icon={<TrendingUp size={18} />}
        tip={localized("온라인 매출 x 공헌이익률 - 온라인 비용", "线上销售额 x 贡献利润率 - 线上成本", language)}
        onTip={(active) => onHighlight(active ? "onlineMonthlyRevenue" : null)}
      />
      <MetricCard
        label={t("initialCash", language)}
        value={formatMoney(result.initialCash, currency, exchangeRate, true)}
        detail={localized("회수 가능 포함", "含可回收项目", language)}
        icon={<Banknote size={18} />}
        tip={localized("보증금, 권리금, 인테리어, 재고 등 초기 현금 합계", "保证金、转让费、装修、库存等初始现金合计", language)}
        onTip={(active) => onHighlight(active ? "transferPremiumYear3" : null)}
      />
      <MetricCard
        label={t("payback", language)}
        value={formatMonths(result.paybackMonths, language)}
        detail={riskLabel(result.riskLevel, language)}
        icon={<AlertTriangle size={18} />}
        tip={localized("초기 필요 현금 ÷ 합산 월 순이익", "初始现金 ÷ 合计月净利润", language)}
        onTip={(active) => onHighlight(active ? "offlineMarginRate" : null)}
      />
    </div>
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <CardBlock title={t("combined", language)}>
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryLine
            label={localized("합산 월 순이익", "合计月净利润", language)}
            value={formatMoney(result.combinedMonthlyProfit, currency, exchangeRate)}
          />
          <SummaryLine
            label={localized("연간 순이익", "年净利润", language)}
            value={formatMoney(result.yearlyProfit, currency, exchangeRate)}
          />
          <SummaryLine
            label={localized("회수 가능 투자", "可回收投资", language)}
            value={formatMoney(result.recoverableInvestment, currency, exchangeRate)}
          />
          <SummaryLine
            label={t("bep", language)}
            value={formatMoney(result.offlineBepRevenue, currency, exchangeRate)}
            detail={`${formatNumber(result.offlineBepVisitors, language)} ${localized("월 방문자", "月访客", language)}`}
          />
          <SummaryLine
            label={t("risk", language)}
            value={riskLabel(result.riskLevel, language)}
            detail={formatPercent(input.conversionRate, language)}
          />
          <SummaryLine
            label={t("memo", language)}
            value={input.judgmentMemo}
            compact={true}
          />
        </div>
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
      <CardBlock title={t("currentSave", language)} eyebrow={scenarioName}>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            value={saveName}
            onChange={(event) => onSaveNameChange(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white" type="button" onClick={onOverwrite}>
              {t("overwrite", language)}
            </button>
            <button className="rounded-md border border-moss px-3 py-2 text-sm font-semibold text-moss" type="button" onClick={onSaveAs}>
              {t("saveAs", language)}
            </button>
          </div>
        </div>
      </CardBlock>
    </div>
  </div>
)

type MetricCardProps = {
  readonly label: string
  readonly value: string
  readonly detail: string
  readonly icon: JSX.Element
  readonly tip: string
  readonly onTip: (active: boolean) => void
}

const MetricCard = ({ label, value, detail, icon, tip, onTip }: MetricCardProps) => (
  <CardBlock>
    <div className="flex items-start justify-between gap-3">
      <span className="rounded-md bg-paper p-2 text-moss">{icon}</span>
      <InfoTip text={tip} onToggle={onTip} />
    </div>
    <p className="mt-3 text-xs font-semibold text-steel">{label}</p>
    <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    <p className="mt-1 text-xs text-steel">{detail}</p>
  </CardBlock>
)

type SummaryLineProps = {
  readonly label: string
  readonly value: string
  readonly detail?: string
  readonly compact?: boolean
}

const SummaryLine = ({ label, value, detail, compact = false }: SummaryLineProps) => (
  <div className="rounded-md border border-line bg-paper/50 p-3">
    <p className="text-xs text-steel">{label}</p>
    <p className={`${compact ? "text-sm" : "text-lg"} mt-1 font-bold text-ink`}>{value}</p>
    {detail !== undefined && <p className="mt-1 text-xs text-steel">{detail}</p>}
  </div>
)

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
