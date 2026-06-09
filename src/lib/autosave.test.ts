import { describe, expect, it } from "vitest"
import { createAutosaveScenario } from "./autosave"
import { defaultInput } from "./defaults"

describe("createAutosaveScenario", () => {
  it("Given the active dashboard input When creating an autosave scenario Then it keeps the current scenario identity", () => {
    const now = new Date("2026-06-10T12:00:00.000Z")
    const scenario = createAutosaveScenario({
      activeScenarioId: "scenario-current",
      input: defaultInput,
      language: "ko",
      now,
      saveName: "자동 저장 시나리오",
    })

    expect(scenario.id).toBe("scenario-current")
    expect(scenario.name).toBe("자동 저장 시나리오")
    expect(scenario.data).toBe(defaultInput)
    expect(scenario.updatedAt).toBe(now.toISOString())
    expect(scenario.updatedBy).toBe("browser")
    expect(scenario.isDeleted).toBe(false)
  })
})
