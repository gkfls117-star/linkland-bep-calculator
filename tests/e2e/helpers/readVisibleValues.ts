import type { Page } from "@playwright/test"

export type VisibleDashboardValues = {
  readonly dashboardText: string
}

export const readVisibleDashboardValues = async (page: Page): Promise<VisibleDashboardValues> => ({
  dashboardText: (await page.locator("#dashboard").innerText()).replace(/\s+/g, " ").trim(),
})
