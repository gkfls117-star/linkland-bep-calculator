import { expect, type Page, test } from "@playwright/test"
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import { calculateBep } from "../../src/lib/calc"
import { defaultInput } from "../../src/lib/defaults"
import { formatMonths } from "../../src/lib/format"
import { evidencePath } from "./helpers/evidence"

test("Defect regression harness is ready @defect-harness", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("#dashboard")).toBeVisible()
})

test("DEFECT-001 @defect-001 Given recoverable investment When profit is positive Then dashboard payback uses net invested cash", async ({
  page,
}) => {
  await page.goto("/")
  await field(page, "월 방문객").fill("1,000,000")

  const expected = calculateBep({ ...defaultInput, monthlyVisitors: 1000000 })
  const expectedPayback = formatMonths(expected.paybackMonths, "ko")
  const oldPayback = formatMonths(760000000 / expected.combinedMonthlyProfit, "ko")

  await expect(page.locator("#dashboard").getByText(expectedPayback).first()).toBeVisible()
  await expect(page.locator("#dashboard").getByText(oldPayback, { exact: true })).toHaveCount(0)
  await page.screenshot({ fullPage: true, path: evidencePath("defect-001-payback-green.png") })
})

test("DEFECT-002 @defect-002 Given invalid negative and over-limit values When typing Then inputs clamp before calculation", async ({
  page,
}) => {
  await page.goto("/")

  await field(page, "월 방문객").fill("-1,000")
  await expect(field(page, "월 방문객")).toHaveValue("0")

  await field(page, "구매 전환율").fill("150")
  await expect(field(page, "구매 전환율")).toHaveValue("100")

  await field(page, "객단가").fill("-20,000")
  await expect(field(page, "객단가")).toHaveValue("0")

  await page.screenshot({ fullPage: true, path: evidencePath("defect-002-input-clamp-green.png") })
})

test("DEFECT-005 @defect-005 Given sidebar anchors When clicking market and scenarios Then page scrolls to real sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  await page.getByRole("link", { name: "주변 매장 분석" }).click()
  await expect(page.locator("#market")).toBeInViewport()

  await page.getByRole("link", { name: "시나리오 비교" }).click()
  await expect(page.locator("#scenarios")).toBeInViewport()
  await page.screenshot({ fullPage: true, path: evidencePath("defect-005-sidebar-anchors-green.png") })
})

test("DEFECT-006 @defect-006 Given stale local cache When Sheets returns empty lists Then stale rows are removed", async ({
  page,
}) => {
  const fixture = await startFixture(4881)
  try {
    await fetch("http://127.0.0.1:4881/exec?action=deleteScenario&id=qa_scenario_1")
    await fetch("http://127.0.0.1:4881/exec?action=deleteMarketStore&id=qa_store_1")

    await page.addInitScript((input) => {
      localStorage.setItem(
        "linkland:bep:settings",
        JSON.stringify({
          language: "ko",
          exchangeRate: 217.19,
          appsScriptUrl: "http://127.0.0.1:4881/exec",
          writeKey: "",
        }),
      )
      localStorage.setItem(
        "linkland:bep:scenarios",
        JSON.stringify([
          {
            id: "qa_scenario_1",
            name: "QA 시나리오",
            data: {
              ...input,
              judgmentMemo: "stale scenario",
            },
            updatedAt: new Date().toISOString(),
            updatedBy: "fixture",
            isDeleted: false,
          },
        ]),
      )
      localStorage.setItem(
        "linkland:bep:marketStores",
        JSON.stringify([
          {
            id: "qa_store_1",
            nameKo: "QA 매장",
            nameZh: "QA 门店",
            categoryKo: "테스트",
            categoryZh: "测试",
            monthlyRevenue: 300000000,
            peakMonthlyRevenue: 400000000,
            avgOrderValue: 30000,
            conversion: 10,
            margin: 55,
            noteKo: "stale",
            noteZh: "stale",
            updatedAt: new Date().toISOString(),
            isDeleted: false,
          },
        ]),
      )
    }, defaultInput)

    await page.goto("/")
    await expect.poll(async () => page.evaluate(() => localStorage.getItem("linkland:bep:scenarios") ?? "")).not.toContain("QA 시나리오")
    await expect.poll(async () => page.evaluate(() => localStorage.getItem("linkland:bep:marketStores") ?? "")).toBe("[]")
    await expect(page.getByText("QA 시나리오")).toHaveCount(0)
    await expect(page.getByText("QA 매장")).toHaveCount(0)
    await expect(page.getByText("링크랜드 현재 가정").first()).toBeVisible()
    await page.screenshot({ fullPage: true, path: evidencePath("defect-006-empty-sheets-green.png") })
  } finally {
    await stopFixture(fixture, 4881)
  }
})

test("DEFECT-003 @defect-003 Given 360px mobile viewport When using Chinese CNY Then document has no page-level horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto("/")
  await page.getByRole("button", { name: /CN CNY/ }).click()

  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ clientWidth: 360, scrollWidth: 360 })
  await page.screenshot({ fullPage: true, path: evidencePath("defect-003-mobile-overflow-green.png") })
})

test("DEFECT-004 @defect-004 Given default scenario When switching to Chinese Then default scenario name and memo are localized", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: /CN CNY/ }).click()

  await expect(page.getByText("Linkland 当前假设").first()).toBeVisible()
  await expect(page.getByText("以可回收转让费为前提，第3年以后回收的方案相对稳定。").first()).toBeVisible()
  await expect(page.getByText("링크랜드 현재 가정")).toHaveCount(0)
  await expect(page.getByText("권리금 회수 가능성을 전제로 3년차 이후 회수 시나리오가 안정권입니다.")).toHaveCount(0)
  await page.screenshot({ fullPage: true, path: evidencePath("defect-004-i18n-defaults-green.png") })
})

const field = (page: Page, label: string) =>
  page
    .locator("aside")
    .filter({ hasText: /오프라인 ON|线下 ON/ })
    .locator("label")
    .filter({ hasText: label })
    .locator("input")

const startFixture = async (port: number): Promise<ChildProcessWithoutNullStreams> => {
  const child = spawn(process.execPath, [
    "tests/fixtures/apps-script-fixture.mjs",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--mode",
    "ok",
  ])
  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/exec?action=listScenarios`)
      if (response.ok) return child
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  child.kill()
  throw new Error("fixture did not start")
}

const stopFixture = async (child: ChildProcessWithoutNullStreams, port: number): Promise<void> => {
  try {
    await fetch(`http://127.0.0.1:${port}/__shutdown`)
  } catch {
    child.kill()
  }
}
