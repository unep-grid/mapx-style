import { test, expect } from "@playwright/test";
import { waitForMapIdle, setupPage } from "./helpers.js";

// Geneva area at zoom 9: dense city/country/water labels that visibly change
// per language. Same region as sprite demo for consistent regression context.
const VIEW = { center: [6.5, 46.2], zoom: 9 };

const LANGUAGES = ["en", "fr", "ar", "zh", "es", "ru", "bn", "de"];

test.beforeEach(async ({ page }) => {
  await setupPage(page);
  await page.evaluate(
    (v) => window.__mapProd.flyTo({ ...v, duration: 0 }),
    VIEW,
  );
  await waitForMapIdle(page);
});

for (const lang of LANGUAGES) {
  test(`language: ${lang}`, async ({ page }) => {
    await page.locator("#language-picker").selectOption(lang);
    await waitForMapIdle(page);
    await expect(page).toHaveScreenshot(`language-${lang}.png`, {
      maxDiffPixels: 300,
    });
  });
}
