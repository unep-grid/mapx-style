import chroma from "chroma-js";

/**
 * css_resolver — maps a MapX color config object to a CSS string of custom properties.
 *
 * Extracted from legacy/mapx/app/src/js/theme/mapx_style_resolver.js.
 * Font loading is intentionally excluded — consumers handle that separately.
 *
 * @param {object} c - Theme colors object (theme.colors)
 * @returns {string} CSS string with --mx_* custom properties
 */
export function css_resolver(c) {
  if (c == null || Object.keys(c).length === 0) {
    console.warn("css_resolver received empty color config");
    return "";
  }
  const family = c.mx_ui_text?.font || "system-ui";
  return `
* {
  --mx_ui_text: ${color(c.mx_ui_text)};
  --mx_ui_font_text: ${family};
  --mx_ui_text_faded: ${color(c.mx_ui_text_faded)};
  --mx_ui_hidden: ${color(c.mx_ui_hidden)};
  --mx_ui_border: ${color(c.mx_ui_border)};
  --mx_ui_background: ${color(c.mx_ui_background)};
  --mx_ui_background_faded: ${color(c.mx_ui_background_faded)};
  --mx_ui_background_contrast: ${color(c.mx_ui_background_contrast)};
  --mx_ui_background_accent: ${color(c.mx_ui_background_accent)};
  --mx_ui_background_transparent: ${color(c.mx_ui_background_transparent)};
  --mx_ui_shadow: ${color(c.mx_ui_shadow)};
  --mx_ui_link: ${color(c.mx_ui_link)};
  --mx_ui_input_accent: ${color(c.mx_ui_input_accent)};
  --mx_ui_highlighter: ${color(c.mx_ui_highlighter)};
  border-color: var(--mx_ui_border);
  color: var(--mx_ui_text);
}`;
}

function color(col) {
  if (!col) return "transparent";
  const hide = !col.visibility || col.visibility !== "visible";
  const isStringCol = typeof col === "string";
  const raw = isStringCol ? col : col.color;
  const chromaColor = chroma(raw);
  if (hide) return chromaColor.alpha(0).css();
  const alpha = isStringCol || col.alpha == null ? chromaColor.alpha() : col.alpha;
  return chromaColor.alpha(alpha).css();
}
