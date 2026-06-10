import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

export const evidencePath = (name: string): string => `.omo/ulw-loop/evidence/${name}`

export const writeEvidence = (path: string, content: string): void => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, "utf8")
}

export const writeJsonEvidence = (path: string, value: unknown): void => {
  writeEvidence(path, `${JSON.stringify(value, null, 2)}\n`)
}
