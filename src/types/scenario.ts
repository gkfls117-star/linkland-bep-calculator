import type { CalculatorInput } from "./calculator"

export type Scenario = {
  readonly id: string
  readonly name: string
  readonly data: CalculatorInput
  readonly updatedAt: string
  readonly updatedBy: string
  readonly isDeleted: boolean
}

export type ScenarioRow = {
  readonly id: string
  readonly name: string
  readonly dataJson: string
  readonly updatedAt: string
  readonly updatedBy: string
  readonly isDeleted: boolean
}

export type SyncState =
  | { readonly kind: "local"; readonly message: string }
  | { readonly kind: "syncing"; readonly message: string }
  | { readonly kind: "sheets"; readonly message: string }
  | { readonly kind: "error"; readonly message: string }
