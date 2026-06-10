import { describe, expect, it } from "vitest"
import { clampNumber, committedTypingNumber } from "./FormattedNumberInput"

describe("committedTypingNumber", () => {
  it("Given a formatted typing value When committing during typing Then it returns the numeric value", () => {
    expect(committedTypingNumber("15,001")).toBe(15001)
  })

  it("Given a transient typing value When committing during typing Then it waits for blur", () => {
    expect(committedTypingNumber("")).toBeNull()
    expect(committedTypingNumber("-")).toBeNull()
    expect(committedTypingNumber(".")).toBeNull()
    expect(committedTypingNumber("-.")).toBeNull()
  })
})

describe("clampNumber", () => {
  it("DEFECT-002 Given non-negative business input When value is negative Then it clamps to zero", () => {
    expect(clampNumber(-1000, { min: 0 })).toBe(0)
  })

  it("DEFECT-002 Given percentage business input When value is over 100 Then it clamps to 100", () => {
    expect(clampNumber(150, { min: 0, max: 100 })).toBe(100)
  })
})
