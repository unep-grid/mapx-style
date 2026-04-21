# CLAUDE.md — mapx-style

AI entrypoint for this repository. Quick reference for commands, naming rules, and guardrails.
For the full developer guide (HCP setup, data sources, CI/CD) see [DEVELOPERS.md](DEVELOPERS.md).

---

## Session start

1. Run `uv run scripts/s3/catalog.py list` to see what assets already exist in S3.
2. If `.env` is missing at the repo root: tell the user `cp .env.demo .env` and fill in
   `S3_USER` / `S3_KEY` / `S3_ENDPOINT` / `S3_PUBLIC_BASE_URL` / `VITE_MAPX_ASSET_BASE_URL`.

---

## Repository layout

| Path | Purpose |
|---|---|
| `packages/theme-core/` | `MapxStyle` class — HCP S3 auth, PMTiles protocol, DEM/contour wiring, style builder, layer resolver, themes |
| `packages/theme-core/src/style/` | MapLibre base style JSON + debug style (source of truth — uploaded to S3 by `build_style.py`) |
| `packages/theme-core/assets/sprites/maki/` | Maki SVG icon sources (SDF sprite) |
| `packages/theme-core/assets/sprites/geology/` | Geology SVG icon sources (SDF sprite) |
| `packages/theme-core/assets/sprites/patterns/` | Pattern SVG sources (non-SDF sprite) — **gitignored**, generate with `npm run build:patterns` |
| `packages/theme-core/assets/sprites/generated/` | Generated sprite sheets — **gitignored**, built by `build_sprites.py`, uploaded to S3 |
| `public/fonts/fonts.json` | Font family catalog — GitHub Pages CDN |
| `data/catalog.json` | Single catalog for all assets (S3 uploads + style provenance) |
| `data/fonts/sources.json` | Font download manifest — which families/weights to fetch from Google Fonts |
| `data/fonts/combinations.json` | Font combinations — maps MapLibre font names → TTF stems; used by `build_glyphs.py` |
| `data/fonts/files/` | Font TTF sources — **gitignored**, populate with `uv run scripts/download_fonts.py` |
| `data/un_countries/` | UN border GeoJSONs (restricted — not committed, see §Guardrails) |
| `scripts/s3/` | S3 upload, catalog, ACL, range test, progress monitoring |
| `scripts/patterns/` | Pattern SVG generator (index.cjs + config.json) |
| `scripts/style/` | Road layer generator |
| `src/` | Vite + MapLibre demo app (production vs debug compare view) |

---

## Versioning — three independent axes

This repo has three version numbers that are **independent** of each other. Never conflate them.

| File | Kind | Current | When to bump |
|---|---|---|---|
| `style_version.json` | S3 path integer | `1` | Only when the S3 asset layout breaks — bumping creates a new `style/v{N}/` prefix and requires re-running all three build scripts. **Not semver.** |
| `packages/theme-core/package.json` | npm semver (`@unep-grid/mapx-style`) | `0.2.0` | Normal semver on every library release; managed via `npm run release`. |
| `package.json` (root) | private workspace / demo app | `0.1.0` | Never published — version is meaningless, don't bump it. |

### Releasing the npm package

```bash
npm run release
```

`release-it` will: bump `packages/theme-core/package.json`, generate CHANGELOG, build `dist/`, commit, tag `v{N}`, push. The `publish.yml` CI workflow then fires on the tag and handles publishing to GitHub Packages + creating the GitHub release (using its own `GITHUB_TOKEN` — no local token needed).

### Releasing a new S3 style version

```bash
# 1. Edit style_version.json: { "version": 2 }
uv run scripts/build_glyphs.py
uv run scripts/build_sprites.py
uv run scripts/build_style.py
```

This is separate from the npm release — do it only when the on-S3 asset layout changes.

---

## S3 — path conventions

Style version is defined in [`style_version.json`](style_version.json) at repo root.
All style assets (glyphs, sprites, style JSON) are uploaded under a single versioned prefix.

| Namespace | Prefix | Naming |
|---|---|---|
| Style JSON | `style/v{N}/` | `style/v1/style.json` |
| Glyphs | `style/v{N}/glyphs/` | `style/v1/glyphs/{fontstack}/{range}.pbf` |
| Sprites (SDF icons) | `style/v{N}/sprites/` | `style/v1/sprites/sprite.json` |
| Sprites (patterns) | `style/v{N}/sprites/` | `style/v1/sprites/sprite_patterns.json` |
| Layers (PMTiles/COG) | `layers/` | `{layer-name}__v{N}.pmtiles` |
| Masks | `masks/` | `{mask-name}__v{N}.geojson` |
| User data | `data/{context}/{user_id}/` | |

To release a new style version, bump `style_version.json` then re-run all three style build scripts.

---

## S3 — HCP key facts

- Public requests need `Authorization: AWS all_users:` header (MapLibre `transformRequest` and `range_test.py` inject it automatically)
- Canned ACL strings (`"public-read"`) are ignored — use `--public` flag or `set_acl.py`
- Public URL format: `{S3_ENDPOINT}{S3_BUCKET}/{s3_key}` — values come from `.env`
- CORS and credentials are handled in `s3_client.py` / HCP management UI — not configurable via S3 API

Full HCP details: [DEVELOPERS.md §S3 storage](DEVELOPERS.md).

---

## Scripts — quick reference

### S3 / asset management

```bash
uv run scripts/s3/upload.py <file> [s3_key] [--type TYPE] [--public] [--name NAME]
uv run scripts/s3/stream_upload.py <url> [s3_key] [--type TYPE] [--public] [--name NAME] [--chunk-mb N]
uv run scripts/s3/stream_upload_progress.py          # monitor a running stream upload
uv run scripts/s3/stream_upload_progress.py --watch 5 # refresh every 5 s
uv run scripts/s3/list_objects.py [--prefix <prefix>]
uv run scripts/s3/set_acl.py <s3_key> --public
uv run scripts/s3/set_acl.py <s3_key> --verify
uv run scripts/s3/range_test.py <public_url>
uv run scripts/s3/catalog.py list
uv run scripts/s3/catalog.py show <id>
uv run scripts/s3/catalog.py remove <id>
```

After uploading a PMTiles or COG: always verify with `range_test.py`.

### Build pipeline

```bash
npm run build:patterns              # generate pattern SVGs → packages/theme-core/assets/sprites/patterns/ (gitignored)
npm run download:fonts               # fetch TTF sources from Google Fonts → data/fonts/files/ (gitignored)
npm run build:fonts                  # verify bundled TTF sources used by theme-core
npm run build:sprites                # SVGs → sprite sheets + sprite-index.json → upload to S3
npm run build:glyphs                 # TTFs → PBF glyphs → upload to S3 (requires fonts to be downloaded first)
npm run build:style                  # upload style.json + style_debug.json to S3 (style/v{N}/)
uv run scripts/build_borders.py      # UN GeoJSONs → PMTiles → upload to S3 (layers/)
uv run scripts/build_mask.py         # UN mask GeoJSON → upload to S3 (masks/) for within() filter
uv run scripts/build_bathymetry.py   # VersaTiles bathymetry → PMTiles → upload to S3 (layers/)
uv run scripts/build_basemap.py      # stream Protomaps basemap (~134 GB) → S3, resumable
```

Style build scripts (`build_sprites`, `build_glyphs`, `build_style`) read the version from
`style_version.json` automatically. Pass `--version N` to override, `--no-upload` to skip S3.

### Large remote uploads (resumable)

`stream_upload.py` uses chunked HTTP range requests (default 100 MB/part) + S3 multipart.
State is saved to `/tmp/mapx_stream_<hash>.json` — re-run the same command to resume after failure.

```bash
# Stream a large remote file
uv run scripts/s3/stream_upload.py \
  https://build.protomaps.com/20260323.pmtiles \
  layers/protomaps_basemap__v0.pmtiles --type pmtiles --public

# Monitor progress in another terminal
uv run scripts/s3/stream_upload_progress.py --watch 10

# Build and upload Protomaps basemap (wrapper around stream_upload)
uv run scripts/build_basemap.py [--date YYYYMMDD] [--version N] [--no-upload]
```

---

## Guardrails — ask the user before acting

- S3 key / destination path is ambiguous
- Asset type cannot be inferred from the file extension
- A key already exists and would be overwritten with a different file
- The file is large (>100 MB) and would be made public
- Task involves UN border data — redistribution is restricted; confirm the user holds the rights
