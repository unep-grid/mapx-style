import { test, expect } from "@playwright/test";
import { createSharedPage, waitReady } from "./helpers.js";

const THEMES = [
  "color_light",
  "color_dark",
  "water_light",
  "water_dark",
  "tree_light",
  "tree_dark",
  "classic_light",
  "classic_dark",
];

test.describe("themes", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await createSharedPage(browser);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  for (const theme of THEMES) {
    test(theme, async () => {
      await page.locator("#theme-picker").selectOption(theme);
      await waitReady(page);
      await expect(page).toHaveScreenshot(`${theme}.png`);
    });
  }
});
