import { test, expect } from "@playwright/test";
import { waitForMapIdle, setupPage } from "./helpers.js";

// Europe/Mediterranean at zoom 4: ocean, land, coastlines, roads visible.
// Maximum color variation between themes.
const VIEW = { center: [15, 45], zoom: 4 };

const THEME_IDS = [
  "classic_light",
  "classic_dark",
  "color_light",
  "color_dark",
  "tree_light",
  "tree_dark",
  "water_light",
  "water_dark",
];

test.beforeEach(async ({ page }) => {
  await setupPage(page);
  await page.evaluate(
    (v) => window.__mapProd.flyTo({ ...v, duration: 0 }),
    VIEW,
  );
  await waitForMapIdle(page);
});

for (const id of THEME_IDS) {
  test(`theme: ${id}`, async ({ page }) => {
    await page.locator("#theme-picker").selectOption(id);
    await waitForMapIdle(page);
    await expect(page).toHaveScreenshot(`theme-${id}.png`, {
      maxDiffPixels: 300,
    });
  });
}
