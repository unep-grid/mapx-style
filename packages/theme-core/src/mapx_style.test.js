import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MapxStyle } from "./mapx_style.js";
import { themes } from "./themes/index.js";

// MapxStyle patches window.fetch and maplibregl — only when maplibregl is passed.
// Instantiating with no args skips all DOM/window patching.

describe("MapxStyle (no map)", () => {
  let mx;
  beforeEach(() => { mx = new MapxStyle(); });

  describe("getThemes", () => {
    it("returns all 8 themes", () => {
      expect(mx.getThemes()).toHaveLength(8);
    });
    it("themes match imported themes", () => {
      expect(mx.getThemes()).toBe(themes);
    });
  });

  describe("getTheme", () => {
    it("returns null before setTheme", () => {
      expect(mx.getTheme()).toBeNull();
    });
  });

  describe("getStyle", () => {
    it("returns a MapLibre style object", () => {
      const style = mx.getStyle();
      expect(style.version).toBe(8);
      expect(Array.isArray(style.layers)).toBe(true);
      expect(typeof style.sources).toBe("object");
    });
    it("sprite is an array with default and patterns entries", () => {
      const { sprite } = mx.getStyle();
      expect(Array.isArray(sprite)).toBe(true);
      expect(sprite.find((s) => s.id === "default")).toBeDefined();
      expect(sprite.find((s) => s.id === "patterns")).toBeDefined();
    });
    it("glyphs is a string URL", () => {
      expect(typeof mx.getStyle().glyphs).toBe("string");
      expect(mx.getStyle().glyphs).toContain("{fontstack}");
    });
    it("returns a deep clone (mutations do not affect next call)", () => {
      const a = mx.getStyle();
      a.layers.push({ id: "injected" });
      const b = mx.getStyle();
      expect(b.layers.find((l) => l.id === "injected")).toBeUndefined();
    });
  });

  describe("getStyleDebug", () => {
    it("returns a style object with version 8", () => {
      expect(mx.getStyleDebug().version).toBe(8);
    });
    it("sprite is an array", () => {
      expect(Array.isArray(mx.getStyleDebug().sprite)).toBe(true);
    });
  });

  describe("getLayers", () => {
    it("returns array for a valid theme", () => {
      const result = mx.getLayers(themes[0]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
    it("returns empty array when no theme set", () => {
      expect(mx.getLayers()).toEqual([]);
    });
  });

  describe("getCss", () => {
    it("returns non-empty string for a valid theme", () => {
      const css = mx.getCss(themes[0]);
      expect(typeof css).toBe("string");
      expect(css).toContain("--mx_");
    });
    it("returns empty string when no theme set", () => {
      expect(mx.getCss()).toBe("");
    });
  });

  describe("getLanguage", () => {
    it("defaults to 'en'", () => {
      expect(mx.getLanguage()).toBe("en");
    });
  });
});

describe("MapxStyle sprite index (mocked fetch)", () => {
  const FAKE_INDEX = {
    version: 1,
    sprites: { default: "https://example.com/sprite", patterns: "https://example.com/sprite_patterns" },
    count: 2,
    icons: [
      { id: "maki-airport-11", group: "maki",    sprite: "default",  x: 0,  y: 0,  w: 11, h: 11, sdf: true },
      { id: "t_b_lines_01",    group: "pattern",  sprite: "patterns", x: 0,  y: 0,  w: 32, h: 32, sdf: false },
    ],
  };

  let mx;
  beforeEach(() => {
    mx = new MapxStyle();
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(FAKE_INDEX),
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it("getSpriteIndex fetches and returns the index", async () => {
    const index = await mx.getSpriteIndex();
    expect(index).toEqual(FAKE_INDEX);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("getSpriteIndex caches — second call skips fetch", async () => {
    await mx.getSpriteIndex();
    await mx.getSpriteIndex();
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("getIcons returns icons array", async () => {
    const icons = await mx.getIcons();
    expect(icons).toEqual(FAKE_INDEX.icons);
  });

  it("getIcon finds an icon by id", async () => {
    const icon = await mx.getIcon("maki-airport-11");
    expect(icon).toEqual(FAKE_INDEX.icons[0]);
  });

  it("getIcon returns undefined for unknown id", async () => {
    expect(await mx.getIcon("does-not-exist")).toBeUndefined();
  });
});
