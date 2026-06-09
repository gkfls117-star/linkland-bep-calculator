import { useEffect, useState } from "react"

type FormattedNumberInputProps = {
  readonly value: number
  readonly className?: string
  readonly ariaLabel?: string
  readonly decimals?: number
  readonly onChange: (value: number) => void
}

export const FormattedNumberInput = ({
  value,
  className = "",
  ariaLabel,
  decimals = 2,
  onChange,
}: FormattedNumberInputProps) => {
  const [draft, setDraft] = useState(formatInputNumber(value, decimals))

  useEffect(() => {
    setDraft(formatInputNumber(value, decimals))
  }, [decimals, value])

  const save = (rawValue: string): void => {
    const parsed = parseInputNumber(rawValue)
    onChange(parsed)
    setDraft(formatInputNumber(parsed, decimals))
  }

  const updateDraft = (rawValue: string): void => {
    const nextDraft = formatTypingNumber(rawValue)
    setDraft(nextDraft)
    const committed = committedTypingNumber(nextDraft)
    if (committed !== null) onChange(committed)
  }

  return (
    <input
      aria-label={ariaLabel}
      className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-right text-sm text-[#1f2937] outline-none focus:border-[#111827] ${className}`}
      inputMode="decimal"
      value={draft}
      onBlur={(event) => save(event.target.value)}
      onChange={(event) => updateDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") save(event.currentTarget.value)
      }}
    />
  )
}

const parseInputNumber = (value: string): number => {
  const normalized = value.replace(/,/g, "").trim()
  if (normalized.length === 0) return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export const committedTypingNumber = (value: string): number | null => {
  const normalized = value.replace(/,/g, "").trim()
  if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const formatInputNumber = (value: number, decimals: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(value)

const formatTypingNumber = (value: string): string => {
  const normalized = value.replace(/[^\d.-]/g, "")
  if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") {
    return normalized
  }
  const [integerPart = "", decimalPart] = normalized.split(".")
  const signed = integerPart.startsWith("-")
  const unsignedInteger = signed ? integerPart.slice(1) : integerPart
  const groupedInteger = unsignedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const nextInteger = signed ? `-${groupedInteger}` : groupedInteger
  return decimalPart === undefined ? nextInteger : `${nextInteger}.${decimalPart}`
}
