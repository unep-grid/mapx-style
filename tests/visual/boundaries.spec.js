import { test, expect } from "@playwright/test";
import { createSharedPage, waitReady } from "./helpers.js";

const BOUNDARY_TYPES = ["un", "wmo", "osm", "none"];

test.describe("boundary types", () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await createSharedPage(browser);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  for (const type of BOUNDARY_TYPES) {
    test(type, async () => {
      await page.evaluate((t) => window.__mapxStyle.setBoundaryType(t), type);
      await waitReady(page);
      await expect(page).toHaveScreenshot(`boundary_${type}.png`);
    });
  }
});
