# CLAUDE.md — mapx-style

AI entrypoint for this repository. Quick reference for commands, naming rules, and guardrails.
For the full developer guide (HCP setup, data sources, CI/CD) see [DEVELOPERS.md](DEVELOPERS.md).

---

## Session start

1. Run `npx varlock run -- uv run scripts/s3/get_catalog.py` to see what assets already exist in S3.
2. Credentials (`S3_USER`, `S3_KEY`, `PROTOMAPS_KEY`) are fetched automatically via `exec(pass://...)` in `.env.schema` — no `.env` file needed for credentials.
   If `VITE_MAPX_ASSET_BASE_URL` needs a custom value, create a `.env` file at repo root with just that variable.

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
| `scripts/s3/get_catalog.py` | Live S3 inventory generator; S3 is the catalog |
| `data/fonts/sources.json` | Font download manifest — which families/weights to fetch from Google Fonts |
| `data/fonts/combinations.json` | Font combinations — maps MapLibre font names → TTF stems; used by `build_glyphs.py` |
| `data/fonts/files/` | Font TTF sources — **gitignored**, populate with `uv run scripts/download_fonts.py` |
| `data/un_countries/` | UN border GeoJSONs (restricted — not committed, see §Guardrails) |
| `scripts/s3/` | S3 upload, inventory, ACL, range test, progress monitoring |
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
npm run build:glyphs
npm run build:sprites
npm run build:style
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
| Sprite SVG sources | `style/v{N}/svg/` | Uploaded source SVGs for sprite inspection |
| Layers (PMTiles/COG) | `layers/` | `{layer-name}__v{N}.pmtiles` |
| Masks | `masks/` | `{mask-name}__v{N}.geojson` |
| User data | `data/{context}/{user_id}/` | |

`maps/` is not used by the current style. It may appear in the live inventory, but
new assets should use the namespaces above.

To release a new style version, bump `style_version.json` then re-run all three style build scripts.

---

## Scripts — quick reference

Scripts that write to S3 need env vars. Use `npm run` for build scripts (varlock is wired in); prefix direct `uv run` calls with `npx varlock run --`.

### Build pipeline

```bash
npm run build:patterns              # generate pattern SVGs → packages/theme-core/assets/sprites/patterns/ (gitignored)
npm run convert:fonts               # WOFF2 → TTF from node_modules/@fontsource/* → data/fonts/files/ (gitignored, no internet needed)
npm run build:sprites               # SVGs → sprite sheets + sprite-index.json → upload to S3
npm run build:glyphs                # TTFs → PBF glyphs → upload to S3 (run convert:fonts first)
npm run build:style                 # upload style.json + style_debug.json to S3 (style/v{N}/)
npx varlock run -- uv run scripts/build_borders.py      # UN GeoJSONs → PMTiles → upload to S3 (layers/)
npx varlock run -- uv run scripts/build_mask.py         # UN mask GeoJSON → upload to S3 (masks/) for within() filter
npx varlock run -- uv run scripts/build_bathymetry.py   # VersaTiles bathymetry → PMTiles → upload to S3 (layers/)
npx varlock run -- uv run scripts/build_basemap.py      # stream Protomaps basemap (~134 GB) → S3, resumable
```

Pass `--version N` to override style version, `--no-upload` to skip S3.

### S3 / asset management

```bash
npx varlock run -- uv run scripts/s3/upload.py <file> [s3_key] [--public]
npx varlock run -- uv run scripts/s3/stream_upload.py <url> [s3_key] [--public] [--chunk-mb N]
npx varlock run -- uv run scripts/s3/get_catalog.py [--prefix <prefix>] [--limit N|--all] [--format table|json]
uv run scripts/s3/stream_upload_progress.py [--watch 5]
npx varlock run -- uv run scripts/s3/set_acl.py <s3_key> --public
npx varlock run -- uv run scripts/s3/set_acl.py <s3_key> --verify
npx varlock run -- uv run scripts/s3/range_test.py <public_url>
```

Before uploading, check the live inventory with `get_catalog.py` to avoid duplicate
keys. The default table output is a bounded head/tail summary; use `--all` for a
full human listing or `--format json` for a complete machine-readable inventory.
After uploading a PMTiles or COG, always verify with `range_test.py`. Do not
maintain committed catalog snapshots; document source provenance in dataset READMEs
or build-script comments.

See [DEVELOPERS.md](DEVELOPERS.md) for HCP setup, resumable uploads, CORS, and credential encoding details.

---

## Guardrails — ask the user before acting

- S3 key / destination path is ambiguous
- Asset type cannot be inferred from the file extension
- A key already exists and would be overwritten with a different file
- The file is large (>100 MB) and would be made public
- Task involves UN border data — redistribution is restricted; confirm the user holds the rights
