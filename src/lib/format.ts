import type { Language, MoneyUnit } from "../types/calculator"

export const formatMoney = (
  valueKrw: number,
  currency: MoneyUnit,
  exchangeRate: number,
  compact = false,
): string => {
  const value = currency === "CNY" ? valueKrw / exchangeRate : valueKrw
  const locale = currency === "CNY" ? "zh-CN" : "ko-KR"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CNY" ? 0 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value)
}

export const formatNumber = (value: number, language: Language, digits = 0): string =>
  new Intl.NumberFormat(language === "zh" ? "zh-CN" : "ko-KR", {
    maximumFractionDigits: digits,
  }).format(value)

export const formatPercent = (value: number, language: Language): string =>
  `${formatNumber(value, language, 1)}%`

export const formatMonths = (months: number | null, language: Language): string => {
  if (months === null) return language === "zh" ? "无法回收" : "회수 불가"
  const suffix = language === "zh" ? "个月" : "개월"
  return `${formatNumber(months, language, 1)}${suffix}`
}
