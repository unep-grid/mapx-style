/**
 * layer_resolver — maps a MapX color config object to an array of MapLibre layer update objects.
 *
 * Extracted from legacy/mapx/app/src/js/theme/mapx_style_resolver.js.
 * Zero dependencies — the color values are used as-is from the config.
 *
 * Layer IDs match the Protomaps-based MapX style (public/style/style.json).
 *
 * Mapping notes:
 *   mx_map_background → "earth" (Protomaps land fill)
 *   mx_map_water      → "background" (Protomaps ocean canvas) + "water" / "water_river" / "waterway"
 *
 * @param {object} c - Theme colors object (theme.colors)
 * @returns {{ id: string[], paint?: object, layout?: object }[]}
 */
export function layer_resolver(c) {
  if (c == null || Object.keys(c).length === 0) {
    console.warn("layer_resolver received empty color config");
    return [];
  }

  return [
    // Ocean canvas background (Protomaps: background = ocean, not land)
    {
      id: ["background"],
      paint: { "background-color": c.mx_map_water.color },
    },
    // Land fill (Protomaps: earth = land, was "background" in legacy style)
    {
      id: ["earth"],
      layout: { visibility: c.mx_map_background.visibility },
      paint: { "fill-color": c.mx_map_background.color },
    },
    {
      id: ["landuse_vegetation", "national_park", "landcover_vegetation"],
      layout: { visibility: c.mx_map_vegetation.visibility },
      paint: { "fill-color": c.mx_map_vegetation.color },
    },
    {
      id: ["landuse_commercial"],
      layout: { visibility: c.mx_map_zone_commercial.visibility },
      paint: { "fill-color": c.mx_map_zone_commercial.color },
    },
    {
      id: ["landuse_snow"],
      layout: { visibility: c.mx_map_snow.visibility },
      paint: { "fill-color": c.mx_map_snow.color },
    },
    // Water: named water bodies + rivers
    {
      id: ["water", "water_river"],
      layout: { visibility: c.mx_map_water.visibility },
      paint: { "fill-color": c.mx_map_water.color },
    },
    {
      id: ["waterway"],
      layout: { visibility: c.mx_map_water.visibility },
      paint: { "line-color": c.mx_map_water.color },
    },
    // Bathymetry depth zones (ocean only — after water fill, on top)
    {
      id: ["bathymetry"],
      layout: {
        visibility: allVisible([
          c.mx_map_bathymetry_low.visibility,
          c.mx_map_bathymetry_high.visibility,
        ]),
      },
      paint: {
        "fill-color": [
          "interpolate", ["linear"],
          ["get", "depth_m"],
          0,    c.mx_map_bathymetry_high.color,
          9000, c.mx_map_bathymetry_low.color,
        ],
      },
    },
    {
      id: ["bathymetry-lines"],
      layout: { visibility: c.mx_map_bathymetry_lines.visibility },
      paint: { "line-color": c.mx_map_bathymetry_lines.color },
    },
    {
      id: ["bathymetry-labels"],
      layout: {
        visibility: c.mx_map_text_bathymetry.visibility,
        "text-font": fontFallback(c.mx_map_text_bathymetry.font),
      },
      paint: { "text-color": c.mx_map_text_bathymetry.color },
    },
    // Contours (added dynamically after map load)
    {
      id: ["contour-lines"],
      layout: { visibility: c.mx_map_contour_lines.visibility },
      paint: { "line-color": c.mx_map_contour_lines.color },
    },
    {
      id: ["contour-labels"],
      layout: {
        visibility: c.mx_map_text_contour.visibility,
        "text-font": fontFallback(c.mx_map_text_contour.font),
      },
      paint: { "text-color": c.mx_map_text_contour.color },
    },
    // Mask (country-code overlay)
    {
      id: ["country-code"],
      layout: { visibility: c.mx_map_mask.visibility },
      paint: { "fill-color": c.mx_map_mask.color },
    },
    // Roads
    {
      id: [
        "road_path_tunnel",
        "road_path",
        "road_path_bridge",
        "road_regular_tunnel",
        "road_regular",
        "road_regular_bridge",
        "road_motor_tunnel",
        "road_motor",
        "road_motor_bridge",
      ],
      layout: { visibility: c.mx_map_road.visibility },
      paint: { "line-color": c.mx_map_road.color },
    },
    {
      id: ["road_rail", "road_rail_ticks"],
      layout: { visibility: c.mx_map_rail.visibility },
      paint: { "line-color": c.mx_map_rail.color },
    },
    {
      id: ["road_pedestrian_polygon", "road_polygon"],
      layout: { visibility: c.mx_map_road.visibility },
      paint: { "fill-color": c.mx_map_road.color },
    },
    {
      id: [
        "road_path_tunnel_case",
        "road_path_case",
        "road_path_bridge_case",
        "road_regular_tunnel_case",
        "road_regular_case",
        "road_regular_bridge_case",
        "road_motor_tunnel_case",
        "road_motor_case",
        "road_motor_bridge_case",
      ],
      layout: { visibility: c.mx_map_road_border.visibility },
      paint: { "line-color": c.mx_map_road_border.color },
    },
    // Buildings
    {
      id: ["building_extrusion"],
      paint: { "fill-extrusion-color": c.mx_map_building.color },
    },
    {
      id: ["building"],
      layout: { visibility: c.mx_map_building.visibility },
      paint: { "fill-color": c.mx_map_building.color },
    },
    {
      id: ["building_border"],
      layout: { visibility: c.mx_map_building_border.visibility },
      paint: { "line-color": c.mx_map_building_border.color },
    },
    // Boundaries
    ...[1, 2, 3, 4, 8, 9, 6].map((i) => ({
      id: [`boundary_un_${i}`],
      layout: { visibility: c[`mx_map_boundary_un_${i}`].visibility },
      paint: { "line-color": c[`mx_map_boundary_un_${i}`].color },
    })),
    {
      id: ["wmo_borders_line"],
      layout: { visibility: c.mx_map_boundary_un_1.visibility },
      paint: { "line-color": c.mx_map_boundary_un_1.color },
    },
    {
      id: ["wmo_borders_poly"],
      layout: { visibility: c.mx_map_boundary_un_1.visibility },
    },
    {
      id: ["boundary_osm"],
      layout: { visibility: c.mx_map_boundary_un_1.visibility },
      paint: { "line-color": c.mx_map_boundary_un_1.color },
    },
    // Place labels
    {
      id: ["places_locality_capital", "places_locality_regional", "places_locality_minor"],
      layout: {
        visibility: c.mx_map_text_place.visibility,
        "text-font": fontFallback(c.mx_map_text_place.font),
      },
      paint: {
        "text-color": c.mx_map_text_place.color,
        "icon-color": c.mx_map_text_place.color,
      },
    },
    // Sub-country level 1 labels
    ...[1].map((i) => ({
      id: [`country_un_1_label_${i}`],
      layout: {
        visibility: c[`mx_map_text_country_1_${i}`].visibility,
        "text-font": fontFallback(c[`mx_map_text_country_1_${i}`].font),
      },
      paint: {
        "text-color": c[`mx_map_text_country_1_${i}`].color,
        "icon-color": c[`mx_map_text_country_1_${i}`].color,
      },
    })),
    // Country level 0 labels
    ...[0, 1, 2, 3, 4, 5, 99].map((i) => ({
      id: [`country_un_0_label_${i}`],
      layout: {
        visibility: c[`mx_map_text_country_0_${i}`].visibility,
        "text-font": fontFallback(c[`mx_map_text_country_0_${i}`].font),
      },
      paint: {
        "text-color": c[`mx_map_text_country_0_${i}`].color,
        "icon-color": c[`mx_map_text_country_0_${i}`].color,
      },
    })),
    // Water labels
    {
      id: ["water-label-line", "water-label-point", "waterway-label"],
      layout: {
        visibility: c.mx_map_text_water.visibility,
        "text-font": fontFallback(c.mx_map_text_water.font),
      },
      paint: {
        "text-color": c.mx_map_text_water.color,
        "icon-color": c.mx_map_text_water.color,
      },
    },
    {
      id: ["road-label"],
      layout: {
        visibility: c.mx_map_text_road.visibility,
        "text-font": fontFallback(c.mx_map_text_road.font),
      },
      paint: { "text-color": c.mx_map_text_road.color },
    },
    // Text halos
    {
      id: ["water-label-line", "water-label-point", "waterway-label"],
      paint: { "text-halo-color": c.mx_map_text_water_outline.color },
    },
    {
      id: ["bathymetry-labels"],
      paint: { "text-halo-color": c.mx_map_text_bathymetry_outline.color },
    },
    {
      id: [
        "road-label",
        "places_locality_capital",
        "places_locality_regional",
        "places_locality_minor",
        "country_un_0_label_0",
        "country_un_0_label_1",
        "country_un_0_label_2",
        "country_un_0_label_3",
        "country_un_0_label_4",
        "country_un_0_label_5",
        "country_un_0_label_99",
        "country_un_1_label_1",
        "contour-labels",
      ],
      paint: { "text-halo-color": c.mx_map_text_land_outline.color },
    },
  ];
}

function fontFallback(id) {
  return [id || "Noto Sans Regular"];
}

function allVisible(arr) {
  return arr.every((v) => v === "visible") ? "visible" : "none";
}
