import { useCallback, useEffect, useState } from "react"
import type { Language } from "../types/calculator"
import type { MarketStore } from "../types/market"
import type { Scenario, SyncState } from "../types/scenario"
import { localized } from "../lib/i18n"
import { saveMarketStores } from "../lib/storage"
import { hasSheetsConfig, listMarketStores, listScenarios, type SheetsConfig } from "../lib/sheetsApi"

type SheetsReloadArgs = {
  readonly applyScenarios: (scenarios: readonly Scenario[]) => void
  readonly language: Language
  readonly setStores: (stores: readonly MarketStore[]) => void
  readonly setSyncState: (syncState: SyncState) => void
  readonly sheetsConfig: SheetsConfig
}

type SheetsReloadState = {
  readonly isReadyForAutosave: boolean
  readonly reload: () => Promise<void>
}

export const useSheetsReload = ({
  applyScenarios,
  language,
  setStores,
  setSyncState,
  sheetsConfig,
}: SheetsReloadArgs): SheetsReloadState => {
  const [isReadyForAutosave, setIsReadyForAutosave] = useState(false)

  const reload = useCallback(async (): Promise<void> => {
    setIsReadyForAutosave(false)
    if (!hasSheetsConfig(sheetsConfig)) {
      setSyncState({ kind: "local", message: localized("로컬 캐시 모드", "本地缓存模式", language) })
      setIsReadyForAutosave(true)
      return
    }
    setSyncState({ kind: "syncing", message: localized("Sheets 불러오는 중", "正在读取 Sheets", language) })
    try {
      const [sheetScenarios, sheetStores] = await Promise.all([
        listScenarios(sheetsConfig),
        listMarketStores(sheetsConfig),
      ])
      if (sheetScenarios.length > 0) applyScenarios(sheetScenarios)
      if (sheetStores.length > 0) {
        setStores(sheetStores)
        saveMarketStores(sheetStores)
      }
      setSyncState({ kind: "sheets", message: localized("Sheets 동기화 완료", "Sheets 同步完成", language) })
    } catch (error: unknown) {
      setSyncState({
        kind: "error",
        message:
          error instanceof Error
            ? `${localized("로컬 fallback", "本地回退", language)}: ${error.message}`
            : localized("로컬 fallback", "本地回退", language),
      })
    } finally {
      setIsReadyForAutosave(true)
    }
  }, [applyScenarios, language, setStores, setSyncState, sheetsConfig])

  useEffect(() => {
    void reload()
  }, [reload])

  return { isReadyForAutosave, reload }
}
