import { describe, expect, it } from "vitest"
import { defaultScenario } from "./defaults"
import { loadScenarios, normalizeStoredSettings, type AppSettings } from "./storage"

const fallbackSettings: AppSettings = {
  language: "ko",
  exchangeRate: 217.19,
  appsScriptUrl: "https://script.google.com/macros/s/example/exec",
  writeKey: "repo-write-key",
}

describe("normalizeStoredSettings", () => {
  it("Given cached empty sync settings When resolving settings Then repository defaults are preserved", () => {
    const settings = normalizeStoredSettings(
      {
        language: "zh",
        exchangeRate: 210,
        appsScriptUrl: "",
        writeKey: "",
      },
      fallbackSettings,
    )

    expect(settings.language).toBe("zh")
    expect(settings.exchangeRate).toBe(210)
    expect(settings.appsScriptUrl).toBe(fallbackSettings.appsScriptUrl)
    expect(settings.writeKey).toBe(fallbackSettings.writeKey)
  })
})

describe("loadScenarios", () => {
  it("Given an empty cached scenario list When loading scenarios Then the default scenario remains available", () => {
    localStorage.setItem("linkland:bep:scenarios", JSON.stringify([]))

    const scenarios = loadScenarios()

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0]?.id).toBe(defaultScenario().id)
  })

  it("Given only deleted cached scenarios When loading scenarios Then deleted rows are not shown as presets", () => {
    localStorage.setItem(
      "linkland:bep:scenarios",
      JSON.stringify([{ ...defaultScenario(), id: "deleted_cached", isDeleted: true }]),
    )

    const scenarios = loadScenarios()

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0]?.id).toBe(defaultScenario().id)
  })
})
