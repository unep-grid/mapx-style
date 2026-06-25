# UN Countries Data

This folder contains UN 2020 country boundary GeoJSON files used as source data for the `mapx_borders` PMTiles layer.

## Files

| File | Description | Style layers |
|---|---|---|
| `un_2020_countries_polygons.geojson` | Country fill polygons | `country-code` (mask) |
| `un_2020_countries_lines_wo_caspian.geojson` | Boundary lines (admin levels 1–9), excluding the Caspian Sea outline | `boundary_un_*` |
| `un_2020_countries_points.geojson` | Country centroids | `country_un_*_label_*` |

## Redistribution

These files are derived from UN Geospatial data. They are **not committed to git** in this repository due to redistribution restrictions. Contact the MapX/UNEP-GRID Geneva team for access.

## Generating PMTiles

Once you have the GeoJSON files, generate `mapx_borders.pmtiles` via tippecanoe:

```bash
tippecanoe \
  -o /tmp/mapx_borders__v2.pmtiles \
  --force \
  -z10 \
  -L "un_2020_borders_poly:data/un_countries/un_2020_countries_polygons.geojson" \
  -L "un_2020_borders_line:data/un_countries/un_2020_countries_lines_wo_caspian.geojson" \
  -L "un_2020_labels_countries_point:data/un_countries/un_2020_countries_points.geojson"

uv run scripts/s3/upload.py /tmp/mapx_borders__v2.pmtiles layers/mapx_borders__v2.pmtiles --public
uv run scripts/s3/range_test.py "${S3_PUBLIC_BASE_URL}/layers/mapx_borders__v2.pmtiles"
rm /tmp/mapx_borders__v2.pmtiles
```

Layer names match the `mapx_borders` source in `packages/theme-core/src/style/style.json`.
Use `uv run scripts/s3/get_catalog.py --prefix layers/` to inspect uploaded PMTiles.
