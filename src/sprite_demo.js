/**
 * sprite_demo.js — Visual sprite/pattern test grid for the MapX Style demo app.
 *
 * Adds two GeoJSON layers to the prod map (prod only — debug has no sprite):
 *   • demo-patterns  fill layer: one polygon per pattern/geology icon
 *   • demo-icons     symbol layer: one point per maki icon
 *
 * Layers are hidden by default; use showPatterns/showIcons to reveal and fly to them.
 * Grids are placed over the Geneva/Alps area for meaningful visual regression
 * (roads, hillshade, labels, mountains in the background).
 *
 * Layout (0.4° cells, 0.5° step):
 *   Patterns  origin [6.16, 46.19]   13 cols × N rows
 *   Icons     origin [13.5, 46.19]   20 cols × N rows
 */

export const STEP = 0.5;
export const CELL = 0.4;

const PATTERN_ORIGIN = [6.1571, 46.1925];
const PATTERN_COLS = 13;
const ICON_ORIGIN = [13.5, 46.1925];
const ICON_COLS = 20;

export const PATTERNS_BOUNDS = [
  [PATTERN_ORIGIN[0] - 0.5, PATTERN_ORIGIN[1] - 0.5],
  [PATTERN_ORIGIN[0] + PATTERN_COLS * STEP + 0.5, PATTERN_ORIGIN[1] + 7],
];
export const ICONS_BOUNDS = [
  [ICON_ORIGIN[0] - 0.5, ICON_ORIGIN[1] - 0.5],
  [ICON_ORIGIN[0] + ICON_COLS * STEP + 0.5, ICON_ORIGIN[1] + 7],
];

const PATTERN_LAYER_IDS = ["demo-patterns-fill", "demo-patterns-outline"];
const ICON_LAYER_IDS = ["demo-icons-symbol"];

/** Returns a closed GeoJSON ring for a cell at (lon, lat). */
export function makePolygon(lon, lat) {
  return [
    [lon,        lat],
    [lon + CELL, lat],
    [lon + CELL, lat + CELL],
    [lon,        lat + CELL],
    [lon,        lat],
  ];
}

/** Returns a GeoJSON FeatureCollection grid from an icon list. */
export function makeGrid(icons, [lon0, lat0], cols) {
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
              : [makePolygon(lon, lat)],
        },
        properties: { id: icon.id, group: icon.group },
      };
    }),
  };
}

/**
 * Build and add the sprite demo sources/layers to `map`.
 * Layers are added hidden — call showPatterns/showIcons to reveal them.
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

  map.addSource("demo-patterns", { type: "geojson", data: makeGrid(patterns, PATTERN_ORIGIN, PATTERN_COLS) });
  map.addSource("demo-icons",    { type: "geojson", data: makeGrid(symbols,  ICON_ORIGIN,    ICON_COLS)    });

  map.addLayer({
    id: "demo-patterns-fill",
    type: "fill",
    source: "demo-patterns",
    layout: { visibility: "none" },
    paint: { "fill-pattern": ["concat", "patterns:", ["get", "id"]] },
  });
  map.addLayer({
    id: "demo-patterns-outline",
    type: "line",
    source: "demo-patterns",
    layout: { visibility: "none" },
    paint: { "line-color": "#333", "line-width": 0.5, "line-opacity": 0.4 },
  });
  map.addLayer({
    id: "demo-icons-symbol",
    type: "symbol",
    source: "demo-icons",
    layout: {
      visibility: "none",
      "icon-image": ["get", "id"],
      "icon-size": 1,
      "icon-allow-overlap": true,
    },
  });
}

export function showPatterns(map) {
  for (const id of PATTERN_LAYER_IDS)
    map.setLayoutProperty(id, "visibility", "visible");
  // maxZoom: 6 keeps ≈1–2 tile repetitions per cell (fill-pattern pixel size
  // is screen-stable; polygons grow with zoom so tile/cell ratio varies).
  map.fitBounds(PATTERNS_BOUNDS, { padding: 40, duration: 800, maxZoom: 6 });
}

export function hidePatterns(map) {
  for (const id of PATTERN_LAYER_IDS)
    map.setLayoutProperty(id, "visibility", "none");
}

export function showIcons(map) {
  for (const id of ICON_LAYER_IDS)
    map.setLayoutProperty(id, "visibility", "visible");
  map.fitBounds(ICONS_BOUNDS, { padding: 40, duration: 800, maxZoom: 6 });
}

export function hideIcons(map) {
  for (const id of ICON_LAYER_IDS)
    map.setLayoutProperty(id, "visibility", "none");
}
