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
    it("returns cloned themes rather than canonical references", () => {
      const listedThemes = mx.getThemes();
      expect(listedThemes).not.toBe(themes);
      expect(listedThemes.map((theme) => theme.id)).toEqual(
        themes.map((theme) => theme.id),
      );
      expect(listedThemes[0]).not.toBe(themes[0]);
    });
  });

  describe("getTheme", () => {
    it("returns null before setTheme", () => {
      expect(mx.getTheme()).toBeNull();
    });
    it("accepts a theme id in the constructor", () => {
      const themed = new MapxStyle({ theme: "classic_light" });
      expect(themed.getTheme()?.id).toBe("classic_light");
    });
    it("accepts a full theme object in the constructor", () => {
      const themed = new MapxStyle({ theme: themes[0] });
      expect(themed.getTheme()).toEqual(themes[0]);
      expect(themed.getTheme()).not.toBe(themes[0]);
    });
    it("returns a clone of the active theme", () => {
      const themed = new MapxStyle({ theme: themes[0] });
      const activeTheme = themed.getTheme();
      activeTheme.colors.mx_ui_text.color = "#000";
      expect(themed.getTheme().colors.mx_ui_text.color).toBe(
        themes[0].colors.mx_ui_text.color,
      );
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
    it("applies source overrides to the production style", () => {
      const satellite = {
        type: "raster",
        tiles: ["https://example.test/{z}/{x}/{y}.jpg"],
        tileSize: 256,
        maxzoom: 19,
      };
      const themed = new MapxStyle({
        sourceOverrides: { satellite },
      });

      const style = themed.getStyle();
      expect(style.sources.satellite).toEqual(satellite);
      expect(style.sources.satellite).not.toBe(satellite);
    });
  });

  describe("getStyleDebug", () => {
    it("returns a style object with version 8", () => {
      expect(mx.getStyleDebug().version).toBe(8);
    });
    it("sprite is an array", () => {
      expect(Array.isArray(mx.getStyleDebug().sprite)).toBe(true);
    });
    it("does not apply source overrides to the debug style", () => {
      const themed = new MapxStyle({
        sourceOverrides: {
          satellite: {
            type: "raster",
            tiles: ["https://example.test/{z}/{x}/{y}.jpg"],
            tileSize: 256,
            maxzoom: 19,
          },
        },
      });

      expect(themed.getStyleDebug().sources.satellite.tiles[0]).toContain(
        "tiles.maps.eox.at",
      );
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
    it("stores language before a map is attached", () => {
      mx.setLanguage("fr");
      expect(mx.getLanguage()).toBe("fr");
    });
  });
});

describe("MapxStyle language application", () => {
  it("applies stored language when a map is attached", () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = {
      isStyleLoaded: vi.fn(() => true),
      on: vi.fn(),
      once: vi.fn(),
      getLayer: vi.fn((id) => id === "road-label"),
      setLayoutProperty: vi.fn(),
    };

    mx.setLanguage("fr");
    mx.attachMap(map);

    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      "road-label",
      "text-field",
      [
        "coalesce",
        ["get", "name:fr"],
        ["get", "name_fr"],
        ["get", "name:en"],
        ["get", "name_en"],
        ["get", "name"],
      ],
    );
  });

  it("waits for map load before applying stored language", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    let loadHandler;
    const map = {
      isStyleLoaded: vi.fn(() => false),
      on: vi.fn(),
      once: vi.fn((event, handler) => {
        if (event === "load") loadHandler = handler;
      }),
      getLayer: vi.fn((id) => id === "road-label"),
      setLayoutProperty: vi.fn(),
    };

    mx.setLanguage("fr");
    const attached = mx.attachMap(map);

    expect(map.setLayoutProperty).not.toHaveBeenCalled();

    loadHandler();
    await attached;

    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      "road-label",
      "text-field",
      [
        "coalesce",
        ["get", "name:fr"],
        ["get", "name_fr"],
        ["get", "name:en"],
        ["get", "name_en"],
        ["get", "name"],
      ],
    );
  });

  it("marks expected Mapterhorn terrain 404s as ignored", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    let errorHandler;
    const map = {
      isStyleLoaded: vi.fn(() => true),
      on: vi.fn((event, handler) => {
        if (event === "error") errorHandler = handler;
      }),
      once: vi.fn(),
      getLayer: vi.fn(() => null),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };
    const event = {
      error: {
        message: "Bad response: 404 for https://tiles.mapterhorn.com/6/30/16.webp",
      },
      preventDefault: vi.fn(),
    };

    await mx.attachMap(map);
    errorHandler(event);

    expect(event._mapxStyleIgnore).toBe(true);
    expect(event.error._mapxStyleIgnore).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("keeps unrelated map errors visible", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    let errorHandler;
    const map = {
      isStyleLoaded: vi.fn(() => true),
      on: vi.fn((event, handler) => {
        if (event === "error") errorHandler = handler;
      }),
      once: vi.fn(),
      getLayer: vi.fn(() => null),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };
    const event = {
      error: {
        status: 404,
        message: "Bad response: 404 for https://example.com/6/30/16.webp",
      },
      preventDefault: vi.fn(),
    };

    await mx.attachMap(map);
    errorHandler(event);

    expect(event._mapxStyleIgnore).toBeUndefined();
    expect(event.error._mapxStyleIgnore).toBeUndefined();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("applies language immediately when a map is already attached", () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = {
      isStyleLoaded: vi.fn(() => true),
      on: vi.fn(),
      once: vi.fn(),
      getLayer: vi.fn((id) => id === "road-label"),
      setLayoutProperty: vi.fn(),
    };

    mx.attachMap(map);
    map.setLayoutProperty.mockClear();

    mx.setLanguage("ar");

    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      "road-label",
      "text-field",
      [
        "coalesce",
        ["get", "name:ar"],
        ["get", "name_ar"],
        ["get", "name:en"],
        ["get", "name_en"],
        ["get", "name"],
      ],
    );
  });
});

describe("MapxStyle sprite index (mocked fetch)", () => {
  const FAKE_INDEX = {
    version: 1,
    sprites: { default: "https://example.com/sprite", patterns: "https://example.com/sprite_patterns" },
    count: 2,
    icons: [
      {
        id: "maki-airport-11",
        group: "maki",
        sprite: "default",
        x: 0,
        y: 0,
        w: 17,
        h: 17,
        sdf: true,
        svg: '<svg width="11px" height="11px" viewBox="0 0 11 11"><path fill="currentColor"></path></svg>',
      },
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

  it("getSprites filters by group", async () => {
    const sprites = await mx.getSprites({ groups: ["maki"] });
    expect(sprites).toEqual([FAKE_INDEX.icons[0]]);
  });

  it("getSprites returns all icons without groups", async () => {
    const sprites = await mx.getSprites();
    expect(sprites).toEqual(FAKE_INDEX.icons);
  });

  it("getIcon finds an icon by id", async () => {
    const icon = await mx.getIcon("maki-airport-11");
    expect(icon).toEqual(FAKE_INDEX.icons[0]);
  });

  it("getIcon returns undefined for unknown id", async () => {
    expect(await mx.getIcon("does-not-exist")).toBeUndefined();
  });

  describe("getIconDimensions", () => {
    it("returns {w, h} for a known icon", async () => {
      expect(await mx.getIconDimensions("maki-airport-11")).toEqual({ w: 17, h: 17 });
    });
    it("returns {w, h} for a known pattern", async () => {
      expect(await mx.getIconDimensions("t_b_lines_01")).toEqual({ w: 32, h: 32 });
    });
    it("returns null for an unknown id", async () => {
      expect(await mx.getIconDimensions("does-not-exist")).toBeNull();
    });
    it("fetches sprite-index only once across multiple calls", async () => {
      await mx.getIconDimensions("maki-airport-11");
      await mx.getIconDimensions("t_b_lines_01");
      expect(globalThis.fetch).toHaveBeenCalledOnce();
    });
  });

  describe("getIconMetrics", () => {
    it("returns padded tile and visible SVG dimensions for SDF icons", async () => {
      expect(await mx.getIconMetrics("maki-airport-11")).toEqual({
        w: 17,
        h: 17,
        contentW: 11,
        contentH: 11,
        sdf: true,
      });
    });

    it("falls back to tile dimensions for patterns", async () => {
      expect(await mx.getIconMetrics("t_b_lines_01")).toEqual({
        w: 32,
        h: 32,
        contentW: 32,
        contentH: 32,
        sdf: false,
      });
    });
  });
});

describe("MapxStyle resolveSpriteName (mock map)", () => {
  // Images: "maki-airport-11" is in the default sprite (bare name),
  //         "t_b_lines_01" is in the patterns sprite (prefixed name).
  const hasImage = (id) =>
    id === "maki-airport-11" || id === "patterns:t_b_lines_01";

  let mx;
  beforeEach(() => {
    mx = new MapxStyle();
    mx._map = { hasImage: vi.fn(hasImage) };
  });

  it("returns bare id when image is in the default sprite", () => {
    expect(mx.resolveSpriteName("maki-airport-11")).toBe("maki-airport-11");
  });
  it("returns prefixed id when image is only in the patterns sprite", () => {
    expect(mx.resolveSpriteName("t_b_lines_01")).toBe("patterns:t_b_lines_01");
  });
  it("falls back to bare id when image is not found in any sprite", () => {
    expect(mx.resolveSpriteName("does-not-exist")).toBe("does-not-exist");
  });
  it("returns the id unchanged when no map is attached", () => {
    mx._map = null;
    expect(mx.resolveSpriteName("maki-airport-11")).toBe("maki-airport-11");
  });
  it("returns the id unchanged for empty id", () => {
    expect(mx.resolveSpriteName("")).toBe("");
  });
});

describe("MapxStyle getImageDataUrl (mock map, null-guard paths)", () => {
  // Canvas rendering requires a DOM environment (jsdom/happy-dom).
  // These tests cover the early-return paths only.
  let mx;
  beforeEach(() => {
    mx = new MapxStyle();
  });

  it("returns null when no map is attached", () => {
    expect(mx.getImageDataUrl("maki-airport-11")).toBeNull();
  });
  it("returns null for an empty id", () => {
    mx._map = { getImage: vi.fn(() => null) };
    expect(mx.getImageDataUrl("")).toBeNull();
  });
  it("returns null when image is not found in either sprite", () => {
    mx._map = { getImage: vi.fn(() => null) };
    expect(mx.getImageDataUrl("does-not-exist")).toBeNull();
  });
  it("tries patterns: prefix when bare id is not found", () => {
    const fakeImg = { data: { width: 32, height: 32, data: new Uint8Array(32 * 32 * 4) }, sdf: false };
    mx._map = {
      getImage: vi.fn((id) => (id === "patterns:t_b_lines_01" ? fakeImg : null)),
    };
    // getImageDataUrl calls document.createElement — skip rendering assertion in Node,
    // just confirm it does NOT return null (image was found via prefix fallback).
    // This would throw in Node without DOM; guard with try/catch.
    let result;
    try {
      result = mx.getImageDataUrl("t_b_lines_01");
    } catch {
      // Canvas not available in Node — image was found, rendering attempted.
      result = "canvas-attempted";
    }
    expect(result).not.toBeNull();
    expect(mx._map.getImage).toHaveBeenCalledWith("t_b_lines_01");
    expect(mx._map.getImage).toHaveBeenCalledWith("patterns:t_b_lines_01");
  });
});

describe("MapxStyle attachMap without theme", () => {
  it("resolves when no theme was set", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;

    const map = {
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      isStyleLoaded: vi.fn(() => true),
      getLayer: vi.fn(() => null),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };

    await expect(mx.attachMap(map)).resolves.toBeUndefined();
  });
});

describe("MapxStyle terrain sync", () => {
  function createMap({ pitch = 0 } = {}) {
    let currentPitch = pitch;
    const handlers = {};
    const map = {
      isStyleLoaded: vi.fn(() => true),
      on: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      once: vi.fn(),
      getLayer: vi.fn(() => null),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
      getPitch: vi.fn(() => currentPitch),
      setTerrain: vi.fn(),
      easeTo: vi.fn(),
      setPitch(pitch) {
        currentPitch = pitch;
      },
      fire(event) {
        handlers[event]?.();
      },
    };
    return map;
  }

  it("reports terrain enabled state", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = createMap({ pitch: 0 });

    expect(mx.isTerrainEnabled()).toBe(false);

    await mx.attachMap(map);
    mx.enableTerrain();
    expect(mx.isTerrainEnabled()).toBe(true);

    mx.disableTerrain();
    expect(mx.isTerrainEnabled()).toBe(false);
  });

  it("reports terrain disabled after a low-pitch manual sync", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = createMap({ pitch: 45 });

    await mx.attachMap(map);
    mx.enableTerrain();
    expect(mx.isTerrainEnabled()).toBe(true);

    map.setPitch(MapxStyle.TERRAIN_THRESH - 1);
    map.fire("pitchend");

    expect(mx.isTerrainEnabled()).toBe(false);
    expect(map.setTerrain).toHaveBeenLastCalledWith(null);
  });

  it("does not re-enable terrain from pitch sync during programmatic disable", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = createMap({ pitch: 45 });

    await mx.attachMap(map);
    mx.enableTerrain();
    mx.disableTerrain();
    map.fire("pitchend");

    expect(map.setTerrain).toHaveBeenLastCalledWith(null);
    expect(map.setTerrain).toHaveBeenCalledTimes(2);
  });

  it("keeps manual pitch terrain sync after the map is flat", async () => {
    const mx = new MapxStyle();
    mx._maskEnabled = false;
    const map = createMap({ pitch: 45 });

    await mx.attachMap(map);
    mx.enableTerrain();
    mx.disableTerrain();

    map.setPitch(0);
    map.fire("pitchend");
    map.setPitch(45);
    map.fire("pitchend");

    expect(map.setTerrain).toHaveBeenLastCalledWith(MapxStyle.TERRAIN_CFG);
  });
});
