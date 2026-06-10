import type { AppSettings } from "../lib/storage"
import { localized } from "../lib/i18n"
import { LanguageCurrencySwitch } from "./LanguageCurrencySwitch"

type AppHeaderProps = {
  readonly settings: AppSettings
  readonly syncMessage: string
  readonly onSettingsChange: (settings: AppSettings) => void
  readonly onReload: () => void
}

export const AppHeader = ({ settings, syncMessage, onSettingsChange, onReload }: AppHeaderProps) => (
  <header className="mb-5 grid gap-3 lg:grid-cols-[1fr_360px]">
    <div>
      <h1 className="text-[26px] font-black tracking-normal text-[#05070d]">
        {localized(
          "성수 연무장길 링크랜드 BEP / 임차 투자 계산기",
          "圣水练武场路 Linkland BEP / 租赁投资计算器",
          settings.language,
        )}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-[#6b625c]">
        {localized(
          "입력값 변경 시 대시보드가 바로 반영되는 안정 버전입니다.",
          "输入值变化时仪表盘会立即反映的稳定版本。",
          settings.language,
        )}
      </p>
    </div>
    <LanguageCurrencySwitch
      settings={settings}
      syncMessage={syncMessage}
      onSettingsChange={onSettingsChange}
      onReload={onReload}
    />
  </header>
)
