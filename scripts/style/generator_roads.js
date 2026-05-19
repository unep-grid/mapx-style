/**
 * License : MIT
 * Author/copyright : 2023-present unepgrid.ch
 *
 * Generate road layers for MapLibre + Protomaps basemap.
 *
 * Protomaps source mapping:
 *   mapSource        : "mapbox_composite" → "protomaps_basemap"
 *   source-layer     : "road"  → "roads"
 *   class filter     : ["get", "class"]     → ["in", ["get", "kind"], ["literal", [...]]]
 *   structure filter : ["get", "structure"] → ["has"/"!has", "is_tunnel"/"is_bridge"]
 *   roadClasses      : Mapbox class names  → Protomaps pmap:kind values
 *   Removed          : type:"platform" exclusion (no equivalent in Protomaps)
 *
 * Layer IDs are unchanged — the theme resolver (§7) still works as-is.
 *
 * Usage:
 *   node scripts/style/generator_roads.js        # prints JSON to stdout
 *   node scripts/style/generator_roads.js | pbcopy  # copy to clipboard
 */

const config = {
  generatorName: "generator_roads.js",
  roadTypes: ["path", "regular", "motor"],

  mapSource: "protomaps_basemap",

  // Protomaps pmap:kind values per road type
  roadClasses: {
    motor:   ["highway"],
    regular: ["major_road", "minor_road"],
    path:    ["path"],
  },

  // pmap:level: -1 = tunnel, 0 = surface, 1 = bridge
  structures: [-1, 0, 1],
  structureNames: { "-1": "tunnel", "0": "none", "1": "bridge" },

  colors: {
    motor:   "rgb(240,240,240)",
    regular: "rgb(255,255,255)",
    path:    "rgb(255,255,255)",
  },
  baseWidth: 0.6,
  roadTypeWidths: {
    motor:   10,
    regular: 8,
    path:    2,
  },
  minZoomType: {
    motor:   8,
    regular: 8,
    path:    12,
  },
  casingColor: "rgb(200,200,200)",
  casingWidth: 1.5,
  zoomWidthRange: { start: 10, end: 18 },
  widthRange:     { start: 0.1, end: 1 },
};

class RoadLayerGenerator {
  constructor(opt) {
    this.config = Object.assign({}, config, opt);
  }

  createLayer(id, classes, structureLevel, opacity, minZoom, color, width, capStyle = "round") {
    const rlg = this;

    // Protomaps uses boolean flags, not a numeric level property
    let structureFilters;
    if (structureLevel === -1) {
      structureFilters = [["has", "is_tunnel"]];
    } else if (structureLevel === 1) {
      structureFilters = [["has", "is_bridge"]];
    } else {
      structureFilters = [["!has", "is_tunnel"], ["!has", "is_bridge"]];
    }

    return {
      id,
      metadata: {
        auto_generated: true,
        generator: rlg.config.generatorName,
        date: new Date().toISOString(),
      },
      minzoom: minZoom,
      type: "line",
      source: rlg.config.mapSource,
      "source-layer": "roads",
      filter: [
        "all",
        classes.length === 1
          ? ["==", "kind", classes[0]]
          : ["in", "kind", ...classes],
        ...structureFilters,
      ],
      paint: {
        "line-color": color,
        "line-opacity": opacity,
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          rlg.config.zoomWidthRange.start,
          width * rlg.config.widthRange.start,
          rlg.config.zoomWidthRange.end,
          width * rlg.config.widthRange.end,
        ],
      },
      layout: {
        "line-join": "round",
        "line-cap": capStyle,
        "line-round-limit": 2,
      },
    };
  }

  createCasingLayer(id, classes, structureLevel, opacity, minZoom, width) {
    const rlg = this;
    return rlg.createLayer(
      `${id}_case`,
      classes,
      structureLevel,
      opacity,
      minZoom,
      rlg.config.casingColor,
      width + rlg.config.casingWidth,
      "butt"
    );
  }

  createLayers() {
    const rlg = this;
    const layers = [];

    for (const type of rlg.config.roadTypes) {
      for (const structureLevel of rlg.config.structures) {
        const structureName = rlg.config.structureNames[String(structureLevel)];
        const id = `road_${type}${structureName === "none" ? "" : `_${structureName}`}`;
        const width = rlg.config.baseWidth + rlg.config.roadTypeWidths[type];
        const minZoom = rlg.config.minZoomType[type];
        const capStyle = structureName === "none" ? "round" : "butt";
        const opacity = structureName === "tunnel" ? 0.4 : 1;

        const opacityCasing = [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          10, 0,
          14, 0.2,
          15, 0.8,
          15.1, 1,
        ];

        // Casing layer first (renders below the fill layer)
        layers.push(
          rlg.createCasingLayer(
            id,
            rlg.config.roadClasses[type],
            structureLevel,
            opacityCasing,
            minZoom,
            width
          )
        );
        // Fill layer
        layers.push(
          rlg.createLayer(
            id,
            rlg.config.roadClasses[type],
            structureLevel,
            opacity,
            minZoom,
            rlg.config.colors[type],
            width,
            capStyle
          )
        );
      }
    }

    return layers;
  }

  printLayers() {
    const rlg = this;
    const layers = rlg.createLayers();
    // Omit wrapping [] so output can be pasted directly into style.json layers array
    const string = JSON.stringify(layers, null, 2).slice(1, -1).trimStart() + ",";
    console.log(string);
  }
}

const roadLayerGenerator = new RoadLayerGenerator();
roadLayerGenerator.printLayers();
