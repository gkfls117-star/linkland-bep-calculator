import type { Language } from "../types/calculator"
import type { CalculatorInput } from "../types/calculator"
import type { Scenario } from "../types/scenario"
import { localized } from "./i18n"

type AutosaveScenarioInput = {
  readonly activeScenarioId: string
  readonly input: CalculatorInput
  readonly language: Language
  readonly now: Date
  readonly saveName: string
}

export const createAutosaveScenario = ({
  activeScenarioId,
  input,
  language,
  now,
  saveName,
}: AutosaveScenarioInput): Scenario => ({
  id: activeScenarioId,
  name: saveName.trim().length > 0 ? saveName.trim() : localized("새 시나리오", "新方案", language),
  data: input,
  updatedAt: now.toISOString(),
  updatedBy: "browser",
  isDeleted: false,
})
