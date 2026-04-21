const _base = import.meta.env.VITE_MAPX_ASSET_BASE_URL ?? "";
const _url = _base ? new URL(_base) : null;

export const S3_BASE = _base;
export const S3_HOST = _url?.hostname ?? "";
export const S3_ENDPOINT = _url ? `${_url.origin}/` : "";

const _rawHeaders = import.meta.env.VITE_MAPX_ASSET_REQUEST_HEADERS ?? "{}";
export const S3_REQUEST_HEADERS = JSON.parse(_rawHeaders);
