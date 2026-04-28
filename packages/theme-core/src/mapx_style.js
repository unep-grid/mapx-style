import { Protocol } from "pmtiles";
import styleJson from "./style/style.json";
import styleDebugJson from "./style/style_debug.json";
import { build_style } from "./build_style.js";
import { layer_resolver } from "./layer_resolver.js";
import { css_resolver } from "./css_resolver.js";
import { MapScaler } from "./map_scaler.js";
import {
  cloneTheme,
  listBuiltInThemes,
  normalizeTheme,
  validateThemeColors,
} from "./theme_registry.js";
import {
  resolveGlyphsUrl,
  resolveSpriteIndexUrl,
  resolveSpriteUrls,
} from "./theme_assets.js";

import { S3_BASE } from "./config.js";

const DEM_URL = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";
const CSS_EL_ID = "mapx-theme-css";

/**
 * MapxStyle — single entry point for the MapX style system.
 *
 * Handles: PMTiles protocol, DEM source, sprite URL resolution, style building,
 * theme state, and CSS custom property injection. Call destroy() to tear down.
 *
 * @example
 * const mxStyle = new MapxStyle({ maplibregl, mlcontour, baseUrl: "https://api.mapx.org/s3" });
 * const map = new maplibregl.Map({ style: mxStyle.getStyle() });
 * mxStyle.attachMap(map);
 * mxStyle.destroy(); // on teardown
 *
 * @param {object} [opt]
 * @param {string} [opt.baseUrl] - S3 proxy base URL. Defaults to VITE_MAPX_ASSET_BASE_URL.
 * @param {object} [opt.maplibregl] - maplibre-gl module (protocol + DEM setup).
 * @param {object} [opt.mlcontour]  - maplibre-contour module (DemSource).
 * @param {string|object} [opt.theme] - Theme id or full theme object.
 */
export class MapxStyle {
  static _registered = false;
  static _rtlRegistered = false;
  static TERRAIN_CFG = { source: "terrain", exaggeration: 1 };
  static TERRAIN_PITCH = 30; // degrees applied when enableTerrain() tilts the map
  static TERRAIN_THRESH = 5; // pitch threshold above which manual tilt enables terrain
  static HILLSHADE_LAYER = "hillshade";
  static CONTOUR_LAYERS = ["contour-lines", "contour-labels"];
  static SATELLITE_LAYER = "satellite";
  static PLACES_MASK_LAYERS = [
    "places_locality_capital",
    "places_locality_regional",
    "places_locality_minor",
  ];

  // All layers with translatable name labels (excludes contour-labels which shows elevation).
  static LABEL_LAYERS = [
    "road-label",
    "water-label-line",
    "water-label-point",
    "waterway-label",
    "places_locality_capital",
    "places_locality_regional",
    "places_locality_minor",
    "country_un_1_label_1",
    "country_un_0_label_99",
    "country_un_0_label_5",
    "country_un_0_label_4",
    "country_un_0_label_3",
    "country_un_0_label_2",
    "country_un_0_label_1",
    "country_un_0_label_0",
  ];

  constructor({ maplibregl, mlcontour, theme, language, baseUrl } = {}) {
    const s3Base = baseUrl || S3_BASE;
    this._s3Base = s3Base;
    this._glyphs = resolveGlyphsUrl({ baseUrl: s3Base });
    this._sprite = resolveSpriteUrls({ baseUrl: s3Base });
    this._spriteIndex = null;
    this._theme = null;
    this._map = null;
    this._language = language || "en";
    this._terrainEnabled = false;
    this._terrainCfg = MapxStyle.TERRAIN_CFG;
    this._onPitchEnd = this._handlePitchEnd.bind(this);
    this._hillshadeEnabled = true;
    this._contoursEnabled = true;
    this._satelliteEnabled = false;
    this._maskEnabled = true; // on by default
    this._maskUrl = `${s3Base}/masks/un_2020_countries_mask__v0.geojson`;
    this._maskGeojson = null; // loaded lazily on first use
    this._maskOriginalFilters = {};

    // ── RTL text plugin — once per page (Arabic, Hebrew, etc.)
    if (maplibregl && !MapxStyle._rtlRegistered) {
      MapxStyle._rtlRegistered = true;
      maplibregl.setRTLTextPlugin(
        "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
        null,
        true, // lazy: only loads when RTL text is encountered
      );
    }

    // ── PMTiles protocol — once per page
    if (maplibregl && !MapxStyle._registered) {
      MapxStyle._registered = true;
      const pmtilesProtocol = new Protocol();
      maplibregl.addProtocol(
        "pmtiles",
        pmtilesProtocol.tile.bind(pmtilesProtocol),
      );
      this._maplibregl = maplibregl;
    }

    // ── DEM source (Mapterhorn, terrarium 512 px, land only)
    // Tiles are cached and shared between hillshade and contour sources.
    if (mlcontour && maplibregl) {
      this._demSource = new mlcontour.DemSource({
        url: DEM_URL,
        encoding: "terrarium",
        maxzoom: 14,
        worker: true,
        cacheSize: 100,
      });
      this._demSource.setupMaplibre(maplibregl);
    }

    if (theme) {
      this.setTheme(theme);
    }
  }

  // ── Map lifecycle ────────────────────────────────────────────────────────────

  /** Link a map instance. Applies the current theme immediately if one is set. */
  attachMap(map) {
    this._map = map;
    this._scaler = new MapScaler(map);
    map.on("pitchend", this._onPitchEnd);
    const apply = () => {
      this._applyLayers(map, this._theme);
      this._applyLanguage(map);
      if (this._maskEnabled) {
        this._loadAndApplyMask(map);
      }
    };
    if (map.isStyleLoaded()) {
      apply();
    } else {
      map.once("load", apply);
    }
  }

  /** Unlink the attached map. */
  detachMap() {
    if (this._map) {
      this._map.off("pitchend", this._onPitchEnd);
      this._map.off("error", this._onMapError);
    }
    if (this._scaler) {
      this._scaler.destroy();
      this._scaler = null;
    }
    this._map = null;
  }

  // ── Terrain / 3D ─────────────────────────────────────────────────────────────

  /**
   * Enable 3D terrain on the attached map.
   * Applies the terrain source and eases the pitch to TERRAIN_PITCH if lower.
   * @param {object} [cfg] - Optional override for the terrain config object.
   */
  enableTerrain(cfg) {
    if (!this._map) return;
    if (cfg) this._terrainCfg = cfg;
    this._terrainEnabled = true;
    this._map.setTerrain(this._terrainCfg);
    if (this._map.getPitch() < MapxStyle.TERRAIN_PITCH)
      this._map.easeTo({ pitch: MapxStyle.TERRAIN_PITCH });
  }

  /**
   * Disable 3D terrain on the attached map and ease pitch back to 0.
   */
  disableTerrain() {
    if (!this._map) return;
    this._terrainEnabled = false;
    this._map.setTerrain(null);
    this._map.easeTo({ pitch: 0 });
  }

  /**
   * Toggle 3D terrain on the attached map.
   * @param {object} [cfg] - Optional terrain config passed to enableTerrain().
   */
  toggleTerrain(cfg) {
    this._terrainEnabled ? this.disableTerrain() : this.enableTerrain(cfg);
  }

  // ── Hillshade / Contours ─────────────────────────────────────────────────────

  enableHillshade() {
    this._hillshadeEnabled = true;
    this._setLayersVisibility(MapxStyle.HILLSHADE_LAYER, "visible");
  }
  disableHillshade() {
    this._hillshadeEnabled = false;
    this._setLayersVisibility(MapxStyle.HILLSHADE_LAYER, "none");
  }
  toggleHillshade() {
    this._hillshadeEnabled ? this.disableHillshade() : this.enableHillshade();
  }

  enableContours() {
    this._contoursEnabled = true;
    this._setLayersVisibility(MapxStyle.CONTOUR_LAYERS, "visible");
  }
  disableContours() {
    this._contoursEnabled = false;
    this._setLayersVisibility(MapxStyle.CONTOUR_LAYERS, "none");
  }
  toggleContours() {
    this._contoursEnabled ? this.disableContours() : this.enableContours();
  }

  // ── Satellite imagery ────────────────────────────────────────────────────────

  /**
   * Enable satellite imagery layer (EOX Sentinel-2 cloudless).
   * Disables hillshade while active — it makes no visual sense over satellite.
   */
  enableSatellite() {
    this._satelliteEnabled = true;
    this._setLayersVisibility(MapxStyle.SATELLITE_LAYER, "visible");
    this.disableHillshade();
  }

  /** Disable satellite imagery and restore hillshade. */
  disableSatellite() {
    this._satelliteEnabled = false;
    this._setLayersVisibility(MapxStyle.SATELLITE_LAYER, "none");
    this.enableHillshade();
  }

  /** Toggle satellite imagery on/off. */
  toggleSatellite() {
    this._satelliteEnabled ? this.disableSatellite() : this.enableSatellite();
  }

  // ── Places mask (within expression) ─────────────────────────────────────────

  /**
   * Enable the place-label mask. Fetches the GeoJSON (once, cached) and applies
   * `["!", ["within", geojson]]` to all places_locality_* layers.
   * Enabled by default on load — call only when re-enabling after disableMask().
   */
  async enableMask() {
    this._maskEnabled = true;
    if (this._map && this._map.isStyleLoaded()) {
      await this._loadAndApplyMask(this._map);
    }
  }

  /**
   * Remove the mask and restore original places_locality_* filters.
   */
  disableMask() {
    this._maskEnabled = false;
    if (this._map && this._map.isStyleLoaded()) {
      this._removeMask(this._map);
    }
  }

  /** Toggle mask on/off. */
  toggleMask() {
    this._maskEnabled ? this.disableMask() : this.enableMask();
  }

  /**
   * Override the mask GeoJSON URL (default: MapxStyle.MASK_URL).
   * Clears the cached GeoJSON and re-fetches immediately if mask is currently enabled.
   * @param {string} url
   */
  setMaskUrl(url) {
    this._maskUrl = url;
    this._maskGeojson = null;
    if (this._maskEnabled && this._map && this._map.isStyleLoaded()) {
      this._loadAndApplyMask(this._map);
    }
  }

  // ── Theme management ─────────────────────────────────────────────────────────

  /** Returns all available themes. */
  getThemes() {
    return listBuiltInThemes();
  }

  /** Returns the currently active theme, or null. */
  getTheme() {
    return this._theme ? cloneTheme(this._theme) : null;
  }

  /**
   * Apply a theme by id string or theme object.
   * Updates the attached map's layer paint/layout properties and injects CSS
   * custom properties into the document.
   */
  setTheme(idOrTheme) {
    const theme = normalizeTheme(idOrTheme);

    if (!theme) return false;
    if (!validateThemeColors(theme)) {
      console.warn("MapxStyle.setTheme received invalid theme colors");
      return false;
    }

    this._theme = theme;
    if (this._map) {
      const apply = () => this._applyLayers(this._map, theme);
      if (this._map.isStyleLoaded()) {
        apply();
      } else {
        this._map.once("style.load", apply);
      }
    }
    this._applyCSS(theme);
    return true;
  }

  // ── Language ─────────────────────────────────────────────────────────────────

  /** Returns the current language code (ISO 639-1, e.g. "en", "fr", "ar"). */
  getLanguage() {
    return this._language;
  }

  _getLanguageExpression(lang = this._language) {
    switch (lang) {
      case "en":
        return [
          "coalesce",
          ["get", "name:en"],
          ["get", "name_en"],
          ["get", "name"],
        ];
      case "zh":
        return [
          "coalesce",
          ["get", "name:zh"],
          ["get", "name:zh-Hans"],
          ["get", "name_zh"],
          ["get", "name:en"],
          ["get", "name_en"],
          ["get", "name"],
        ];
      default:
        return [
          "coalesce",
          ["get", `name:${lang}`],
          ["get", `name_${lang}`],
          ["get", "name:en"],
          ["get", "name_en"],
          ["get", "name"],
        ];
    }
  }

  _applyLanguage(map = this._map) {
    if (!map) {
      return;
    }

    const expr = this._getLanguageExpression();
    for (const id of MapxStyle.LABEL_LAYERS) {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "text-field", expr);
      }
    }
  }

  /**
   * Set the map label language.
   * Updates text-field on all LABEL_LAYERS to prefer the requested language,
   * falling back to English then to the native name.
   * Supports both colon-format (Protomaps: name:en) and underscore-format
   * (UN borders: name_en) field naming conventions.
   * @param {string} lang - ISO 639-1 language code (e.g. "fr", "ar", "zh").
   */
  setLanguage(lang) {
    this._language = lang;
    this._applyLanguage();
  }

  // ── Map scaling ──────────────────────────────────────────────────────────────

  /**
   * Scale text-size and/or icon-size on all basemap layers.
   * @param {number} [value=1] - Scale factor (1 = original size).
   * @param {string[]} [types=["text","icon"]] - Which sizes to scale.
   */
  scale(value = 1, types = ["text", "icon"]) {
    this._scaler?.update(value, types);
  }

  /** Scale text-size only on basemap layers. */
  scaleText(value = 1) {
    this._scaler?.update(value, ["text"]);
  }

  /** Scale icon-size only on basemap layers. */
  scaleIcon(value = 1) {
    this._scaler?.update(value, ["icon"]);
  }

  /** Returns raw layer update array for the given (or current) theme. */
  getLayers(theme = this._theme) {
    return theme ? layer_resolver(theme.colors) : [];
  }

  /** Returns CSS custom property string for the given (or current) theme. */
  getCss(theme = this._theme) {
    return theme ? css_resolver(theme.colors) : "";
  }

  // ── Sprite / icon accessors ──────────────────────────────────────────────────

  /**
   * Returns the sprite-index.json from S3 (fetched once, cached on the instance).
   * The index contains all icon and pattern entries with their sprite sheet
   * coordinates and group metadata.
   * @returns {Promise<object>}
   */
  async getSpriteIndex() {
    if (!this._spriteIndex) {
      const url = resolveSpriteIndexUrl({ baseUrl: this._s3Base });
      this._spriteIndex = await fetch(url).then((r) => r.json());
    }
    return this._spriteIndex;
  }

  /**
   * Returns all icon entries from the sprite index.
   * Each entry: { id, group, sprite, x, y, w, h, sdf }
   * @returns {Promise<Array>}
   */
  async getIcons() {
    const index = await this.getSpriteIndex();
    return index.icons;
  }

  /**
   * Returns a single icon entry by id, or undefined if not found.
   * @param {string} id
   * @returns {Promise<object|undefined>}
   */
  async getIcon(id) {
    const icons = await this.getIcons();
    return icons.find((icon) => icon.id === id);
  }

  /**
   * Returns icon pixel dimensions from the sprite-index.
   * Fetches and caches the index on first call; subsequent calls use the cache.
   * @param {string} id - bare sprite image id
   * @returns {Promise<{ w: number, h: number } | null>}
   */
  async getIconDimensions(id) {
    const icon = await this.getIcon(id);
    return icon ? { w: icon.w, h: icon.h } : null;
  }

  /**
   * Resolves a bare sprite id to the fully-qualified name MapLibre expects in
   * style expressions ("fill-pattern", "icon-image", etc.).
   *
   * In MapLibre GL JS, images from non-default sprites are namespaced:
   * "patterns:t_b_lines_23". View data stores bare ids, so this step is needed
   * before building layer specs.
   *
   * @param {string} id - bare sprite image id (e.g. "t_b_lines_23")
   * @returns {string} resolved id (prefixed if needed, bare id as fallback)
   */
  resolveSpriteName(id) {
    if (!this._map || !id) return id;
    if (this._map.hasImage(id)) return id;
    const prefixed = `patterns:${id}`;
    if (this._map.hasImage(prefixed)) return prefixed;
    return id;
  }

  /**
   * Renders a sprite image to a PNG data URL for use in legend thumbnails etc.
   * Uses the public map.getImage() API — no access to internal imageManager.
   *
   * For SDF icons: pass rgba to recolor visible pixels (same as MapLibre's
   * runtime icon-color, but applied to a canvas for CSS background-image use).
   * For raster patterns: pass rgba=null to return the raw image.
   *
   * @param {string} id - bare sprite image id
   * @param {[number, number, number, number] | null} rgba - RGBA 0-255, or null
   * @returns {string | null} PNG data URL, or null if image not found
   */
  getImageDataUrl(id, rgba = null) {
    if (!this._map || !id) return null;
    const img = this._map.getImage(id) ?? this._map.getImage(`patterns:${id}`);
    if (!img) return null;
    const { width, height } = img.data;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // img.data.data is Uint8Array; ImageData requires Uint8ClampedArray
    const imData = new ImageData(
      new Uint8ClampedArray(img.data.data),
      width,
      height,
    );
    if (rgba && img.sdf) {
      const [r, g, b, a] = rgba;
      for (let i = 0; i < imData.data.length; i += 4) {
        if (imData.data[i + 3] > 0) {
          imData.data[i] = r;
          imData.data[i + 1] = g;
          imData.data[i + 2] = b;
          imData.data[i + 3] = a;
        }
      }
    }
    ctx.putImageData(imData, 0, 0);
    return canvas.toDataURL("image/png");
  }

  // ── Style building ───────────────────────────────────────────────────────────

  /**
   * Returns a deep copy of the prod style with sprite URL and DEM sources resolved.
   * Pass the result directly to new maplibregl.Map({ style: ... }).
   */
  getStyle() {
    const style = this._resolveStyle(styleJson);
    style.glyphs = this._glyphs;
    style.sprite = this._sprite;
    if (this._demSource) build_style(style, this._demSource);
    return style;
  }

  /**
   * Returns a deep copy of the debug style with sprite URL and DEM contour
   * source resolved. No hillshade layer is included.
   */
  getStyleDebug() {
    const style = this._resolveStyle(styleDebugJson);
    style.glyphs = this._glyphs;
    style.sprite = this._sprite;
    if (this._demSource) build_style(style, this._demSource);
    return style;
  }

  _resolveStyle(json) {
    return JSON.parse(JSON.stringify(json).replaceAll("__S3_BASE__", this._s3Base));
  }

  /** Remove injected CSS and unregister protocols. Call when tearing down (tests, HMR). */
  destroy() {
    this.detachMap();
    if (typeof document !== "undefined") {
      document.getElementById(CSS_EL_ID)?.remove();
    }
    if (this._maplibregl) {
      this._maplibregl.removeProtocol("pmtiles");
      this._maplibregl = null;
    }
    MapxStyle._registered = false;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  async _loadAndApplyMask(map) {
    if (!this._maskGeojson)
      this._maskGeojson = await fetch(this._maskUrl).then((r) => r.json());
    this._applyMask(map, this._maskGeojson);
  }

  _applyMask(map, geojson) {
    for (const id of MapxStyle.PLACES_MASK_LAYERS) {
      if (!map.getLayer(id)) continue;
      // Store the pre-mask filter once; keep it stable across repeated calls.
      if (!(id in this._maskOriginalFilters))
        this._maskOriginalFilters[id] = map.getFilter(id);
      const base = this._maskOriginalFilters[id];
      const conditions =
        Array.isArray(base) && base[0] === "all"
          ? base.slice(1)
          : [base].filter(Boolean);
      map.setFilter(id, ["all", ...conditions, ["!", ["within", geojson]]]);
    }
  }

  _removeMask(map) {
    for (const id of MapxStyle.PLACES_MASK_LAYERS) {
      if (!map.getLayer(id)) continue;
      if (id in this._maskOriginalFilters)
        map.setFilter(id, this._maskOriginalFilters[id]);
    }
    this._maskOriginalFilters = {};
  }

  _setLayersVisibility(ids, visibility) {
    if (!this._map) return;
    for (const id of [].concat(ids))
      if (this._map.getLayer(id))
        this._map.setLayoutProperty(id, "visibility", visibility);
  }

  /** Sync terrain state when the user tilts the map manually. No pitch side-effects. */
  _handlePitchEnd() {
    if (!this._map) return;
    const pitch = this._map.getPitch();
    if (pitch > MapxStyle.TERRAIN_THRESH && !this._terrainEnabled) {
      this._terrainEnabled = true;
      this._map.setTerrain(this._terrainCfg);
    } else if (pitch < MapxStyle.TERRAIN_THRESH && this._terrainEnabled) {
      this._terrainEnabled = false;
      this._map.setTerrain(null);
    }
  }

  _applyLayers(map, theme) {
    if (!theme?.colors) return;
    for (const { id: ids, paint, layout } of layer_resolver(theme.colors)) {
      for (const id of ids) {
        if (!map.getLayer(id)) continue;
        if (paint)
          for (const [k, v] of Object.entries(paint))
            map.setPaintProperty(id, k, v);
        if (layout)
          for (const [k, v] of Object.entries(layout))
            map.setLayoutProperty(id, k, v);
      }
    }
  }

  _applyCSS(theme) {
    if (typeof document === "undefined") return;
    let el = document.getElementById(CSS_EL_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = CSS_EL_ID;
      document.head.appendChild(el);
    }
    el.textContent = css_resolver(theme.colors);
  }
}
