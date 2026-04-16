import { describe, expect, it } from "vitest";
import {
  getStyleAssetBaseUrl,
  resolveGlyphsUrl,
  resolveSpriteIndexUrl,
  resolveSpriteUrls,
} from "./theme_assets.js";

describe("theme_assets", () => {
  it("builds the shared style asset base URL", () => {
    expect(getStyleAssetBaseUrl()).toBe(
      "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1",
    );
  });

  it("resolves glyph and sprite URLs from the same base", () => {
    expect(resolveGlyphsUrl()).toBe(
      "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/glyphs/{fontstack}/{range}.pbf",
    );
    expect(resolveSpriteIndexUrl()).toBe(
      "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/sprites/sprite-index.json",
    );
    expect(resolveSpriteUrls()).toEqual([
      {
        id: "default",
        url: "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/sprites/sprite",
      },
      {
        id: "patterns",
        url: "https://mapx.unepgrid.s3.unige.ch/mapx/style/v1/sprites/sprite_patterns",
      },
    ]);
  });
});
