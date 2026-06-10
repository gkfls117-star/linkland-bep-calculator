import { expect, test } from "@playwright/test"
import { calculateBep, withCalculatedOfflineRevenue } from "../../src/lib/calc"
import { defaultInput, defaultScenario } from "../../src/lib/defaults"
import { formatMoney } from "../../src/lib/format"
import { defaultDashboardOracle } from "./helpers/calculationOracle"
import { evidencePath, writeEvidence, writeJsonEvidence } from "./helpers/evidence"
import { readVisibleDashboardValues } from "./helpers/readVisibleValues"

const consoleEvidence: string[] = []

test.beforeEach(async ({ page }) => {
  consoleEvidence.length = 0
  page.on("console", (message) => {
    if (message.type() === "error") consoleEvidence.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleEvidence.push(error.message)
  })
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
})

test.afterEach(async () => {
  writeJsonEvidence(evidencePath("task-1-console.json"), consoleEvidence)
})

test("Browser harness opens the actual calculator @qa-harness", async ({ page }) => {
  await expect(page.locator("aside").filter({ hasText: /오프라인 ON|线下 ON/ })).toBeVisible()
  await expect(page.locator("#dashboard")).toBeVisible()
  await expect(page.getByRole("heading", { name: /주변 매장 분석|周边门店分析/ })).toBeVisible()
  await expect(page.getByRole("heading", { name: /시나리오 비교|方案对比/ })).toBeVisible()
  await expect(page.getByRole("heading", { name: /시나리오 빠른 비교|方案快速比较/ })).toBeVisible()
  await expect(page.locator("#dashboard").getByText(/합산 월매출|合计月销售额/)).toBeVisible()

  await page.screenshot({ fullPage: true, path: evidencePath("task-1-home.png") })
  expect(consoleEvidence).toEqual([])
})

test("Calculation oracle reads visible dashboard values @oracle-smoke", async ({ page }) => {
  const oracle = defaultDashboardOracle("KRW", 217.19)
  const visible = await readVisibleDashboardValues(page)

  expect(visible.dashboardText).toContain(oracle.combinedRevenue)
  expect(visible.dashboardText).toContain(oracle.combinedProfit)
  expect(visible.dashboardText).toContain(oracle.offlineProfit)
  expect(visible.dashboardText).toContain(oracle.onlineProfit)

  writeJsonEvidence(evidencePath("task-3-oracle-smoke.json"), { oracle, visible })
})

test("DEFECT-001 Given only deleted cached scenarios When opening the app Then the default preset is restored @explore-scenarios @defect-001", async ({
  page,
}) => {
  const deletedScenario = {
    ...defaultScenario(),
    id: "deleted_cached",
    name: "Deleted cached scenario",
    isDeleted: true,
  }
  await page.evaluate((scenario) => {
    window.localStorage.setItem("linkland:bep:scenarios", JSON.stringify([scenario]))
  }, deletedScenario)
  await page.reload()

  const bodyText = await page.locator("body").innerText()

  expect(bodyText).toContain("링크랜드 현재 가정")
  expect(bodyText).not.toContain("Deleted cached scenario")
  writeJsonEvidence(evidencePath("defect-001-browser.json"), {
    hasDefaultScenario: bodyText.includes("링크랜드 현재 가정"),
    hasDeletedScenario: bodyText.includes("Deleted cached scenario"),
  })
  await page.screenshot({ fullPage: true, path: evidencePath("defect-001-browser.png") })
})

test("DEFECT-003 DEFECT-004 Given a previously loaded preset When refreshing Then the active preset and quick profit stay aligned @explore-scenarios @defect-003 @defect-004", async ({
  page,
}) => {
  const presetA = {
    ...defaultScenario(),
    id: "preset_a",
    name: "Preset A",
    data: {
      ...defaultInput,
      monthlyVisitors: 300000,
      conversionRate: 5,
      avgOrderValue: 100000,
      onlineMonthlyRevenue: 50000000,
      offlineFixed: [],
      onlineCosts: [],
      investment: [],
    },
    updatedAt: "2026-06-10T00:00:00.000Z",
  }
  const presetB = {
    ...defaultScenario(),
    id: "preset_b",
    name: "Preset B",
    updatedAt: "2026-06-11T00:00:00.000Z",
  }
  const presetAInput = withCalculatedOfflineRevenue(presetA.data)
  const presetAProfit = formatMoney(calculateBep(presetAInput).combinedMonthlyProfit, "KRW", 217.19, true)

  await page.evaluate(
    ({ activeId, scenarios }) => {
      window.localStorage.setItem("linkland:bep:activeScenarioId", activeId)
      window.localStorage.setItem("linkland:bep:scenarios", JSON.stringify(scenarios))
    },
    { activeId: presetA.id, scenarios: [presetB, presetA] },
  )
  await page.reload()

  await expect(page.locator("#dashboard")).toContainText("Preset A")
  await expect(page.getByText("현재 합산이익").locator("..")).toContainText(presetAProfit)
  await page.screenshot({ fullPage: true, path: evidencePath("defect-003-004-active-preset.png") })
})

test("DEFECT-005 Given dirty assumptions When restoring defaults Then the calculator returns to the default preset @explore-scenarios @defect-005", async ({
  page,
}) => {
  await page.locator("aside label").filter({ hasText: "월 방문객" }).locator("input").fill("1")
  await expect(page.locator("#dashboard")).not.toContainText("합산 월매출₩82,000,000")

  await page.getByRole("button", { name: "기본값 복원" }).click()

  await expect(page.locator("#dashboard")).toContainText("링크랜드 현재 가정")
  await expect(page.locator("#dashboard")).toContainText("합산 월매출₩82,000,000")
  await page.screenshot({ fullPage: true, path: evidencePath("defect-005-reset-default.png") })
})

test("Given investment rows change When adding recoverable cash Then dashboard totals follow the row state @explore-dynamic-items", async ({
  page,
}) => {
  const dashboard = page.locator("#dashboard")
  const investmentEditor = page
    .getByRole("heading", { name: "임차/초기 투자비" })
    .locator("xpath=ancestor::div[contains(@class, 'space-y-2')][1]")

  await expect(dashboard).toContainText("초기 필요 현금₩760,000,000")
  await expect(dashboard).toContainText("회수 가능 투자비₩580,000,000")

  await investmentEditor.getByRole("button", { name: /항목 추가/ }).click()
  await expect(investmentEditor.locator('input[inputmode="decimal"]')).toHaveCount(5)
  await investmentEditor.locator('input[inputmode="decimal"]').last().fill("10000000")

  await expect(dashboard).toContainText("초기 필요 현금₩770,000,000")
  await expect(dashboard).toContainText("회수 가능 투자비₩580,000,000")

  await investmentEditor.locator('input[type="checkbox"]').last().check()
  await expect(dashboard).toContainText("회수 가능 투자비₩590,000,000")

  await investmentEditor.locator("button").last().click()
  await expect(dashboard).toContainText("초기 필요 현금₩760,000,000")
  await expect(dashboard).toContainText("회수 가능 투자비₩580,000,000")

  writeEvidence(
    evidencePath("task-7-dynamic-items.md"),
    [
      "# Task 7 Dynamic Items",
      "",
      "- Added a new investment row.",
      "- Set it to KRW 10,000,000 and verified initial cash increased.",
      "- Checked recoverable and verified recoverable investment increased.",
      "- Deleted the row and verified both dashboard totals returned to baseline.",
      "",
    ].join("\n"),
  )
  await page.screenshot({ fullPage: true, path: evidencePath("task-7-dynamic-items.png") })
})

test("Given a real investor walkthrough When editing assumptions and reviewing outputs Then core flows stay coherent @final-full-walkthrough", async ({
  page,
}) => {
  const dashboard = page.locator("#dashboard")
  const inputPanel = page.locator("aside").filter({ hasText: /오프라인 ON|线下 ON/ })

  await inputPanel.locator("label").filter({ hasText: "월 방문객" }).locator("input").fill("250,000")
  await inputPanel.locator("label").filter({ hasText: "구매 전환율" }).locator("input").fill("2")
  await inputPanel.locator("label").filter({ hasText: "객단가" }).locator("input").fill("45,000")
  await inputPanel.locator("label").filter({ hasText: "온라인 월매출" }).locator("input").fill("80,000,000")

  await expect(dashboard).toContainText("합산 월매출")
  await expect(dashboard).toContainText("오프라인 손익")
  await expect(dashboard).toContainText("온라인 손익")
  await expect(dashboard).toContainText("합산/투자")

  await page.getByRole("button", { name: /CN CNY/ }).click()
  await expect(dashboard).toContainText("合计月销售额")
  await page.getByRole("button", { name: /KR KRW/ }).click()
  await expect(dashboard).toContainText("합산 월매출")

  await page.getByRole("link", { name: "주변 매장 분석" }).click()
  await expect(page.locator("#market")).toBeInViewport()
  await page.getByRole("link", { name: "시나리오 비교" }).click()
  await expect(page.locator("#scenarios")).toBeInViewport()

  writeEvidence(
    evidencePath("final-full-walkthrough.md"),
    [
      "# Final Full Walkthrough",
      "",
      "- Edited offline traffic, conversion, AOV, and online revenue assumptions.",
      "- Verified dashboard, offline, online, and combined investment sections remained visible.",
      "- Switched Korean/KRW to Chinese/CNY and back.",
      "- Used sidebar anchors for market analysis and scenario comparison.",
      "- No console or page errors were recorded by the shared Playwright harness.",
      "",
    ].join("\n"),
  )
  await page.screenshot({ fullPage: true, path: evidencePath("final-full-walkthrough.png") })
  expect(consoleEvidence).toEqual([])
})
