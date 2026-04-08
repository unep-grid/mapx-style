import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import mlcontour from "maplibre-contour";
import { MapxStyle } from "@unepgrid-mapx/theme-core";
import { MapCompare } from "./mapcompare.js";
import { buildSpriteDemo, showPatterns, hidePatterns, showIcons, hideIcons } from "./sprite_demo.js";

const env = import.meta.env.DEV ? "dev" : "prod";
const mxStyle = new MapxStyle({ env, maplibregl, mlcontour });

const styleProd = mxStyle.getStyle();
const styleDebug = mxStyle.getStyleDebug();

// ── Viewport persistence
const STORAGE_KEY = "mapx_viewport";
function loadViewport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveViewport(map) {
  const { lng, lat } = map.getCenter();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      center: [lng, lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    }),
  );
}

const saved = loadViewport();

// ── Instantiate maps
const shared = {
  center: saved?.center ?? [10, 20],
  zoom: saved?.zoom ?? 2,
  bearing: saved?.bearing ?? 0,
  pitch: saved?.pitch ?? 0,
  transformRequest: mxStyle.transformRequest,
};

const mapProd = new maplibregl.Map({
  container: "map-prod",
  style: styleProd,
  ...shared,
});
const mapDebug = new maplibregl.Map({
  container: "map-debug",
  style: styleDebug,
  ...shared,
});

// Only attach prod — debug is intentionally unthemed (x-ray mode)
mxStyle.attachMap(mapProd);

// Expose prod map for Playwright tests
window.__mapProd = mapProd;

mapProd.on("moveend", () => saveViewport(mapProd));

mapProd.addControl(new maplibregl.NavigationControl(), "top-right");
mapProd.addControl(new maplibregl.ScaleControl(), "bottom-left");

// ── Compare divider + map sync
new MapCompare(mapProd, mapDebug, {
  wrap: document.getElementById("compare-wrap"),
  divider: document.getElementById("compare-divider"),
  labelB: document.getElementById("label-debug"),
});

// ── Theme picker ──────────────────────────────────────────────────────────────
const themePicker = document.getElementById("theme-picker");
for (const t of mxStyle.getThemes()) {
  const opt = document.createElement("option");
  opt.value = t.id;
  opt.textContent = t.label.en;
  if (t.id === "color_light") opt.selected = true;
  themePicker.appendChild(opt);
}

themePicker.addEventListener("change", () => {
  mxStyle.setTheme(themePicker.value);
});

// ── Language picker ───────────────────────────────────────────────────────────
document.getElementById("language-picker").addEventListener("change", (e) => {
  mxStyle.setLanguage(e.target.value);
});

// ── Layer visibility toggles (applied to both maps for shared layers)
document.querySelectorAll("[data-group]").forEach((input) => {
  input.addEventListener("change", () => {
    const sourceId = input.dataset.group;
    const visibility = input.checked ? "visible" : "none";
    for (const map of [mapProd, mapDebug]) {
      map
        .getStyle()
        ?.layers.filter((l) => l.source === sourceId)
        .forEach((l) => map.setLayoutProperty(l.id, "visibility", visibility));
    }
  });
});

// ── Terrain controls (prod map only) ─────────────────────────────────────────

document.getElementById("toggle-place-mask").addEventListener("change", (e) => {
  e.target.checked ? mxStyle.enableMask() : mxStyle.disableMask();
});

document.getElementById("toggle-hillshade").addEventListener("change", (e) => {
  e.target.checked ? mxStyle.enableHillshade() : mxStyle.disableHillshade();
});

document.getElementById("toggle-contours").addEventListener("change", (e) => {
  e.target.checked ? mxStyle.enableContours() : mxStyle.disableContours();
});
document.getElementById("toggle-terrain-3d").addEventListener("change", (e) => {
  e.target.checked ? mxStyle.enableTerrain() : mxStyle.disableTerrain();
});

mapProd.on("load", () => {
  mxStyle.setTheme("color_light");

  buildSpriteDemo(mapProd, mxStyle);
});

document.getElementById("toggle-demo-patterns").addEventListener("change", (e) => {
  e.target.checked ? showPatterns(mapProd) : hidePatterns(mapProd);
});
document.getElementById("toggle-demo-icons").addEventListener("change", (e) => {
  e.target.checked ? showIcons(mapProd) : hideIcons(mapProd);
});

// ── debug data (prod map only) ─────────────────────────────────────────

mapProd.on("mousemove", (e) => {
  const features = mapProd.queryRenderedFeatures(e.point);

  if (features.length > 0) {
    const tableData = features.map((f) => {
      return {
        layerId: f.layer.id,
        source: f.source,
        properties: f.properties,
      };
    });

    const out = {
      pos: e.lngLat.toString(),
      data: tableData,
    };

    console.log(JSON.stringify(out, null, 1));
  } else {
    console.log("No features hovered.");
  }
});
