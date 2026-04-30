import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  snapshotDir: "tests/visual/__snapshots__",
  // serialize tests — concurrent pages hit the same Vite dev server and
  // the same remote tile/glyph endpoints, which causes readiness timeouts
  // on the last tests to run when the system is under load.
  workers: 1,
  use: {
    baseURL: "http://localhost:5173/mapx-style/",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173/mapx-style/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
