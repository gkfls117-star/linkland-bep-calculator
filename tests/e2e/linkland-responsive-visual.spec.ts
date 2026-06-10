import { expect, test, type Page } from "@playwright/test"
import { evidencePath, writeJsonEvidence } from "./helpers/evidence"

test("Responsive visual harness is ready @ui-harness", async ({ page }) => {
  await page.goto("/")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator("#dashboard")).toBeVisible()
})

test("Dashboard and input panel keep the polished calculator rhythm @ui-dashboard-input-polish", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")

  await expect(page.locator("#dashboard")).toBeVisible()
  await expect(page.locator("aside").filter({ hasText: /오프라인 ON|线下 ON/ })).toBeVisible()
  await expect(page.getByRole("heading", { name: "오프라인 손익" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "온라인 손익" })).toBeVisible()
  await page.screenshot({ fullPage: true, path: evidencePath("ui-dashboard-input-polish.png") })
})

test("Channel toggles change visible dashboard totals without breaking KPI cards @ui-channel-toggle", async ({
  page,
}) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")

  const dashboard = page.locator("#dashboard")
  await expect(dashboard.getByText("합산 월매출").locator("..")).toContainText("₩82,000,000")

  await page.getByRole("button", { name: "오프라인 ON" }).click()
  await expect(page.getByRole("button", { name: "오프라인 OFF" })).toBeVisible()
  await expect(dashboard.getByText("합산 월매출").locator("..")).toContainText("₩22,000,000")
  await expect(dashboard.getByText("오프라인 이익").locator("..")).toContainText("₩0")

  await page.getByRole("button", { name: "온라인 ON" }).click()
  await expect(page.getByRole("button", { name: "온라인 OFF" })).toBeVisible()
  await expect(dashboard.getByText("합산 월매출").locator("..")).toContainText("₩0")
  await expect(page.getByText("현재 합산이익").locator("..")).toContainText("₩0")

  const metricsOverflow = await dashboard.locator(".metric-card").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect()
      return {
        width: rect.width,
        scrollWidth: card.scrollWidth,
      }
    }),
  )
  expect(metricsOverflow.every((metric) => metric.scrollWidth <= Math.ceil(metric.width) + 1)).toBe(true)
  await page.screenshot({ fullPage: true, path: evidencePath("ui-channel-toggle.png") })
})

test("Lower sections keep consistent cards, tables, and market editing UI @ui-lower-sections-polish", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")
  await page.locator("#market").scrollIntoViewIfNeeded()

  await expect(page.getByRole("heading", { name: "주변 매장 분석" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "시나리오 비교" })).toBeVisible()
  await expect(page.getByRole("button", { name: /매장 추가/ })).toBeVisible()
  await page.screenshot({ fullPage: true, path: evidencePath("ui-lower-sections-polish.png") })
})

test("Responsive bilingual review has no page overflow and preserves readable KPI surfaces @ui-responsive-bilingual-polish @final-ui-review", async ({
  page,
}) => {
  const report: ResponsiveReport[] = []
  const viewports = [
    { label: "desktop", width: 1440, height: 1000 },
    { label: "tablet", width: 1024, height: 900 },
    { label: "mobile390", width: 390, height: 844 },
    { label: "mobile360", width: 360, height: 780 },
  ] as const

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto("/")
    await expectNoPageOverflow(page, viewport.width)
    await page.getByRole("button", { name: /CN CNY/ }).click()
    await expect(page.locator("#dashboard")).toContainText("合计月销售额")
    await expectNoPageOverflow(page, viewport.width)
    report.push({
      label: viewport.label,
      width: viewport.width,
      height: viewport.height,
      documentWidth: await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      })),
    })
  }

  writeJsonEvidence(evidencePath("ui-responsive-bilingual-report.json"), report)
  writeJsonEvidence(evidencePath("final-ui-review.json"), {
    status: "passed",
    report,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.screenshot({ fullPage: true, path: evidencePath("ui-responsive-ko-mobile.png") })
  await page.getByRole("button", { name: /CN CNY/ }).click()
  await page.screenshot({ fullPage: true, path: evidencePath("ui-responsive-zh-mobile.png") })
})

type ResponsiveReport = {
  readonly label: string
  readonly width: number
  readonly height: number
  readonly documentWidth: {
    readonly client: number
    readonly scroll: number
  }
}

const expectNoPageOverflow = async (page: Page, expectedWidth: number): Promise<void> => {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ client: expectedWidth, scroll: expectedWidth })
}
