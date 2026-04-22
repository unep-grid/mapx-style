# Developer Guide — mapx-style

## Overview

This repository manages all static style assets for MapX:

- **Small files** (SVGs, sprite sheets, style JSON, font metadata) — committed to git, served via GitHub Pages CDN
- **Large files** (PBF glyphs, PMTiles borders, COG rasters) — stored on S3, referenced in the catalog

The demo app (`src/`) is built with Vite + MapLibre GL JS. On every push to `main`, CI builds it, takes a screenshot, runs regression checks, and deploys to GitHub Pages.

---

## Repository structure

```
mapx-style/
├── src/                        Vite demo app (MapLibre + layer inspector)
├── public/                     Static assets committed to git
│   ├── sprites/
│   │   ├── maki/               SVG sources — Maki icon set
│   │   ├── geology/            SVG sources — geology icons
│   │   ├── patterns/           SVG sources — fill patterns
│   │   └── generated/          Built sprite sheets (PNG + JSON) — output of build_sprites.py
│   ├── fonts/                  Font list and metadata JSON
│   └── style/                  MapLibre base style JSON
├── borders/                    UN border documentation and metadata (data not distributed)
├── scripts/                     Operational scripts
│   ├── s3/                     S3 upload, catalog, ACL management
│   └── ...                     Sprite building, glyph generation, style updates
├── dist/                       Vite build output — gitignored, deployed to gh-pages by CI
├── pyproject.toml              Python environment (uv) — shared by all scripts
├── package.json                Node environment (npm/vite)
└── .github/workflows/ci.yml   Build + screenshot + regression + deploy
```

---

## Environments

### Python scripts

```bash
uv sync                         # install deps into .venv/
uv run scripts/s3/upload.py ...  # run any script
```

Requires a `.env` file at the repo root (copy from `.env.demo`):

```
S3_ENDPOINT=https://<your-hcp-host>/
S3_USER=<your HCP username>
S3_KEY=<your HCP password>
S3_BUCKET=mapx
S3_PUBLIC_BASE_URL=https://<your-hcp-host>/mapx
VITE_MAPX_ASSET_BASE_URL=https://<your-hcp-host>/mapx
```

### JavaScript (demo app)

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # output to dist/
npm run preview   # preview dist/ locally
```

---

## S3 storage

Large assets are stored on a **Hitachi Content Platform (HCP)** S3-compatible store.

| | |
|---|---|
| Endpoint | `S3_ENDPOINT` in `.env` |
| Bucket | `S3_BUCKET` in `.env` (default: `mapx`) |
| Public URL base | `S3_PUBLIC_BASE_URL` in `.env` |

`data/catalog.json` is the single source of truth for all uploaded assets and style
data provenance. Every upload via `upload.py` upserts an entry into this file.

### S3 scripts

Run from the repo root with `uv run`:

| Command | Purpose |
|---|---|
| `uv run scripts/s3/upload.py <file> [key] [--public]` | Upload local file + ACL + catalog |
| `uv run scripts/s3/stream_upload.py <url> [key] [--public] [--chunk-mb N]` | Stream remote URL → S3 (chunked, resumable) |
| `uv run scripts/s3/stream_upload_progress.py [--watch N]` | Monitor a running stream upload |
| `uv run scripts/s3/list_objects.py [--prefix <p>]` | List objects in bucket |
| `uv run scripts/s3/set_acl.py <key> --public` | Make existing object public |
| `uv run scripts/s3/set_acl.py <key> --verify` | Check if public ACL is set |
| `uv run scripts/s3/range_test.py <url>` | Verify HTTP 206 (PMTiles/COG) |
| `uv run scripts/s3/catalog.py list` | Print catalog table |
| `uv run scripts/s3/catalog.py show <id>` | Print one catalog entry |
| `uv run scripts/s3/catalog.py remove <id>` | Remove catalog entry |

### Build pipeline

| Command | Purpose |
|---|---|
| `npm run build:patterns` | Generate pattern SVGs → `public/sprites/patterns/` |
| `uv run scripts/build_sprites.py` | SVGs → sprite sheets → upload to S3 |
| `npm run convert:fonts` | Convert `@fontsource/*` WOFF2 → TTF → `data/fonts/files/` (gitignored, no internet needed) |
| `uv run scripts/build_glyphs.py` | TTFs → PBF glyphs → upload to S3 (run `convert:fonts` first) |
| `uv run scripts/build_borders.py` | UN GeoJSONs → PMTiles → upload to S3 |
| `uv run scripts/build_basemap.py [--date YYYYMMDD] [--version N]` | Stream Protomaps basemap (~134 GB) → S3, resumable |

Pass `--no-upload` to any build script to generate locally without touching S3.

### HCP credential encoding

HCP does **not** use raw credentials for AWS Sig V4. The boto3 client encodes them:

```python
access_key = base64.b64encode(username.encode()).decode()
secret_key  = hashlib.md5(password.encode()).hexdigest()
```

Bash equivalent:
```bash
ACCESS_KEY=$(echo -n "$S3_USER" | base64)
SECRET_KEY=$(echo -n "$S3_KEY"  | md5sum | awk '{print $1}')
```

`scripts/s3/s3_client.py` handles this automatically. Never pass raw `.env` credentials
directly to the AWS SDK.

### Public object access

Every request to a public object must include:
```
Authorization: AWS all_users:
```

Without it, HCP silently redirects to the REST API instead of serving the object — no
error, just a wrong response. Applies to browser `fetch`, tile clients, and `curl`.

The MapLibre demo app injects this via `transformRequest`; `range_test.py` sends it on
every request. For `curl`:

```bash
curl -H "Authorization: AWS all_users:" \
     "${S3_PUBLIC_BASE_URL}/maps/world.pmtiles"
```

### ACL — making objects public

HCP ignores canned ACL strings (`public-read`). Use an explicit policy with the AllUsers
group URI — `set_acl.py` handles this. Passing `--public` to `upload.py` calls it
automatically.

### CORS

HCP returns `MalformedXML` for `PutBucketCors` — **CORS must be configured in the
HCP management UI** under namespace settings. Required exposed headers for browser
range requests (PMTiles / COG):

```
Accept-Ranges  /  Content-Range  /  Content-Length  /  Content-Type  /  ETag  /  Last-Modified
```

If `range_test.py` confirms HTTP 206 from `curl` but browser requests still fail, the
CORS headers are missing from the namespace config.

---

## Data sources

### Distributable

| Asset | Source | Status |
|---|---|---|
| Maki icons | [mapbox/maki](https://github.com/mapbox/maki) | Apache 2.0 — committed to `public/sprites/maki/` |
| Geology icons | MapX custom | Committed to `public/sprites/geology/` |
| Fill patterns | MapX custom | Committed to `public/sprites/patterns/` |
| UI web fonts (WOFF2) | `@fontsource/*` npm packages | `devDependencies` in root — installed by `npm install`, bundled by Vite into `dist/` |
| MapLibre glyph fonts (PBF) | Google Fonts TTFs → `build_glyphs.py` | TTF sources fetched by `download_fonts.py` (gitignored); PBF output on S3 |

#### Font architecture

Two separate font pipelines serve different purposes:

| Pipeline | Format | Source | Loaded by |
|---|---|---|---|
| UI web fonts | WOFF2 | `@fontsource/*` npm packages | `theme_fonts.js` — injected lazily when a theme is applied |
| MapLibre glyphs | PBF (range files) | Google Fonts TTF → `build_glyphs.py` → S3 | MapLibre `transformRequest` (S3 auth header injected automatically) |

`@font-face` CSS cannot inject custom HTTP headers, so UI fonts cannot be served from HCP S3.
Using fontsource npm packages keeps them self-hosted in the Vite build — no external CDN dependency at runtime.

External consumers of `@unep-grid/mapx-style` should install the peer dependencies listed in `packages/theme-core/package.json`.

### Restricted — not distributed

| Asset | Source | Restriction |
|---|---|---|
| UN border PMTiles | UN Geospatial | Cannot be redistributed — see `data/un_countries/README.md` |
| UN border GeoPackage | UN Geospatial | Source file for PMTiles generation — same restriction |

Restricted datasets are referenced in the catalog with `"storage": "remote"` and documented in `data/un_countries/`. Anyone forking this repo who needs these layers must obtain the source data manually — instructions are in `data/un_countries/README.md`.

---

## CI / CD

`.github/workflows/ci.yml` runs on push to `main`:

1. `npm install && npm run build` — Vite build to `dist/`
2. Screenshot the MapLibre demo via headless browser
3. Compare screenshot against reference image for regression
4. Deploy `dist/` to `gh-pages` branch → GitHub Pages

To update the reference screenshot after an intentional style change, run `npm run test:visual:update` locally and commit the new reference.

---

## Adding a new data layer

1. If the file is large, upload it: `uv run scripts/s3/upload.py <file> --type pmtiles --public`
2. Add the layer to the MapLibre style: `uv run scripts/update_style.py add-layer --source <catalog-id>`
3. Rebuild and preview: `npm run dev`
4. Commit `public/style/style.json` and the updated `data/catalog.json`

For AI-assisted workflows see [CLAUDE.md](CLAUDE.md).
