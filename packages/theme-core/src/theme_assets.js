import { version as STYLE_VERSION } from "../../../style_version.json";
import { S3_BASE as DEFAULT_S3_BASE } from "./config.js";

export function getStyleAssetBaseUrl({
  baseUrl = DEFAULT_S3_BASE,
  version = STYLE_VERSION,
} = {}) {
  return `${baseUrl}/style/v${version}`;
}

export function resolveGlyphsUrl(opt = {}) {
  return `${getStyleAssetBaseUrl(opt)}/glyphs/{fontstack}/{range}.pbf`;
}

export function resolveSpriteUrls(opt = {}) {
  const baseUrl = getStyleAssetBaseUrl(opt);
  return [
    { id: "default", url: `${baseUrl}/sprites/sprite` },
    { id: "patterns", url: `${baseUrl}/sprites/sprite_patterns` },
  ];
}

export function resolveSpriteIndexUrl(opt = {}) {
  return `${getStyleAssetBaseUrl(opt)}/sprites/sprite-index.json`;
}

export function resolveSvgUrl(id, { params, ...opt } = {}) {
  if (!id || typeof id !== "string") {
    return;
  }
  const url = new URL(`${getStyleAssetBaseUrl(opt)}/svg/${id}.svg`);
  if (params) {
    for (const key in params) {
      if (params[key] != null) {
        url.searchParams.set(key, params[key]);
      }
    }
  }
  return url.toString();
}
