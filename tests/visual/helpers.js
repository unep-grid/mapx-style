const BASE_URL = "http://localhost:5173/mapx-style/";
const VIEWPORT = { width: 1280, height: 800 };

/**
 * Wait for mxStyle to be ready, attaching diagnostics to any timeout error.
 * @param {import("@playwright/test").Page} page
 */
export async function waitReady(page) {
  try {
    await page.evaluate(() => window.__mapxStyle.whenReady());
  } catch (err) {
    const diag = await page
      .evaluate(() => window.__mapxStyle?.getDiagnostics?.() ?? "unavailable")
      .catch(() => "evaluate failed");
    throw Object.assign(err, { diagnostics: diag });
  }
}

/**
 * Navigate to the demo page, clear saved viewport, and wait for initial readiness.
 * @param {import("@playwright/test").Page} page
 */
export async function setupPage(page) {
  await page.addInitScript(() => localStorage.removeItem("mapx_viewport"));
  await page.goto(BASE_URL);
  await page.waitForFunction(
    () => typeof window.__mapxStyle?.whenReady === "function",
  );
  await waitReady(page);
}

/**
 * Create a browser context + page suitable for sharing across all tests in a
 * describe block. Navigates to the demo and waits for initial readiness.
 *
 * Usage in a describe block:
 *   let page;
 *   test.beforeAll(async ({ browser }) => { page = await createSharedPage(browser); });
 *   test.afterAll(async () => { await page.context().close(); });
 *
 * @param {import("@playwright/test").Browser} browser
 * @returns {Promise<import("@playwright/test").Page>}
 */
export async function createSharedPage(browser) {
  const ctx = await browser.newContext({ baseURL: BASE_URL, viewport: VIEWPORT });
  const page = await ctx.newPage();
  await setupPage(page);
  return page;
}
