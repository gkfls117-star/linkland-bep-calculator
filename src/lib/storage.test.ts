import { describe, expect, it } from "vitest"
import { normalizeStoredSettings, type AppSettings } from "./storage"

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
