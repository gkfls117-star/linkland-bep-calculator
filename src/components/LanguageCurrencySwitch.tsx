import { RefreshCw, Settings } from "lucide-react"
import type { Language, MoneyUnit } from "../types/calculator"
import type { AppSettings } from "../lib/storage"
import { localized, t } from "../lib/i18n"
import { FormattedNumberInput } from "./FormattedNumberInput"

type LanguageCurrencySwitchProps = {
  readonly settings: AppSettings
  readonly syncMessage: string
  readonly onSettingsChange: (settings: AppSettings) => void
  readonly onReload: () => void
}

export const LanguageCurrencySwitch = ({
  settings,
  syncMessage,
  onSettingsChange,
  onReload,
}: LanguageCurrencySwitchProps) => {
  const selectedCurrency: MoneyUnit = settings.language === "zh" ? "CNY" : "KRW"

  const setLanguage = (language: Language): void => {
    onSettingsChange({ ...settings, language })
  }

  return (
    <div className="soft-card flex flex-col gap-2 p-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-base font-black text-emerald-700">
          {localized("흑자", "盈利", settings.language)}
        </span>
        <div className="flex rounded-2xl bg-[#211d19] p-1 shadow-sm">
        <button
          type="button"
          className={toggleClass(settings.language === "ko")}
          onClick={() => setLanguage("ko")}
        >
          KR KRW
        </button>
        <button
          type="button"
          className={toggleClass(settings.language === "zh")}
          onClick={() => setLanguage("zh")}
        >
          CN CNY
        </button>
        </div>
        <label className="grid w-24 gap-1 text-[10px] font-semibold uppercase text-[#7d7168]">
          CNY {new Intl.NumberFormat("en-US").format(settings.exchangeRate)} KRW
          <FormattedNumberInput
            className="px-2"
            value={settings.exchangeRate}
            onChange={(exchangeRate) => onSettingsChange({ ...settings, exchangeRate })}
          />
        </label>
        <button
          type="button"
          onClick={onReload}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#5f6f7a] hover:border-[#111827] hover:text-[#111827]"
          title={localized("동기화 새로고침", "刷新同步", settings.language)}
        >
          <RefreshCw size={15} />
        </button>
      </div>
      <details className="rounded-xl bg-[#f7f5f1] px-3 py-2 text-xs text-[#5f6f7a]">
        <summary className="flex cursor-pointer items-center gap-2 font-bold">
          <Settings size={13} /> {localized("동기화 설정", "同步设置", settings.language)} · {selectedCurrency}
        </summary>
        <div className="mt-2 grid gap-2">
          <label className="grid gap-1">
            {t("appsScriptUrl", settings.language)}
            <input
              className="rounded-md border border-slate-200 px-2 py-1 text-sm text-[#111827]"
              value={settings.appsScriptUrl}
              placeholder="https://script.google.com/macros/s/..."
              onChange={(event) => onSettingsChange({ ...settings, appsScriptUrl: event.target.value })}
            />
          </label>
          <label className="grid gap-1">
            {t("writeKey", settings.language)}
            <input
              className="rounded-md border border-slate-200 px-2 py-1 text-sm text-[#111827]"
              value={settings.writeKey}
              onChange={(event) => onSettingsChange({ ...settings, writeKey: event.target.value })}
            />
          </label>
          <p>{syncMessage}</p>
        </div>
      </details>
    </div>
  )
}

const toggleClass = (active: boolean): string =>
  `rounded-xl px-4 py-2 text-sm font-black transition ${
    active ? "bg-white text-[#211d19]" : "text-white/80 hover:text-white"
  }`
