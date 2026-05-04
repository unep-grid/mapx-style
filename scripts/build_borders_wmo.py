"""
build_borders_wmo.py — Generate PMTiles from WMO boundary GeoJSON and upload to S3.

Runs tippecanoe to build a PMTiles file from the WMO member-state boundaries,
then uploads to S3 under the layers/ prefix.

Usage:
  uv run scripts/build_borders_wmo.py
  uv run scripts/build_borders_wmo.py --version 1       # → layers/wmo_borders__v1.pmtiles
  uv run scripts/build_borders_wmo.py --no-upload        # generate only, keep file at --out path
  uv run scripts/build_borders_wmo.py --out /data/wmo.pmtiles  # custom output path

Source file (committed — not restricted):
  data/wmo_countries/wmo_countries_polygons.geojson

S3 output:
  layers/wmo_borders__v{N}.pmtiles

Layer name ↔ GeoJSON mapping:
  wmo_borders_poly ← data/wmo_countries/wmo_countries_polygons.geojson

This name must stay in sync with:
  - packages/theme-core/src/style/style.json  (source-layer for mapx_wmo_borders source)
"""

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

LAYERS = {
    "wmo_borders_poly": "data/wmo_countries/wmo_countries_polygons.geojson",
}

TIPPECANOE_OPTS = [
    "--force",
    "-z10",
    "-B0",
    "-r0",
]

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))


def _s3_key(version: int) -> str:
    return f"layers/wmo_borders__v{version}.pmtiles"


def build(out_path: Path, console) -> None:
    missing = [p for p in LAYERS.values() if not (REPO_ROOT / p).exists()]
    if missing:
        for p in missing:
            console.print(f"[red]Missing source:[/red] {p}")
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

    parser = argparse.ArgumentParser(description="Generate WMO borders PMTiles and upload to S3")
    parser.add_argument("--version", type=int, default=0, metavar="N",
                        help="S3 version suffix (default: 0 → wmo_borders__v0.pmtiles)")
    parser.add_argument("--out", type=Path, default=None,
                        help="Output path for the PMTiles file (default: /tmp/wmo_borders__vN.pmtiles)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Generate only — skip S3 upload and keep the local file")
    args = parser.parse_args()

    s3_key = _s3_key(args.version)
    out_path: Path = args.out or Path(f"/tmp/wmo_borders__v{args.version}.pmtiles")

    build(out_path, console)

    if args.no_upload:
        console.print(f"Skipping upload (--no-upload). File at: [cyan]{out_path}[/cyan]")
        return

    upload_file(
        local_path=out_path,
        s3_key=s3_key,
        make_public=True,
        resource_type="pmtiles",
        name=f"WMO Borders PMTiles v{args.version}",
        description="WMO member-state boundaries — polygons",
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

    if args.out is None and out_path.exists():
        out_path.unlink()
        console.print(f"Removed temp file: {out_path}")


if __name__ == "__main__":
    main()
