/**
 * sprite_demo.js — Visual sprite/pattern test grid for the MapX Style demo app.
 *
 * Adds two GeoJSON layers to the prod map (prod only — debug has no sprite):
 *   • demo-patterns  fill layer, west of 0°: one polygon per pattern icon
 *   • demo-icons     symbol layer, east of 0°: one point per maki/geology icon
 *
 * Both grids are centred near [0°, 0°] (Gulf of Guinea — open ocean, no clutter).
 * The data is generated from the live sprite-index.json via mxStyle.getIcons().
 *
 * Layout (0.4° cells, 0.5° step):
 *   Patterns  lon -10 → -3.5   lat -3 → +3.5   13 cols × N rows
 *   Icons     lon  +1 → +11    lat -5 → +5      20 cols × N rows
 */

const STEP = 0.5;
const CELL = 0.4;
const PATTERN_ORIGIN = [-10, -3]; // [lon, lat] bottom-left
const PATTERN_COLS = 13;
const ICON_ORIGIN = [1, -5];
const ICON_COLS = 20;

export const PATTERNS_BOUNDS = [
  [PATTERN_ORIGIN[0] - 0.5, PATTERN_ORIGIN[1] - 0.5],
  [PATTERN_ORIGIN[0] + PATTERN_COLS * STEP + 0.5, 5],
];
export const ICONS_BOUNDS = [
  [ICON_ORIGIN[0] - 0.5, ICON_ORIGIN[1] - 0.5],
  [ICON_ORIGIN[0] + ICON_COLS * STEP + 0.5, 6],
];

function _makePolygon(lon, lat) {
  return [
    [lon, lat],
    [lon + CELL, lat],
    [lon + CELL, lat + CELL],
    [lon, lat + CELL],
    [lon, lat],
  ];
}

function _grid(icons, [lon0, lat0], cols) {
  return {
    type: "FeatureCollection",
    features: icons.map((icon, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const lon = lon0 + col * STEP;
      const lat = lat0 + row * STEP;
      return {
        type: "Feature",
        geometry: {
          type: icon.geometry,
          coordinates:
            icon.geometry === "Point"
              ? [lon + CELL / 2, lat + CELL / 2]
              : [_makePolygon(lon, lat)],
        },
        properties: { id: icon.id, group: icon.group },
      };
    }),
  };
}

/**
 * Build and add the sprite demo sources/layers to `map`.
 * Fetches the sprite index via `mxStyle.getIcons()`.
 * Safe to call before or after map load.
 *
 * @param {maplibregl.Map} map
 * @param {MapxStyle} mxStyle
 */
export async function buildSpriteDemo(map, mxStyle) {
  const icons = await mxStyle.getIcons();

  const patterns = icons
    .filter((ic) => ic.group === "pattern" || ic.group === "geology")
    .map((ic) => ({ ...ic, geometry: "Polygon" }));

  const symbols = icons
    .filter((ic) => ic.group === "maki")
    .map((ic) => ({ ...ic, geometry: "Point" }));

  const patternGeoJSON = _grid(patterns, PATTERN_ORIGIN, PATTERN_COLS);
  const iconGeoJSON = _grid(symbols, ICON_ORIGIN, ICON_COLS);

  const add = () => {
    map.addSource("demo-patterns", { type: "geojson", data: patternGeoJSON });
    map.addSource("demo-icons", { type: "geojson", data: iconGeoJSON });

    map.addLayer({
      id: "demo-patterns-fill",
      type: "fill",
      source: "demo-patterns",
      paint: { "fill-pattern": ["concat", "patterns:", ["get", "id"]] },
    });
    map.addLayer({
      id: "demo-patterns-outline",
      type: "line",
      source: "demo-patterns",
      paint: { "line-color": "#333", "line-width": 0.5, "line-opacity": 0.4 },
    });
    map.addLayer({
      id: "demo-icons-symbol",
      type: "symbol",
      source: "demo-icons",
      layout: {
        "icon-image": ["get", "id"],
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  };

  add();
}

export function flyToPatterns(map) {
  // maxZoom: 6 keeps ≈1–2 tile repetitions per cell (fill-pattern tiles at
  // fixed screen-pixel size; polygons grow with zoom so ratio varies by zoom).
  map.fitBounds(PATTERNS_BOUNDS, { padding: 40, duration: 800, maxZoom: 6 });
}

export function flyToIcons(map) {
  map.fitBounds(ICONS_BOUNDS, { padding: 40, duration: 800 });
}
