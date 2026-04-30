import { test, expect } from "@playwright/test";
import { createSharedPage, waitReady } from "./helpers.js";

const LANGUAGES = ["en", "fr", "ar", "zh", "es", "ru", "bn", "de"];

test.describe("languages", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await createSharedPage(browser);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  for (const lang of LANGUAGES) {
    test(lang, async () => {
      await page.locator("#language-picker").selectOption(lang);
      await waitReady(page);
      await expect(page).toHaveScreenshot(`${lang}.png`);
    });
  }
});
