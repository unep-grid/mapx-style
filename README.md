# mapx-style

Style assets for [MapX](https://mapx.org) — sprites, glyphs, fonts, MapLibre base style, and border data.

**Demo:** https://unep-grid.github.io/mapx-style/ *(live on push to main)*

---

## What's here

| Path | Content |
|---|---|
| `packages/theme-core/` | `MapxStyle` class — HCP S3 auth, PMTiles protocol, DEM/contour source wiring |
| `src/` | Vite + MapLibre demo app (prod vs debug split-screen compare) |
| `public/sprites/` | SVG icon sources (maki, geology, patterns) + generated sprite sheets |
| `public/fonts/` | Font metadata and lists (glyph PBFs on S3) |
| `public/style/` | MapLibre base style JSON + debug style (all S3 PMTiles + Matterhorn contours) |
| `data/catalog.json` | Catalog of all S3 assets |
| `data/fonts/sources.json` | Font download manifest (families, weights, stems) |
| `data/fonts/combinations.json` | Maps MapLibre font names → TTF stems for glyph build |
| `data/fonts/files/` | TTF sources — gitignored, only needed for `build_glyphs.py` (generate with `npm run convert:fonts`) |
| `data/un_countries/` | UN border metadata (data restricted — see `data/un_countries/README.md`) |
| `scripts/s3/` | Upload, catalog, ACL, range test, progress monitoring |
| `scripts/build_*.py` | Build sprites, glyphs, borders, bathymetry, basemap |

Large files (PMTiles, COG rasters, PBF glyphs) are stored on S3 — see [DEVELOPERS.md](DEVELOPERS.md) for details.

---

## Quick start

```bash
# JS (demo app — production vs debug compare view)
npm install        # also installs @fontsource/* UI web fonts
npm run dev        # http://localhost:5173

# Python scripts
uv sync
npm run convert:fonts                    # WOFF2→TTF from node_modules (no internet) — only needed for glyph build
npm run build:glyphs -- --no-upload      # validate/list glyph outputs
npm run build:sprites -- --no-upload     # validate/list sprite outputs
npm run build:style -- --no-upload       # validate/list style uploads
uv run scripts/s3/catalog.py list        # what's on S3
uv run scripts/s3/upload.py --help
```

For a full setup guide, data sources, and CI details see [DEVELOPERS.md](DEVELOPERS.md).
For AI-assisted workflows see [CLAUDE.md](CLAUDE.md).
