import { version as STYLE_VERSION } from "../../../style_version.json";

const S3_BASE = "https://mapx.unepgrid.s3.unige.ch/mapx";

export function getStyleAssetBaseUrl({
  baseUrl = S3_BASE,
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
