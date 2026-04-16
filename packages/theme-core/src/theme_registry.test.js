import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_ID,
  getBuiltInTheme,
  getForIntegration,
  listBuiltInThemes,
  themes,
  validateThemeColors,
} from "./theme_registry.js";

describe("theme_registry", () => {
  it("exports canonical themes as frozen data", () => {
    expect(Object.isFrozen(themes)).toBe(true);
    expect(Object.isFrozen(themes[0])).toBe(true);
    expect(Object.isFrozen(themes[0].colors)).toBe(true);
  });

  it("preserves the app theme ordering for built-in resolver compatibility", () => {
    expect(themes.map((theme) => theme.id)).toEqual([
      "color_light",
      "color_dark",
      "water_dark",
      "water_light",
      "tree_dark",
      "tree_light",
      "classic_dark",
      "classic_light",
    ]);
    expect(DEFAULT_THEME_ID).toBe("color_light");
  });

  it("listBuiltInThemes returns clones", () => {
    const listedThemes = listBuiltInThemes();
    expect(listedThemes).not.toBe(themes);
    expect(listedThemes[0]).not.toBe(themes[0]);

    listedThemes[0].colors.mx_ui_text.color = "#fff";
    expect(themes[0].colors.mx_ui_text.color).not.toBe("#fff");
  });

  it("getBuiltInTheme returns a clone by id", () => {
    const theme = getBuiltInTheme("classic_light");
    expect(theme.id).toBe("classic_light");
    expect(theme).not.toBe(themes[7]);
  });

  it("getForIntegration hides the map mask without mutating the caller theme", () => {
    const sourceTheme = getBuiltInTheme("classic_light");
    sourceTheme.colors.mx_map_mask.visibility = "visible";

    const integratedTheme = getForIntegration(sourceTheme);
    expect(integratedTheme.colors.mx_map_mask.visibility).toBe("none");
    expect(sourceTheme.colors.mx_map_mask.visibility).toBe("visible");
  });

  it("validateThemeColors accepts either a theme object or a colors object", () => {
    expect(validateThemeColors(themes[0])).toBe(true);
    expect(validateThemeColors(themes[0].colors)).toBe(true);
    expect(validateThemeColors({ bad: { color: "not-a-color" } })).toBe(false);
  });
});
