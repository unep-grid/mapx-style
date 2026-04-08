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
    });
  }
});
