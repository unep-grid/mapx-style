import { test, expect } from "@playwright/test";
import { waitForMapIdle, setupPage } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await setupPage(page);
});

test("patterns grid", async ({ page }) => {
  await page.locator("#toggle-demo-patterns").check();
  await waitForMapIdle(page);
  await expect(page).toHaveScreenshot("patterns-grid.png", {
    maxDiffPixels: 500,
  });
});

test("icons grid", async ({ page }) => {
  await page.locator("#toggle-demo-icons").check();
  await waitForMapIdle(page);
  await expect(page).toHaveScreenshot("icons-grid.png", {
    maxDiffPixels: 500,
  });
});
