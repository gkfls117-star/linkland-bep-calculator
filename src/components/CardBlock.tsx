import type { ReactNode } from "react"

type CardBlockProps = {
  readonly title?: string
  readonly eyebrow?: string
  readonly children: ReactNode
  readonly className?: string
}

export const CardBlock = ({ title, eyebrow, children, className = "" }: CardBlockProps) => (
  <section className={`soft-card min-w-0 p-5 ${className}`}>
    {eyebrow !== undefined && (
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#b45309]">{eyebrow}</p>
    )}
    {title !== undefined && <h2 className="mb-4 text-lg font-black text-[#05070d]">{title}</h2>}
    {children}
  </section>
)
