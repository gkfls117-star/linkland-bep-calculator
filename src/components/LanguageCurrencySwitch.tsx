import { RefreshCw } from "lucide-react"
import type { Language, MoneyUnit } from "../types/calculator"
import type { AppSettings } from "../lib/storage"
import { localized, t } from "../lib/i18n"

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
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-white/90 p-3 shadow-tight">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={toggleClass(settings.language === "ko")}
          onClick={() => setLanguage("ko")}
        >
          KRW
        </button>
        <button
          type="button"
          className={toggleClass(settings.language === "zh")}
          onClick={() => setLanguage("zh")}
        >
          CNY
        </button>
        <span className="text-xs text-steel">
          {settings.language === "ko" ? "🇰🇷 KRW" : "🇨🇳 CNY"} · {selectedCurrency}
        </span>
        <button
          type="button"
          onClick={onReload}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-steel hover:border-clay hover:text-clay"
          title={localized("동기화 새로고침", "刷新同步", settings.language)}
        >
          <RefreshCw size={15} />
        </button>
      </div>
      <label className="grid gap-1 text-xs text-steel">
        {t("exchangeRate", settings.language)} · 1 CNY = KRW
        <input
          className="rounded-md border border-line px-2 py-1 text-sm text-ink"
          type="number"
          value={settings.exchangeRate}
          onChange={(event) =>
            onSettingsChange({ ...settings, exchangeRate: Number(event.target.value) })
          }
        />
      </label>
      <label className="grid gap-1 text-xs text-steel">
        {t("appsScriptUrl", settings.language)}
        <input
          className="rounded-md border border-line px-2 py-1 text-sm text-ink"
          value={settings.appsScriptUrl}
          placeholder="https://script.google.com/macros/s/..."
          onChange={(event) => onSettingsChange({ ...settings, appsScriptUrl: event.target.value })}
        />
      </label>
      <label className="grid gap-1 text-xs text-steel">
        {t("writeKey", settings.language)}
        <input
          className="rounded-md border border-line px-2 py-1 text-sm text-ink"
          value={settings.writeKey}
          onChange={(event) => onSettingsChange({ ...settings, writeKey: event.target.value })}
        />
      </label>
      <p className="text-xs text-steel">{syncMessage}</p>
    </div>
  )
}

const toggleClass = (active: boolean): string =>
  `rounded-md border px-3 py-1 text-sm font-semibold ${
    active ? "border-moss bg-moss text-white" : "border-line bg-white text-steel hover:border-moss"
  }`
