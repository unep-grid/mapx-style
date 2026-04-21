import { describe, expect, it } from "vitest";
import {
  getFontFaceCss,
  listFontFamilies,
  listFonts,
} from "./theme_fonts.js";

describe("theme_fonts", () => {
  it("lists supported UI font families", () => {
    expect(listFontFamilies()).toEqual([
      "Libre Baskerville",
      "Noto Sans",
      "Noto Sans Mono",
      "Roboto",
      "Titillium Web",
      "Varela Round",
    ]);
  });

  it("lists available map font combinations", () => {
    const fonts = listFonts();
    expect(fonts).toContain("Noto Sans Regular");
    expect(fonts).toContain("Libre Baskerville Italic");
    expect(fonts).toContain("Varela Round Regular");
  });

  it("builds font-face CSS with fontsource WOFF2 asset URLs", () => {
    const css = getFontFaceCss("Roboto");
    expect(css).toContain('font-family: "Roboto"');
    expect(css).toContain("roboto-latin-400-normal.woff2");
    expect(css).toContain('format("woff2")');
  });
});
