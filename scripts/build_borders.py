"""
build_borders.py — Generate PMTiles from UN country GeoJSONs and upload to S3.

Runs tippecanoe to merge the three UN boundary GeoJSON files into a single
PMTiles file, then uploads to S3 under the layers/ prefix.

Usage:
  uv run scripts/build_borders.py
  uv run scripts/build_borders.py --version 1       # bump version → layers/mapx_borders__v1.pmtiles
  uv run scripts/build_borders.py --no-upload        # generate only, keep file at --out path
  uv run scripts/build_borders.py --out /data/borders.pmtiles  # custom output path

Source files (not committed — restricted UN data):
  data/un_countries/un_2020_countries_polygons.geojson
  data/un_countries/un_2020_countries_lines.geojson
  data/un_countries/un_2020_countries_points.geojson

S3 output:
  layers/mapx_borders__v{N}.pmtiles

Layer name ↔ GeoJSON mapping (edit LAYERS below when source files or style changes):
  un_2020_borders_poly          ← un_2020_countries_polygons.geojson
  un_2020_borders_line          ← un_2020_countries_lines.geojson
  un_2020_labels_countries_point ← un_2020_countries_points.geojson

These names must stay in sync with:
  - public/style/style.json  (source-layer values for the mapx_borders source)
  - legacy/mapx/app/src/data/style/style_mapx.json  (live mapx app, Phase 1 compatibility)
"""

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

# ── Layer configuration ─────────────────────────────────────────────────────────
# Maps PMTiles layer name → source GeoJSON path (relative to repo root).
# Update this dict whenever source files or style source-layer names change.
LAYERS = {
    "un_2020_borders_poly":           "data/un_countries/un_2020_countries_polygons.geojson",
    "un_2020_borders_line":           "data/un_countries/un_2020_countries_lines.geojson",
    "un_2020_labels_countries_point": "data/un_countries/un_2020_countries_points.geojson",
}

# tippecanoe options — adjust zoom range or simplification as needed
#
# -B 0   base zoom = 0: tippecanoe keeps 100 % of features at every zoom.
#         Default is base zoom = max zoom (-z), which causes aggressive point
#         dropout at low zooms (at z5 only ~1 % of points survive with the
#         default drop rate of 2.5). Country centroids must be visible from z0.
# -r 0   drop rate = 0: never thin features regardless of tile density.
#         Safe for this dataset (~250 features total — no tile will overflow).
TIPPECANOE_OPTS = [
    "--force",
    "-z10",
    "-B0",
    "-r0",
]

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))


def _s3_key(version: int) -> str:
    return f"layers/mapx_borders__v{version}.pmtiles"


def build(out_path: Path, console) -> None:
    """Run tippecanoe to generate the PMTiles file."""
    # Validate source files
    missing = [p for p in LAYERS.values() if not (REPO_ROOT / p).exists()]
    if missing:
        for p in missing:
            console.print(f"[red]Missing source:[/red] {p}")
        console.print(
            "Source GeoJSONs are not committed. "
            "Contact the MapX/UNEP-GRID Geneva team for access."
        )
        sys.exit(1)

    cmd = ["tippecanoe", "-o", str(out_path)] + TIPPECANOE_OPTS
    for layer_name, geojson_path in LAYERS.items():
        cmd += ["-L", f"{layer_name}:{REPO_ROOT / geojson_path}"]

    console.print(f"Running tippecanoe → [cyan]{out_path}[/cyan]")
    console.print(f"  Layers: {', '.join(LAYERS.keys())}")

    result = subprocess.run(cmd, capture_output=False, text=True)
    if result.returncode != 0:
        console.print("[red]tippecanoe failed.[/red]")
        sys.exit(result.returncode)

    size_mb = out_path.stat().st_size / 1_048_576
    console.print(f"[green]PMTiles generated:[/green] {out_path}  ({size_mb:.1f} MB)")


def main() -> None:
    from rich.console import Console
    from upload import upload_file

    console = Console()

    parser = argparse.ArgumentParser(description="Generate mapx_borders PMTiles and upload to S3")
    parser.add_argument("--version", type=int, default=0, metavar="N",
                        help="S3 version suffix (default: 0 → mapx_borders__v0.pmtiles)")
    parser.add_argument("--out", type=Path, default=None,
                        help="Output path for the PMTiles file (default: /tmp/mapx_borders__vN.pmtiles)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Generate only — skip S3 upload and keep the local file")
    args = parser.parse_args()

    s3_key = _s3_key(args.version)
    out_path: Path = args.out or Path(f"/tmp/mapx_borders__v{args.version}.pmtiles")

    build(out_path, console)

    if args.no_upload:
        console.print(f"Skipping upload (--no-upload). File at: [cyan]{out_path}[/cyan]")
        return

    upload_file(
        local_path=out_path,
        s3_key=s3_key,
        make_public=True,
        resource_type="pmtiles",
        name=f"MapX Borders PMTiles v{args.version}",
        description="UN 2020 country boundaries — polygons, lines, centroids",
    )

    from range_test import test_range
    import os
    endpoint = os.environ.get("S3_ENDPOINT", "").rstrip("/")
    bucket = os.environ.get("S3_BUCKET", "mapx")
    public_url = f"{endpoint}/{bucket}/{s3_key}"
    console.print(f"\nVerifying range access…")
    ok = test_range(public_url)
    if not ok:
        console.print("[yellow]Warning: range test failed — check HCP ACL settings.[/yellow]")

    # Clean up temp file unless a custom path was given
    if args.out is None and out_path.exists():
        out_path.unlink()
        console.print(f"Removed temp file: {out_path}")


if __name__ == "__main__":
    main()
