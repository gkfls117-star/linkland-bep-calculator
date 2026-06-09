import { describe, expect, it } from "vitest"
import { committedTypingNumber } from "./FormattedNumberInput"

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
