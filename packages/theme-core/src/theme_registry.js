import chroma from "chroma-js";
import color_light from "./themes/color_light.json";
import color_dark from "./themes/color_dark.json";
import water_dark from "./themes/water_dark.json";
import water_light from "./themes/water_light.json";
import tree_dark from "./themes/tree_dark.json";
import tree_light from "./themes/tree_light.json";
import classic_dark from "./themes/classic_dark.json";
import classic_light from "./themes/classic_light.json";

export const DEFAULT_THEME_ID = "color_light";

const canonicalThemes = [
  color_light,
  color_dark,
  water_dark,
  water_light,
  tree_dark,
  tree_light,
  classic_dark,
  classic_light,
].map((theme) => deepFreeze(cloneTheme(theme)));

const canonicalThemesById = new Map(
  canonicalThemes.map((theme) => [theme.id, theme]),
);

export const themes = Object.freeze(canonicalThemes);

export function listBuiltInThemes() {
  return canonicalThemes.map((theme) => cloneTheme(theme));
}

export function getBuiltInTheme(id = DEFAULT_THEME_ID) {
  const theme = canonicalThemesById.get(id);
  return theme ? cloneTheme(theme) : null;
}

export function getDefaultTheme() {
  return getBuiltInTheme(DEFAULT_THEME_ID);
}

export function isBuiltInThemeId(id) {
  return canonicalThemesById.has(id);
}

export function cloneTheme(theme) {
  if (theme == null) return null;
  return JSON.parse(JSON.stringify(theme));
}

export function normalizeTheme(themeOrId) {
  if (themeOrId == null) return null;

  if (typeof themeOrId === "string") {
    return getBuiltInTheme(themeOrId);
  }

  if (typeof themeOrId !== "object") {
    return null;
  }

  if (!themeOrId.colors && themeOrId.id && isBuiltInThemeId(themeOrId.id)) {
    return getBuiltInTheme(themeOrId.id);
  }

  const theme = cloneTheme(themeOrId);

  // App-specific registry metadata must not leak into map runtime state.
  delete theme._storage;

  return theme?.id ? theme : null;
}

export function validateThemeColors(themeOrColors) {
  const colors =
    themeOrColors?.colors && typeof themeOrColors.colors === "object"
      ? themeOrColors.colors
      : themeOrColors;

  try {
    return (
      colors instanceof Object &&
      Object.keys(colors).reduce((acc, colorId) => {
        return acc && chroma.valid(colors[colorId].color || colors[colorId]);
      }, true)
    );
  } catch (error) {
    return false;
  }
}

export function getForIntegration(themeData = DEFAULT_THEME_ID) {
  const theme = normalizeTheme(themeData);

  if (!theme) return theme;

  if (theme?.colors?.mx_map_mask) {
    theme.colors.mx_map_mask.visibility = "none";
  }

  return theme;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return value;
}
