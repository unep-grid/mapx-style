#!/usr/bin/env bash
# Basic throughput check against the S3 proxy — not a CI test, run manually to get numbers.
# Usage: ./tests/load/ab.sh [base_url]
# Default base_url is read from .env.development.local (VITE_MAPX_ASSET_BASE_URL).

set -euo pipefail

BASE_URL="${1:-}"

if [[ -z "$BASE_URL" && -f .env.development.local ]]; then
  BASE_URL=$(grep -E '^VITE_MAPX_ASSET_BASE_URL=' .env.development.local | cut -d= -f2-)
fi

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: $0 [base_url]  (or set VITE_MAPX_ASSET_BASE_URL in .env.development.local)" >&2
  exit 1
fi

BASE_URL="${BASE_URL%/}"  # strip trailing slash

N=200
C=100

run() {
  local label="$1" path="$2"; shift 2
  echo "── $label"
  ab -n $N -c $C -q "$@" "${BASE_URL}${path}" 2>&1 \
    | grep -E "Requests per second|Time per request|Failed|50%|95%|100%"
  echo
}

echo "Endpoint : $BASE_URL"
echo "Requests : $N  Concurrency : $C"
echo

run "style.json (32 KB)" "/style/v1/style.json"
run "wmo_borders PMTiles header (16 KB range)" "/layers/wmo_borders__v0.pmtiles" \
    -H "Range: bytes=0-16383"
run "mapx_borders PMTiles header (16 KB range)" "/layers/mapx_borders__v2.pmtiles" \
    -H "Range: bytes=0-16383"
