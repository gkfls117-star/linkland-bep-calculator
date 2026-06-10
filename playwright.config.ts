import { defineConfig } from "@playwright/test"

const PORT = 43977
const HOST = "127.0.0.1"
const BASE_URL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  workers: 1,
  outputDir: "test-results",
  reporter: [["line"]],
  use: {
    baseURL: BASE_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT} --strictPort`,
    reuseExistingServer: true,
    timeout: 120_000,
    url: BASE_URL,
  },
  projects: [
    {
      name: "chrome",
      use: { channel: "chrome" },
    },
  ],
})
