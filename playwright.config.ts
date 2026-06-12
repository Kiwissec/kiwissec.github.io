import { defineConfig, devices } from "@playwright/test";

// E2E / visual-behaviour smoke tests against the built static site.
// Builds and serves with `astro preview`, then runs chromium at a desktop
// and a mobile viewport. Browser: `npx playwright install chromium`.
const PORT = 4331;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI 另產 html 報告（含 retry 的 trace），由 ci.yml 上傳為 artifact 供
  // 失敗除錯；本機維持精簡的 list 輸出。
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: BASE, trace: "on-first-retry" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --host 127.0.0.1`,
    url: BASE + "/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
