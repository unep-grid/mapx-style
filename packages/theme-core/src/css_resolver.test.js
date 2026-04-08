import { describe, it, expect } from "vitest";
import { css_resolver } from "./css_resolver.js";
import { themes } from "./themes/index.js";
import chroma from "chroma-js";

describe("css_resolver", () => {
  it("returns empty string for null input", () => {
    expect(css_resolver(null)).toBe("");
  });

  it("returns empty string for empty object", () => {
    expect(css_resolver({})).toBe("");
  });

  for (const theme of themes) {
    describe(`theme: ${theme.id}`, () => {
      const result = css_resolver(theme.colors);

      it("returns a non-empty string", () => {
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      it("contains --mx_ custom properties", () => {
        expect(result).toContain("--mx_");
      });

      it("contains expected core properties", () => {
        expect(result).toContain("--mx_ui_text:");
        expect(result).toContain("--mx_ui_background:");
        expect(result).toContain("--mx_ui_border:");
      });

      it("all color values are parseable by chroma", () => {
        // Extract all css() color values from the output: rgba(...) / rgb(...) / transparent
        const colorRegex = /:\s*(rgba?\([^)]+\)|transparent|#[0-9a-f]+)/gi;
        const matches = [...result.matchAll(colorRegex)].map((m) => m[1]);
        expect(matches.length).toBeGreaterThan(0);
        for (const colorStr of matches) {
          if (colorStr === "transparent") continue;
          expect(() => chroma(colorStr), `chroma("${colorStr}")`).not.toThrow();
        }
      });
    });
  }
});
