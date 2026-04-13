/**
 * build_style — resolves a MapX style template into a complete MapLibre style.
 *
 * The base style (style.json) declares terrain and contours sources with
 * placeholder tile arrays. Their actual tile URLs depend on a maplibre-contour
 * DemSource instance, which registers custom protocols at runtime. This
 * function fills in those URLs before the style is passed to maplibregl.Map.
 *
 * @param {object} style     - Raw style JSON (mutated in-place and returned).
 * @param {object} demSource - mlcontour.DemSource instance (already set up).
 * @returns {object} The same style object with terrain + contours sources resolved.
 */
export function build_style(style, demSource) {
  style.sources.terrain.tiles = [demSource.sharedDemProtocolUrl];
  style.sources.terrain_hillshade.tiles = [demSource.sharedDemProtocolUrl];

  style.sources.contours.tiles = [
    demSource.contourProtocolUrl({
      multiplier: 1,
      thresholds: {
        9:  [500, 2000],
        10: [200, 1000],
        11: [100,  500],
        12: [ 50,  200],
        13: [ 20,  100],
        14: [ 10,   50],
      },
      contourLayer: "contours",
      elevationKey: "ele",
      levelKey:     "level",
      extent: 4096,
      buffer: 1,
    }),
  ];

  return style;
}
