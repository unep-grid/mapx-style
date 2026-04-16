import libreBaskervilleRegularUrl from "../../../data/fonts/files/Libre_Baskerville/LibreBaskerville-Regular.ttf";
import notoSansRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSans-Regular.ttf";
import notoSansArabicRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSansArabic-Regular.ttf";
import notoSansArmenianRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSansArmenian-Regular.ttf";
import notoSansBengaliRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSansBengali-Regular.ttf";
import notoSansMonoRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSansMono-Regular.ttf";
import notoSansSCRegularUrl from "../../../data/fonts/files/Noto_Sans/NotoSansSC-Regular.ttf";
import robotoRegularUrl from "../../../data/fonts/files/Roboto/Roboto-Regular.ttf";
import titilliumWebRegularUrl from "../../../data/fonts/files/Titillium_Web/TitilliumWeb-Regular.ttf";
import varelaRoundRegularUrl from "../../../data/fonts/files/Varela_Round/VarelaRound-Regular.ttf";
import combinations from "../../../data/fonts/combinations.json";

const UI_FONT_FAMILIES = Object.freeze([
  "Libre Baskerville",
  "Noto Sans",
  "Noto Sans Mono",
  "Roboto",
  "Titillium Web",
  "Varela Round",
]);

const MAP_FONTS = Object.freeze(Object.keys(combinations));
const FONT_STYLE_EL_ID = "mapx-theme-font-faces";
const LOADED_FONT_FAMILIES = new Set();
const FONT_FAMILY_FACES = Object.freeze({
  "Libre Baskerville": [
    {
      family: "Libre Baskerville",
      url: libreBaskervilleRegularUrl,
    },
  ],
  "Noto Sans": [
    { family: "Noto Sans", url: notoSansRegularUrl },
    {
      family: "Noto Sans Arabic",
      url: notoSansArabicRegularUrl,
    },
    {
      family: "Noto Sans Armenian",
      url: notoSansArmenianRegularUrl,
    },
    {
      family: "Noto Sans Bengali",
      url: notoSansBengaliRegularUrl,
    },
    { family: "Noto Sans SC", url: notoSansSCRegularUrl },
  ],
  "Noto Sans Mono": [
    { family: "Noto Sans Mono", url: notoSansMonoRegularUrl },
  ],
  Roboto: [{ family: "Roboto", url: robotoRegularUrl }],
  "Titillium Web": [
    { family: "Titillium Web", url: titilliumWebRegularUrl },
  ],
  "Varela Round": [
    { family: "Varela Round", url: varelaRoundRegularUrl },
  ],
});

function resolveFontFamily(fontName) {
  if (!fontName || typeof fontName !== "string") {
    return null;
  }

  const exactFamily = UI_FONT_FAMILIES.find((family) => family === fontName);
  if (exactFamily) {
    return exactFamily;
  }

  return (
    UI_FONT_FAMILIES.find((family) => fontName.startsWith(`${family} `)) || null
  );
}

export function listFontFamilies() {
  return [...UI_FONT_FAMILIES];
}

export function listFonts() {
  return [...MAP_FONTS];
}

export function getFontFaceCss(fontName) {
  const family = resolveFontFamily(fontName);
  if (!family) {
    return "";
  }

  const faces = FONT_FAMILY_FACES[family] || [];
  return faces
    .map(
      ({ family: faceFamily, url, style = "normal", weight = 400 }) => `@font-face {
  font-family: "${faceFamily}";
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url("${url}") format("truetype");
}`,
    )
    .join("\n");
}

function getFontStyleElement() {
  if (typeof document === "undefined") {
    return null;
  }

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
  if (!family) {
    return fontName;
  }

  if (!LOADED_FONT_FAMILIES.has(family)) {
    const css = getFontFaceCss(family);
    const styleEl = getFontStyleElement();
    if (styleEl && css) {
      styleEl.append(`${css}\n`);
    }
    LOADED_FONT_FAMILIES.add(family);
  }

  if (family !== "Noto Sans") {
    return family;
  }

  return [
    "Noto Sans",
    "Noto Sans Arabic",
    "Noto Sans Armenian",
    "Noto Sans Bengali",
    "Noto Sans SC",
  ].join(",");
}

export async function loadThemeFonts(theme) {
  if (!theme?.colors) {
    return [];
  }

  const families = new Set();
  for (const colorItem of Object.values(theme.colors)) {
    const family = resolveFontFamily(colorItem?.font);
    if (family) {
      families.add(family);
    }
  }

  return Promise.all([...families].map((family) => loadFontFamily(family)));
}
