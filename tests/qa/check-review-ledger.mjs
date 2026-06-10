import { existsSync, readFileSync } from "node:fs"
import { argv, exit } from "node:process"

const requiredRoles = ["테스트 사용자", "검수 에이전트"]
const requiredSections = ["OPEN DEFECTS", "CLOSED DEFECTS", "REOPENED DEFECTS", "REVIEWER APPROVED", "Evidence Index"]
const openFields = ["family", "severity", "reproduction", "expected", "actual", "evidence"]
const closedFields = ["RED command", "GREEN command", "QA command", "evidence", "cleanup", "reviewer"]

const optionValue = (name) => {
  const index = argv.indexOf(name)
  if (index === -1) return null
  return argv[index + 1] ?? null
}

const hasFlag = (name) => argv.includes(name)

const target = optionValue("--ledger") ?? optionValue("--fixture")
const expectFail = hasFlag("--expect-fail")

if (target === null || !existsSync(target)) {
  console.error(`ledger missing: ${target ?? "(none)"}`)
  exit(expectFail ? 0 : 1)
}

const text = readFileSync(target, "utf8")
const failures = []

if (hasFlag("--require-roles")) {
  for (const role of requiredRoles) {
    if (!text.includes(role)) failures.push(`missing role: ${role}`)
  }
}

for (const section of requiredSections) {
  if (!text.includes(section)) failures.push(`missing section: ${section}`)
}

const defectBlocks = [...text.matchAll(/### ((?:OPEN|CLOSED|REOPENED) DEFECT-\d+)([\s\S]*?)(?=\n### |\n## |$)/g)]

for (const match of defectBlocks) {
  const title = match[1] ?? ""
  const body = match[2] ?? ""
  if (title.startsWith("OPEN") || title.startsWith("REOPENED")) {
    for (const field of openFields) {
      if (!body.includes(field)) failures.push(`${title} missing ${field}`)
    }
  }
  if (title.startsWith("CLOSED")) {
    for (const field of closedFields) {
      if (!body.includes(field)) failures.push(`${title} missing ${field}`)
    }
  }
}

if (hasFlag("--expect-empty-open") && /### OPEN DEFECT-\d+/.test(text)) {
  failures.push("expected no open defects")
}

if (hasFlag("--require-no-open") && /### (?:OPEN|REOPENED) DEFECT-\d+/.test(text)) {
  failures.push("open or reopened defects remain")
}

if (hasFlag("--require-reviewer-approved") && !/REVIEWER APPROVED[\s\S]*approved/i.test(text)) {
  failures.push("reviewer approval missing")
}

if (hasFlag("--require-evidence-files")) {
  const evidencePaths = [
    ...text.matchAll(/^- evidence:\s*(.+)$/gm),
    ...text.matchAll(/^- [^:]+:\s*(.+)$/gm),
  ]
    .flatMap((match) => [...(match[1] ?? "").matchAll(/`([^`]+)`/g)].map((pathMatch) => pathMatch[1] ?? ""))
    .filter((path) => path.startsWith(".omo/ulw-loop/evidence/"))

  if (evidencePaths.length === 0) failures.push("no evidence files referenced")
  for (const evidencePath of new Set(evidencePaths)) {
    if (!existsSync(evidencePath)) failures.push(`evidence file missing: ${evidencePath}`)
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  exit(expectFail ? 0 : 1)
}

console.log("ledger ok")
exit(expectFail ? 1 : 0)
