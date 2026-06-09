import type { Language } from "../types/calculator"
import { localized } from "../lib/i18n"

type SidebarNavProps = {
  readonly language: Language
}

export const SidebarNav = ({ language }: SidebarNavProps) => {
  const navItems = [
    localized("대시보드", "仪表盘", language),
    localized("주변 매장 분석", "周边门店分析", language),
    localized("시나리오 비교", "方案对比", language),
  ] as const

  return (
    <aside className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.10)] lg:sticky lg:top-5">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">LINKLAND</p>
      <h2 className="mt-1 text-lg font-black text-[#1f1b16]">{localized("본석", "本盘", language)}</h2>
      <nav className="mt-4 space-y-2">
        {navItems.map((item, index) => (
          <a
            key={item}
            href={index === 0 ? "#dashboard" : index === 1 ? "#market" : "#scenarios"}
            className={`block rounded-2xl px-4 py-3 text-sm font-bold ${
              index === 0
                ? "bg-[#211d19] text-white"
                : "text-[#4f4841] hover:bg-[#f6f2ea] hover:text-[#211d19]"
            }`}
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  )
}
