import { describe, expect, it } from "vitest";
import {
  getStyleAssetBaseUrl,
  resolveGlyphsUrl,
  resolveSpriteIndexUrl,
  resolveSpriteUrls,
} from "./theme_assets.js";

const TEST_BASE = "https://example.s3.example.com/mapx";
const TEST_OPT = { baseUrl: TEST_BASE };

describe("theme_assets", () => {
  it("builds the shared style asset base URL", () => {
    expect(getStyleAssetBaseUrl(TEST_OPT)).toBe(
      `${TEST_BASE}/style/v1`,
    );
  });

  it("resolves glyph and sprite URLs from the same base", () => {
    expect(resolveGlyphsUrl(TEST_OPT)).toBe(
      `${TEST_BASE}/style/v1/glyphs/{fontstack}/{range}.pbf`,
    );
    expect(resolveSpriteIndexUrl(TEST_OPT)).toBe(
      `${TEST_BASE}/style/v1/sprites/sprite-index.json`,
    );
    expect(resolveSpriteUrls(TEST_OPT)).toEqual([
      {
        id: "default",
        url: `${TEST_BASE}/style/v1/sprites/sprite`,
      },
      {
        id: "patterns",
        url: `${TEST_BASE}/style/v1/sprites/sprite_patterns`,
      },
    ]);
  });
});
