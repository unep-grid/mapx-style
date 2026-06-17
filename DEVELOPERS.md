# Developer Guide — mapx-style

## Overview

This repository manages all static style assets for MapX:

- **Source assets** (SVGs, style JSON, font metadata) — committed to git
- **Generated and large assets** (style JSON, sprite sheets, PBF glyphs, PMTiles borders, COG rasters) — stored on S3 and listed live from the bucket

The demo app (`src/`) is built with Vite + MapLibre GL JS. On every push to `main`, CI builds it and deploys the generated root `dist/` to GitHub Pages.

---

## Repository structure

```
mapx-style/
├── src/                        Vite demo app (MapLibre + layer inspector)
├── public/                     Static files bundled into the demo app
│   └── fonts/                  Font family catalog JSON
├── packages/theme-core/        MapxStyle library (npm: @unep-grid/mapx-style)
│   ├── src/style/              MapLibre base style JSON (source of truth)
│   ├── dist/                   Library build output — gitignored, built in CI before npm publish
│   └── assets/sprites/
│       ├── maki/               SVG sources — Maki icon set
│       ├── geology/            SVG sources — geology icons
│       ├── patterns/           SVG sources — fill patterns (gitignored, generate with npm run build:patterns)
│       └── generated/          Built sprite sheets (gitignored, output of build_sprites.py)
├── data/
│   ├── fonts/                  Font manifests and TTF sources (gitignored)
│   └── un_countries/           UN border docs (data not distributed)
├── scripts/                    Operational scripts
│   ├── s3/                     S3 upload, inventory, ACL management
│   └── ...                     Sprite building, glyph generation, style updates
├── .env.schema                 Env definition (varlock) — credentials via exec(pass://...)
├── dist/                       Demo app build output — gitignored, deployed to GitHub Pages by CI
├── pyproject.toml              Python environment (uv) — shared by all scripts
├── package.json                Node environment (npm/vite)
└── .github/workflows/          Demo deploy and package publish workflows
```

---

## Environments

### Session start

Before changing uploaded assets or S3-backed style references, inspect the live
bucket inventory:

```bash
npx varlock run -- uv run scripts/s3/get_catalog.py
```

S3 is the catalog; do not rely on committed inventory snapshots.

### Python scripts

```bash
uv sync                         # install deps into .venv/
npx varlock run -- uv run scripts/s3/upload.py ...  # run any script that needs env vars
```

Credentials are defined in `.env.schema` and fetched automatically via `exec(pass://...)` when you prefix commands with `npx varlock run --`. No `.env` file required for credentials.

If you need to override `VITE_MAPX_ASSET_BASE_URL` locally, create a `.env` file at the repo root with just that variable.

### JavaScript (demo app)

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # output to dist/
npm run preview   # preview dist/ locally
```

### JavaScript (theme package)

```bash
cd packages/theme-core
npm run build:lib  # output to packages/theme-core/dist/ (gitignored)
```

The package publish workflow builds this directory before `npm publish`; do not commit generated package bundles. For standalone browser tests, use the npm CDN URL for a published version:

```html
<script type="module">
  import { MapxStyle } from "https://cdn.jsdelivr.net/npm/@unep-grid/mapx-style@latest/dist/mapx-style.esm.js";
</script>
```

MapLibre GL JS remains a peer/runtime dependency; standalone pages must load it separately. Pin a concrete package version instead of `latest` when you need reproducible test pages.

---

## Versioning

This repo has three independent version numbers. Do not conflate them.

| File | Kind | When to bump |
|---|---|---|
| `style_version.json` | S3 style path integer | Only when the on-S3 style asset layout breaks. Bumping creates a new `style/v{N}/` prefix and requires rebuilding glyphs, sprites, and style JSON. Not semver. |
| `packages/theme-core/package.json` | npm semver for `@unep-grid/mapx-style` | On normal package releases, managed via `npm run release`. |
| `package.json` | private workspace/demo app version | Normally never; it is not published. |

`npm run release` runs unit tests, bumps the theme package, updates the changelog,
commits, tags, and lets the publish workflow build and publish the package.

---

## S3 storage

Large assets are stored on a **Hitachi Content Platform (HCP)** S3-compatible store.

| | |
|---|---|
| Endpoint | `S3_ENDPOINT` in `.env.schema` |
| Bucket | `S3_BUCKET` in `.env.schema` (default: `mapx`) |
| Public URL base | `S3_PUBLIC_BASE_URL` in `.env.schema` |

S3 is the catalog. Use `get_catalog.py` to list the bucket live before uploading,
instead of maintaining a committed snapshot that can drift from the real bucket.

Current bucket namespaces:

| Namespace | Produced by | Notes |
|---|---|---|
| `style/v{N}/style.json` and `style/v{N}/style_debug.json` | `build_style.py` | Rendered style JSON with S3 base URL injected |
| `style/v{N}/glyphs/.../*.pbf` | `build_glyphs.py` | MapLibre glyph ranges |
| `style/v{N}/sprites/...` and `style/v{N}/svg/...` | `build_sprites.py` | Sprite sheets, metadata, and uploaded SVG sources |
| `layers/{name}__v{N}.pmtiles` | Basemap, borders, WMO borders, bathymetry builders | Versioned PMTiles layers |
| `masks/{name}__v{N}.geojson` | `build_mask.py` | GeoJSON masks |
| `maps/` | Not used by current style | May appear in inventory; avoid for new uploads |

### S3 scripts

Prefix all S3-writing commands with `npx varlock run --` to resolve credentials from `.env.schema`.

| Command | Purpose |
|---|---|
| `npx varlock run -- uv run scripts/s3/get_catalog.py [--prefix <p>] [--limit N\|--all] [--format table\|json]` | Generate live S3 inventory summary; JSON returns all rows |
| `npx varlock run -- uv run scripts/s3/upload.py <file> [key] [--public]` | Upload local file + ACL |
| `npx varlock run -- uv run scripts/s3/stream_upload.py <url> [key] [--public] [--chunk-mb N]` | Stream remote URL → S3 (chunked, resumable) |
| `uv run scripts/s3/stream_upload_progress.py [--watch N]` | Monitor a running stream upload |
| `npx varlock run -- uv run scripts/s3/set_acl.py <key> --public` | Make existing object public |
| `npx varlock run -- uv run scripts/s3/set_acl.py <key> --verify` | Check if public ACL is set |
| `npx varlock run -- uv run scripts/s3/range_test.py <url>` | Verify HTTP 206 (PMTiles/COG) |

### Build pipeline

`npm run` scripts have varlock wired in. For direct `uv run` calls, prefix with `npx varlock run --`.

| Command | Purpose |
|---|---|
| `npm run build:patterns` | Generate pattern SVGs → `packages/theme-core/assets/sprites/patterns/` |
| `npm run convert:fonts` | Convert `@fontsource/*` WOFF2 → TTF → `data/fonts/files/` (no internet needed) |
| `npm run build:sprites` | SVGs → sprite sheets → upload to S3 |
| `npm run build:glyphs` | TTFs → PBF glyphs → upload to S3 (run `convert:fonts` first) |
| `npm run build:style` | Upload `style.json` + `style_debug.json` → S3 |
| `npx varlock run -- uv run scripts/build_borders.py` | UN GeoJSONs → PMTiles → upload to S3 |
| `npx varlock run -- uv run scripts/build_basemap.py [--date YYYYMMDD] [--version N]` | Stream Protomaps basemap (~134 GB) → S3, resumable |

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

`scripts/s3/s3_client.py` handles this automatically. Never pass raw credentials
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
     "${S3_PUBLIC_BASE_URL}/layers/mapx_borders__v1.pmtiles"
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

Restricted datasets are documented in `data/un_countries/`. Anyone forking this repo who needs these layers must obtain the source data manually — instructions are in `data/un_countries/README.md`.

---

## CI / CD

`.github/workflows/deploy.yml` runs on push to `main`:

1. `npm ci`
2. `npm run test:unit`
3. `npm run build:lib` in `packages/theme-core`
4. `npm run build` — Vite demo build to root `dist/`
5. Upload `dist/` as the GitHub Pages artifact
6. Deploy the artifact to GitHub Pages

Visual Playwright tests are intentionally outside the default release and CI gate.
Run `npm run test:visual` when reviewing rendering changes. To update reference
screenshots after an intentional style change, run `npm run test:visual:update`
locally and commit the new references.

`.github/workflows/publish.yml` runs on version tags and manual dispatch:

1. `npm ci`
2. `npm run test:unit`
3. `npm run build:lib` in `packages/theme-core`
4. `npm publish` to the public npm registry using trusted publishing
5. Create the GitHub release

---

## Load testing (optional, not CI)

`npm run test:load` runs an `ab` throughput check against the S3 proxy — useful when
debugging proxy performance or after a proxy configuration change. Not part of the normal
test suite. Requires a running local dev proxy (see `.env.development.local`). Pass an
override URL as the first argument: `bash tests/load/ab.sh https://api.mapx.org/s3`.

---

## Adding a new data layer

1. If the file is large, upload it: `uv run scripts/s3/upload.py <file> layers/<name>__vN.pmtiles --public`
2. Check the live inventory: `uv run scripts/s3/get_catalog.py --prefix layers/`
3. Add the layer source/layers to the MapLibre style.
4. Rebuild and preview: `npm run dev`
5. Commit source/style changes only; do not commit generated S3 inventory snapshots.

## Operational guardrails

Ask before acting when:

- an S3 key or destination path is ambiguous
- an asset type cannot be inferred from the file extension
- a key already exists and would be overwritten with different content
- a large file, roughly over 100 MB, would be made public
- a task involves UN border data, because redistribution is restricted and the user must confirm rights

## Bathymetry iteration

The base bathymetry layer is generated from a local GEBCO raster, smoothed at
multiple scales, converted to vector contours/fills, and packed as PMTiles.
It is cartographic data for basemap display, not a navigation product.

```bash
uv run scripts/build_bathymetry.py \
  --input data/gebco_2026_sub_ice_topo_geotiff \
  --bbox -6,35,37,46 \
  --target-cell-degrees 0.03125 \
  --max-cells 4000000 \
  --no-upload
```

For a default rendering + upload

```bash
 npx varlock run -- uv run scripts/build_bathymetry.py \
  --input data/gebco_2026_sub_ice_topo_geotiff
```

`--input` may point at a single GeoTIFF/VRT or at an extracted GEBCO GeoTIFF
directory. Directory input is resolved with `gdalbuildvrt` into a temporary VRT
inside `--work-dir`, so the eight GEBCO regional tiles are treated as one raster.

Remove `--no-upload` only after visual inspection. During early development this
overwrites `layers/bathymetry__v0.pmtiles` so the style can be tested without
version churn. The generated PMTiles contains one `bathymetry_fill` source
layer with positive `depth_m` values.

`--target-cell-degrees` controls the working raster resolution before smoothing
and isoband extraction. The default `0.03125` keeps bbox and global runs at the
same cartographic detail. `--max-cells` is a legacy safety hint: the script may
exceed it when local RAM/disk checks show the target resolution is feasible,
rather than silently producing an unusably coarse global raster. `--land-mask`
is accepted by the CLI but is not applied in the current generator; bathymetry is
expected to be hidden below landmass in the final style.
