import { Info } from "lucide-react"
import { useState } from "react"

type InfoTipProps = {
  readonly text: string
  readonly onToggle?: (active: boolean) => void
}

export const InfoTip = ({ text, onToggle }: InfoTipProps) => {
  const [open, setOpen] = useState(false)
  const toggle = (): void => {
    const next = !open
    setOpen(next)
    onToggle?.(next)
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line text-steel hover:border-clay hover:text-clay"
        aria-label={text}
      >
        <Info size={14} />
      </button>
      {open && (
        <span className="absolute right-0 top-8 z-20 w-64 rounded-md border border-line bg-ink p-3 text-xs leading-relaxed text-white shadow-tight">
          {text}
        </span>
      )}
    </span>
  )
}
