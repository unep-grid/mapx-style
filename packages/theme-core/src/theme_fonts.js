import libreBaskervilleRegularUrl from "@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff2";
import notoSansRegularUrl from "@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff2";
import notoSansArabicRegularUrl from "@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff2";
import notoSansArmenianRegularUrl from "@fontsource/noto-sans-armenian/files/noto-sans-armenian-armenian-400-normal.woff2";
import notoSansBengaliRegularUrl from "@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-400-normal.woff2";
import notoSansMonoRegularUrl from "@fontsource/noto-sans-mono/files/noto-sans-mono-latin-400-normal.woff2";
import notoSansSCRegularUrl from "@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2";
import robotoRegularUrl from "@fontsource/roboto/files/roboto-latin-400-normal.woff2";
import titilliumWebRegularUrl from "@fontsource/titillium-web/files/titillium-web-latin-400-normal.woff2";
import varelaRoundRegularUrl from "@fontsource/varela-round/files/varela-round-latin-400-normal.woff2";
import combinations from "../../../data/fonts/combinations.json";

// Maps each installed @fontsource stem (400-normal only) to its WOFF2 URL and
// CSS font-family name. Only the regular weight is needed for @font-face injection.
// To add a new font family: add an entry here + the @fontsource package to
// package.json devDependencies + the combinations in data/fonts/combinations.json.
const STEM_URLS = {
  "libre-baskerville-latin-400-normal": { url: libreBaskervilleRegularUrl, cssFamily: "Libre Baskerville" },
  "noto-sans-latin-400-normal": { url: notoSansRegularUrl, cssFamily: "Noto Sans" },
  "noto-sans-arabic-arabic-400-normal": { url: notoSansArabicRegularUrl, cssFamily: "Noto Sans Arabic" },
  "noto-sans-armenian-armenian-400-normal": { url: notoSansArmenianRegularUrl, cssFamily: "Noto Sans Armenian" },
  "noto-sans-bengali-bengali-400-normal": { url: notoSansBengaliRegularUrl, cssFamily: "Noto Sans Bengali" },
  "noto-sans-mono-latin-400-normal": { url: notoSansMonoRegularUrl, cssFamily: "Noto Sans Mono" },
  "noto-sans-sc-chinese-simplified-400-normal": { url: notoSansSCRegularUrl, cssFamily: "Noto Sans SC" },
  "roboto-latin-400-normal": { url: robotoRegularUrl, cssFamily: "Roboto" },
  "titillium-web-latin-400-normal": { url: titilliumWebRegularUrl, cssFamily: "Titillium Web" },
  "varela-round-latin-400-normal": { url: varelaRoundRegularUrl, cssFamily: "Varela Round" },
};

// Strip trailing weight/style words to extract the base family name.
const WEIGHT_STYLE_WORDS = new Set([
  "Regular", "Bold", "Italic", "Medium", "Light",
  "SemiBold", "ExtraBold", "ExtraLight", "Black", "Thin",
]);

function extractFamily(fontName) {
  const words = fontName.split(" ");
  let i = words.length - 1;
  while (i > 0 && WEIGHT_STYLE_WORDS.has(words[i])) i--;
  return words.slice(0, i + 1).join(" ");
}

// Filter out metadata keys (e.g. the "comment" entry in combinations.json).
const FONT_COMBINATIONS = Object.fromEntries(
  Object.entries(combinations).filter(([, v]) => Array.isArray(v)),
);

// Derived from combinations.json — no manual maintenance needed.
const UI_FONT_FAMILIES = Object.freeze(
  [...new Set(Object.keys(FONT_COMBINATIONS).map(extractFamily))].sort(),
);

// For each family: take the "Regular" combination, filter to 400-normal stems,
// look up each stem in STEM_URLS to get its URL and CSS font-family name.
const FONT_FAMILY_FACES = Object.freeze(
  Object.fromEntries(
    UI_FONT_FAMILIES.map((family) => {
      const stems = FONT_COMBINATIONS[`${family} Regular`] ?? [];
      const faces = stems
        .filter((stem) => stem.endsWith("-400-normal"))
        .flatMap((stem) => {
          const entry = STEM_URLS[stem];
          return entry ? [{ family: entry.cssFamily, url: entry.url }] : [];
        });
      return [family, faces];
    }),
  ),
);

// Sorted longest-first so startsWith matching in resolveFontFamily correctly
// prefers "Noto Sans Mono" over "Noto Sans" when given "Noto Sans Mono Regular".
const FAMILIES_BY_SPECIFICITY = [...UI_FONT_FAMILIES].sort((a, b) => b.length - a.length);

const MAP_FONTS = Object.freeze(Object.keys(FONT_COMBINATIONS));
const FONT_STYLE_EL_ID = "mapx-theme-font-faces";
const LOADED_FONT_FAMILIES = new Set();

function resolveFontFamily(fontName) {
  if (!fontName || typeof fontName !== "string") return null;
  const exact = UI_FONT_FAMILIES.find((f) => f === fontName);
  if (exact) return exact;
  return FAMILIES_BY_SPECIFICITY.find((f) => fontName.startsWith(`${f} `)) || null;
}

export function listFontFamilies() {
  return [...UI_FONT_FAMILIES];
}

export function listFonts() {
  return [...MAP_FONTS];
}

export function getFontFaceCss(fontName) {
  const family = resolveFontFamily(fontName);
  if (!family) return "";
  return (FONT_FAMILY_FACES[family] ?? [])
    .map(
      ({ family: faceFamily, url, style = "normal", weight = 400 }) =>
        `@font-face {
  font-family: "${faceFamily}";
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url("${url}") format("woff2");
}`,
    )
    .join("\n");
}

function getFontStyleElement() {
  if (typeof document === "undefined") return null;
  let styleEl = document.getElementById(FONT_STYLE_EL_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = FONT_STYLE_EL_ID;
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

export async function loadFontFamily(fontName) {
  const family = resolveFontFamily(fontName);
  if (!family) return fontName;
  if (!LOADED_FONT_FAMILIES.has(family)) {
    const css = getFontFaceCss(family);
    const styleEl = getFontStyleElement();
    if (styleEl && css) styleEl.append(`${css}\n`);
    LOADED_FONT_FAMILIES.add(family);
  }
  if (family !== "Noto Sans") return family;
  // Return a CSS fallback chain covering all Noto Sans script variants.
  return (FONT_FAMILY_FACES["Noto Sans"] ?? []).map((f) => f.family).join(",");
}

export async function loadThemeFonts(theme) {
  if (!theme?.colors) return [];
  const families = new Set();
  for (const colorItem of Object.values(theme.colors)) {
    const family = resolveFontFamily(colorItem?.font);
    if (family) families.add(family);
  }
  return Promise.all([...families].map((family) => loadFontFamily(family)));
}
