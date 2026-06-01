import { describe, it, expect } from "vitest";
import { layer_resolver } from "./layer_resolver.js";
import { themes } from "./themes/index.js";

describe("layer_resolver", () => {
  it("returns empty array for null input", () => {
    expect(layer_resolver(null)).toEqual([]);
  });

  it("returns empty array for empty object", () => {
    expect(layer_resolver({})).toEqual([]);
  });

  for (const theme of themes) {
    describe(`theme: ${theme.id}`, () => {
      const result = layer_resolver(theme.colors);

      it("returns an array", () => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it("every entry has an id array", () => {
        for (const entry of result) {
          expect(Array.isArray(entry.id)).toBe(true);
          expect(entry.id.length).toBeGreaterThan(0);
          for (const id of entry.id) {
            expect(typeof id).toBe("string");
          }
        }
      });

      it("every entry has paint and/or layout", () => {
        for (const entry of result) {
          const hasPaintOrLayout = entry.paint != null || entry.layout != null;
          expect(hasPaintOrLayout).toBe(true);
        }
      });

      it("no null or undefined values in paint or layout", () => {
        for (const entry of result) {
          if (entry.paint) {
            for (const [key, val] of Object.entries(entry.paint)) {
              expect(val, `paint.${key} in ${entry.id[0]}`).not.toBeNull();
              expect(val, `paint.${key} in ${entry.id[0]}`).not.toBeUndefined();
            }
          }
          if (entry.layout) {
            for (const [key, val] of Object.entries(entry.layout)) {
              expect(val, `layout.${key} in ${entry.id[0]}`).not.toBeNull();
              expect(val, `layout.${key} in ${entry.id[0]}`).not.toBeUndefined();
            }
          }
        }
      });

      it("maps bathymetry line styling to the bathymetry line theme token", () => {
        const entry = result.find((item) => item.id.includes("bathymetry-lines"));

        expect(entry.layout.visibility).toBe(theme.colors.mx_map_bathymetry_lines.visibility);
        expect(entry.paint["line-color"]).toBe(theme.colors.mx_map_bathymetry_lines.color);
      });

      it("maps raster DEM hillshade styling to the hillshade theme tokens", () => {
        const entry = result.find((item) => item.id.includes("hillshade"));

        expect(entry.layout).toBeUndefined();
        expect(entry.paint["hillshade-shadow-color"]).toBe(
          theme.colors.mx_map_hillshade_shadow.color,
        );
        expect(entry.paint["hillshade-highlight-color"]).toBe(
          theme.colors.mx_map_hillshade_highlight.color,
        );
        expect(entry.paint["hillshade-accent-color"]).toBe(
          theme.colors.mx_map_hillshade_shadow.color,
        );
      });

      it("maps OSM country boundary styling to the international boundary theme token", () => {
        const entry = result.find((item) => item.id.includes("boundary_osm"));

        expect(entry.layout.visibility).toBe(theme.colors.mx_map_boundary_un_1.visibility);
        expect(entry.paint["line-color"]).toBe(theme.colors.mx_map_boundary_un_1.color);
      });

      it("maps WMO boundary styling to the international boundary theme token", () => {
        const line = result.find((item) => item.id.includes("wmo_borders_line"));
        const poly = result.find((item) => item.id.includes("wmo_borders_poly"));

        expect(line.layout.visibility).toBe(theme.colors.mx_map_boundary_un_1.visibility);
        expect(line.paint["line-color"]).toBe(theme.colors.mx_map_boundary_un_1.color);
        expect(poly.layout.visibility).toBe(theme.colors.mx_map_boundary_un_1.visibility);
        expect(poly.paint).toBeUndefined();
      });
    });
  }
});
