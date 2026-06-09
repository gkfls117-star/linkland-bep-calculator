import { useEffect, useRef } from "react"
import type { Language } from "../types/calculator"
import type { CalculatorInput } from "../types/calculator"
import type { Scenario, SyncState } from "../types/scenario"
import { createAutosaveScenario } from "../lib/autosave"
import { localized } from "../lib/i18n"
import { hasSheetsConfig, saveScenarioToSheets, type SheetsConfig } from "../lib/sheetsApi"

const AUTOSAVE_DELAY_MS = 900

type ScenarioAutosaveArgs = {
  readonly activeScenarioId: string
  readonly applyScenarios: (scenarios: readonly Scenario[]) => void
  readonly enabled: boolean
  readonly input: CalculatorInput
  readonly language: Language
  readonly saveName: string
  readonly setSyncState: (syncState: SyncState) => void
  readonly sheetsConfig: SheetsConfig
}

export const useScenarioAutosave = ({
  activeScenarioId,
  applyScenarios,
  enabled,
  input,
  language,
  saveName,
  setSyncState,
  sheetsConfig,
}: ScenarioAutosaveArgs): void => {
  const hasBaselineSnapshot = useRef(false)
  const latestSignature = useRef("")
  const lastSyncedSignature = useRef("")

  useEffect(() => {
    const signature = JSON.stringify({ activeScenarioId, input, saveName })
    latestSignature.current = signature
    if (!enabled || !hasSheetsConfig(sheetsConfig)) {
      hasBaselineSnapshot.current = false
      lastSyncedSignature.current = ""
      return
    }
    if (!hasBaselineSnapshot.current) {
      hasBaselineSnapshot.current = true
      lastSyncedSignature.current = signature
      return
    }
    if (lastSyncedSignature.current === signature) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const scenario = createAutosaveScenario({
        activeScenarioId,
        input,
        language,
        now: new Date(),
        saveName,
      })
      void saveScenarioToSheets(sheetsConfig, scenario, "updateScenario")
        .then((scenarios) => {
          if (latestSignature.current !== signature) return
          lastSyncedSignature.current = signature
          applyScenarios(scenarios)
          setSyncState({
            kind: "sheets",
            message: localized("Sheets 자동 저장 완료", "Sheets 自动保存完成", language),
          })
        })
        .catch((error: unknown) => {
          if (latestSignature.current !== signature) return
          setSyncState({
            kind: "error",
            message: error instanceof Error ? error.message : "autosave failed",
          })
        })
    }, AUTOSAVE_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeScenarioId, applyScenarios, enabled, input, language, saveName, setSyncState, sheetsConfig])
}
