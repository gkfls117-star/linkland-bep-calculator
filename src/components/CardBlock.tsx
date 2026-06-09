import type { ReactNode } from "react"

type CardBlockProps = {
  readonly title?: string
  readonly eyebrow?: string
  readonly children: ReactNode
  readonly className?: string
}

export const CardBlock = ({ title, eyebrow, children, className = "" }: CardBlockProps) => (
  <section className={`min-w-0 rounded-lg border border-line bg-white/85 p-4 shadow-tight ${className}`}>
    {eyebrow !== undefined && (
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-clay">{eyebrow}</p>
    )}
    {title !== undefined && <h2 className="mb-3 text-lg font-bold text-ink">{title}</h2>}
    {children}
  </section>
)
