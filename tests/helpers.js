/**
 * Shared Playwright test helpers.
 */

/**
 * Wait for MapLibre to finish rendering — no pending tiles, no active animation.
 * Relies on window.__mapProd being set by main.js.
 */
export async function waitForMapIdle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const map = window.__mapProd;
        if (!map) return resolve();
        if (map.isStyleLoaded() && !map.isMoving()) return resolve();
        map.once("idle", resolve);
      }),
  );
}

/**
 * Navigate to the demo, clear any persisted viewport, and wait for the map
 * to be fully loaded. Call this in beforeEach for a clean, reproducible start.
 */
export async function setupPage(page) {
  await page.addInitScript(() => localStorage.removeItem("mapx_viewport"));
  await page.goto("/");
  await page.waitForFunction(() => window.__mapProd?.isStyleLoaded?.());
}
