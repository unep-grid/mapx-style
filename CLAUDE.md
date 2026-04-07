# CLAUDE.md — mapx-style

AI entrypoint for this repository. Quick reference for commands, naming rules, and guardrails.
For the full developer guide (HCP setup, data sources, CI/CD) see [DEVELOPERS.md](DEVELOPERS.md).

---

## Session start

1. Run `uv run skills/s3/catalog.py list` to see what assets already exist in S3.
2. If `.env` is missing at the repo root: tell the user `cp .env.demo .env` and fill in
   `UNIGE_S3_USER` / `UNIGE_S3_KEY`.

---

## Repository layout

| Path | Purpose |
|---|---|
| `packages/theme-core/` | `MapxStyle` class — HCP S3 auth, PMTiles protocol, DEM/contour wiring, style builder, layer resolver, themes |
| `public/sprites/` | SVG sources (maki, geology, patterns) + generated sprite sheets — GitHub Pages CDN |
| `public/style/` | MapLibre base style JSON + all-PMTiles debug style — GitHub Pages CDN |
| `public/fonts/fonts.json` | Font family catalog — GitHub Pages CDN |
| `data/catalog.json` | Single catalog for all assets (S3 uploads + style provenance) |
| `data/fonts/sources.json` | Font download manifest — which families/weights to fetch from Google Fonts |
| `data/fonts/combinations.json` | Font combinations — maps MapLibre font names → TTF stems; used by `build_glyphs.py` |
| `data/fonts/files/` | Font TTF sources — **gitignored**, populate with `uv run skills/download_fonts.py` |
| `data/un_countries/` | UN border GeoJSONs (restricted — not committed, see §Guardrails) |
| `skills/s3/` | S3 upload, catalog, ACL, range test, progress monitoring |
| `skills/patterns/` | Pattern SVG generator (index.cjs + config.json) |
| `skills/style/` | Road layer generator |
| `src/` | Vite + MapLibre demo app (production vs debug compare view) |

---

## S3 — path conventions

All S3 key prefixes and naming rules are defined in [`s3_structure.json`](s3_structure.json).
Upload scripts warn when a key doesn't match a known prefix.

| Namespace | Prefix | Naming |
|---|---|---|
| Layers (PMTiles/COG) | `layers/` | `{layer-name}__v{N}.pmtiles` |
| Style | `style/{env}/` | envs: `prod`, `staging` |
| User data | `data/{context}/{user_id}/` | |

---

## S3 — HCP key facts

- Public requests need `Authorization: AWS all_users:` header (MapLibre `transformRequest` and `range_test.py` inject it automatically)
- Canned ACL strings (`"public-read"`) are ignored — use `--public` flag or `set_acl.py`
- Public URL format: `https://mapx.unepgrid.s3.unige.ch/<bucket>/<s3_key>` (bucket: `mapx`)
- CORS and credentials are handled in `s3_client.py` / HCP management UI — not configurable via S3 API

Full HCP details: [DEVELOPERS.md §S3 storage](DEVELOPERS.md).

---

## Skills — quick reference

### S3 / asset management

```bash
uv run skills/s3/upload.py <file> [s3_key] [--type TYPE] [--public] [--name NAME]
uv run skills/s3/stream_upload.py <url> [s3_key] [--type TYPE] [--public] [--name NAME] [--chunk-mb N]
uv run skills/s3/stream_upload_progress.py          # monitor a running stream upload
uv run skills/s3/stream_upload_progress.py --watch 5 # refresh every 5 s
uv run skills/s3/list_objects.py [--prefix <prefix>]
uv run skills/s3/set_acl.py <s3_key> --public
uv run skills/s3/set_acl.py <s3_key> --verify
uv run skills/s3/range_test.py <public_url>
uv run skills/s3/catalog.py list
uv run skills/s3/catalog.py show <id>
uv run skills/s3/catalog.py remove <id>
```

After uploading a PMTiles or COG: always verify with `range_test.py`.

### Build pipeline

```bash
npm run build:patterns              # generate pattern SVGs → public/sprites/patterns/
uv run skills/download_fonts.py     # fetch TTF sources from Google Fonts → data/fonts/files/ (gitignored)
uv run skills/build_sprites.py      # SVGs → sprite sheets + sprite-index.json → upload to S3
uv run skills/build_glyphs.py       # TTFs → PBF glyphs → upload to S3 (requires fonts to be downloaded first)
uv run skills/build_borders.py      # UN GeoJSONs → PMTiles → upload to S3 (layers/)
uv run skills/build_mask.py         # UN mask GeoJSON → upload to S3 (masks/) for within() filter
uv run skills/build_bathymetry.py   # VersaTiles bathymetry → PMTiles → upload to S3 (layers/)
uv run skills/build_basemap.py      # stream Protomaps basemap (~134 GB) → S3, resumable
```

Build scripts prompt for env (`prod`, `staging`, `all`) if `--env` is not passed.
Pass `--no-upload` to generate locally without touching S3.

### Large remote uploads (resumable)

`stream_upload.py` uses chunked HTTP range requests (default 100 MB/part) + S3 multipart.
State is saved to `/tmp/mapx_stream_<hash>.json` — re-run the same command to resume after failure.

```bash
# Stream a large remote file
uv run skills/s3/stream_upload.py \
  https://build.protomaps.com/20260323.pmtiles \
  layers/protomaps_basemap__v0.pmtiles --type pmtiles --public

# Monitor progress in another terminal
uv run skills/s3/stream_upload_progress.py --watch 10

# Build and upload Protomaps basemap (wrapper around stream_upload)
uv run skills/build_basemap.py [--date YYYYMMDD] [--version N] [--no-upload]
```

---

## Guardrails — ask the user before acting

- S3 key / destination path is ambiguous
- Asset type cannot be inferred from the file extension
- A key already exists and would be overwritten with a different file
- The file is large (>100 MB) and would be made public
- Task involves UN border data — redistribution is restricted; confirm the user holds the rights
