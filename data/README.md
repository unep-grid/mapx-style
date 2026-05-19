# UN Border Data

The border layers used in MapX are derived from UN Geospatial data and **cannot be redistributed** in this repository.

## What lives here

This folder contains only documentation and metadata — no actual geodata files.

- `metadata.json` — source info, processing notes, S3 keys for uploaded assets (once generated)

## How to obtain the source data

Contact the MapX team or the UNEP/GRID-Geneva GIS unit for access to the source GeoPackage files. The UN Geospatial data is subject to terms of use that restrict redistribution.

## Processing pipeline

Once you have the source GeoPackage(s):

1. Generate PMTiles from the GeoPackage using Tippecanoe or a similar tool.
2. Upload the PMTiles to S3: `uv run scripts/s3/upload.py <file>.pmtiles layers/mapx_borders__vN.pmtiles --public`
3. Add the layer to `public/style/style.json`.
4. Check the live S3 inventory: `uv run scripts/s3/get_catalog.py --prefix layers/`.

Never commit `.gpkg`, `.tif`, or `.pmtiles` files — they are gitignored.
