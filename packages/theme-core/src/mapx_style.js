import { Protocol } from "pmtiles";
import styleJson from "./style/style.json";
import styleDebugJson from "./style/style_debug.json";
import { version as STYLE_VERSION } from "../../../style_version.json";
import { build_style } from "./build_style.js";
import { themes } from "./themes/index.js";
import { layer_resolver } from "./layer_resolver.js";
import { css_resolver } from "./css_resolver.js";

const S3_BASE = "https://mapx.unepgrid.s3.unige.ch/mapx";
const HCP_S3_HOST = "s3.unige.ch";
const HCP_S3_URL = "https://mapx.unepgrid.s3.unige.ch/";
const DEM_URL = "https://tiles.mapterhorn.com/{z}/{x}/{y}.webp";
const MASK_URL = `${S3_BASE}/masks/un_2020_countries_mask__v0.geojson`;
const CSS_EL_ID = "mapx-theme-css";

/**
 * MapxStyle — single entry point for the MapX style system.
 *
 * Handles: HCP S3 fetch auth, PMTiles protocol, DEM source, transformRequest,
 * sprite URL resolution, style building, theme state, and CSS custom property
 * injection. Call destroy() to tear down.
 *
 * @example
 * const mxStyle = new MapxStyle({ maplibregl, mlcontour });
 * const map = new maplibregl.Map({
 *   style: mxStyle.getStyle(),
 *   transformRequest: mxStyle.transformRequest,
 * });
 * mxStyle.attachMap(map);
 * mxStyle.setTheme("classic_light");
 * // on teardown:
 * mxStyle.destroy();
 *
 * @param {object} [opt]
 * @param {"prod"|"staging"|"dev"} [opt.env="prod"] - S3 env for sprite URL.
 * @param {object} [opt.maplibregl] - maplibre-gl module (protocol + DEM setup).
 * @param {object} [opt.mlcontour]  - maplibre-contour module (DemSource).
 */
export class MapxStyle {
  static _registered = false;
  static _rtlRegistered = false;
  static TERRAIN_CFG = { source: "terrain", exaggeration: 1 };
  static TERRAIN_PITCH = 30; // degrees applied when enableTerrain() tilts the map
  static TERRAIN_THRESH = 5; // pitch threshold above which manual tilt enables terrain
  static HILLSHADE_LAYER = "hillshade";
  static CONTOUR_LAYERS = ["contour-lines", "contour-labels"];
  static MASK_URL = MASK_URL;
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

  constructor({ maplibregl, mlcontour } = {}) {
    this._glyphs = `${S3_BASE}/style/v${STYLE_VERSION}/glyphs/{fontstack}/{range}.pbf`;
    this._sprite = [
      { id: "default",  url: `${S3_BASE}/style/v${STYLE_VERSION}/sprites/sprite` },
      { id: "patterns", url: `${S3_BASE}/style/v${STYLE_VERSION}/sprites/sprite_patterns` },
    ];
    this._spriteIndex = null;
    this._theme = null;
    this._map = null;
    this._language = "en";
    this._terrainEnabled = false;
    this._terrainCfg = MapxStyle.TERRAIN_CFG;
    this._onPitchEnd = this._handlePitchEnd.bind(this);
    this._onMapError = (e) => {
      if (String(e?.error?.message ?? "").includes("mapterhorn.com")) return;
      console.error(e.error ?? e);
    };
    this._hillshadeEnabled = true;
    this._contoursEnabled = true;
    this._maskEnabled = true; // on by default
    this._maskUrl = MASK_URL;
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

    // ── Patch window.fetch for HCP S3 auth — once per page
    // PMTiles FetchSource calls window.fetch directly, bypassing transformRequest.
    if (maplibregl && !MapxStyle._registered) {
      MapxStyle._registered = true;

      const originalFetch = window.fetch.bind(window);
      this._originalFetch = originalFetch;
      window.fetch = (input, init = {}) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : "";
        if (url.includes(HCP_S3_HOST)) {
          const existing =
            init.headers instanceof Headers
              ? Object.fromEntries(init.headers.entries())
              : init.headers || {};
          init = {
            ...init,
            headers: { ...existing, Authorization: "AWS all_users:" },
          };
        }
        return originalFetch(input, init);
      };

      // ── PMTiles protocol
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

    // ── transformRequest (bound so it can be passed by reference)
    this.transformRequest = (url) => {
      if (url.startsWith(HCP_S3_URL)) {
        return { url, headers: { Authorization: "AWS all_users:" } };
      }
    };
  }

  // ── Map lifecycle ────────────────────────────────────────────────────────────

  /** Link a map instance. Applies the current theme immediately if one is set. */
  attachMap(map) {
    this._map = map;
    map.on("pitchend", this._onPitchEnd);
    map.on("error", this._onMapError);
    const apply = () => {
      this._applyLayers(map, this._theme);
      if (this._maskEnabled) this._loadAndApplyMask(map);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }

  /** Unlink the attached map. */
  detachMap() {
    if (this._map) {
      this._map.off("pitchend", this._onPitchEnd);
      this._map.off("error", this._onMapError);
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

  // ── Places mask (within expression) ─────────────────────────────────────────

  /**
   * Enable the place-label mask. Fetches the GeoJSON (once, cached) and applies
   * `["!", ["within", geojson]]` to all places_locality_* layers.
   * Enabled by default on load — call only when re-enabling after disableMask().
   */
  async enableMask() {
    this._maskEnabled = true;
    if (this._map && this._map.isStyleLoaded())
      await this._loadAndApplyMask(this._map);
  }

  /**
   * Remove the mask and restore original places_locality_* filters.
   */
  disableMask() {
    this._maskEnabled = false;
    if (this._map && this._map.isStyleLoaded()) this._removeMask(this._map);
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
    if (this._maskEnabled && this._map && this._map.isStyleLoaded())
      this._loadAndApplyMask(this._map);
  }

  // ── Theme management ─────────────────────────────────────────────────────────

  /** Returns all available themes. */
  getThemes() {
    return themes;
  }

  /** Returns the currently active theme, or null. */
  getTheme() {
    return this._theme;
  }

  /**
   * Apply a theme by id string or theme object.
   * Updates the attached map's layer paint/layout properties and injects CSS
   * custom properties into the document.
   */
  setTheme(idOrTheme) {
    const theme =
      typeof idOrTheme === "string"
        ? themes.find((t) => t.id === idOrTheme)
        : idOrTheme;
    if (!theme) return;
    this._theme = theme;
    if (this._map) {
      const apply = () => this._applyLayers(this._map, theme);
      if (this._map.isStyleLoaded()) apply();
      else this._map.once("style.load", apply);
    }
    this._applyCSS(theme);
  }

  // ── Language ─────────────────────────────────────────────────────────────────

  /** Returns the current language code (ISO 639-1, e.g. "en", "fr", "ar"). */
  getLanguage() {
    return this._language;
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
    if (!this._map) return;
    const apply = () => {
      let expr;
      switch (lang) {
        case "en":
          expr = ["coalesce",
            ["get", "name:en"], ["get", "name_en"],
            ["get", "name"]];
          break;
        case "zh":
          expr = ["coalesce",
            ["get", "name:zh"], ["get", "name:zh-Hans"], ["get", "name_zh"],
            ["get", "name:en"], ["get", "name_en"],
            ["get", "name"]];
          break;
        default:
          expr = ["coalesce",
            ["get", `name:${lang}`], ["get", `name_${lang}`],
            ["get", "name:en"],      ["get", "name_en"],
            ["get", "name"]];
      }
      for (const id of MapxStyle.LABEL_LAYERS) {
        if (this._map.getLayer(id))
          this._map.setLayoutProperty(id, "text-field", expr);
      }
    };
    if (this._map.isStyleLoaded()) apply();
    else this._map.once("style.load", apply);
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
      const url = `${S3_BASE}/style/v${STYLE_VERSION}/sprites/sprite-index.json`;
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

  // ── Style building ───────────────────────────────────────────────────────────

  /**
   * Returns a deep copy of the prod style with sprite URL and DEM sources resolved.
   * Pass the result directly to new maplibregl.Map({ style: ... }).
   */
  getStyle() {
    const style = structuredClone(styleJson);
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
    const style = structuredClone(styleDebugJson);
    style.glyphs = this._glyphs;
    style.sprite = this._sprite;
    if (this._demSource) build_style(style, this._demSource);
    return style;
  }

  /** Restore patched globals and remove injected CSS. Call when tearing down (tests, HMR). */
  destroy() {
    this.detachMap();
    if (typeof document !== "undefined") {
      document.getElementById(CSS_EL_ID)?.remove();
    }
    if (this._originalFetch) {
      window.fetch = this._originalFetch;
      this._originalFetch = null;
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
