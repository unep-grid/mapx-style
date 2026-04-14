import { defineConfig } from "vite";

// Library build — produces ESM + UMD bundles in dist/.
// maplibre-gl is the only external: consumers always bring their own copy.
// pmtiles and chroma-js are bundled so a single <script> tag is sufficient.

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "MapxStyle",
      formats: ["es", "umd"],
      fileName: (format) =>
        format === "es" ? "mapx-style.esm.js" : "mapx-style.umd.js",
    },
    rollupOptions: {
      external: ["maplibre-gl"],
      output: {
        globals: { "maplibre-gl": "maplibregl" },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
