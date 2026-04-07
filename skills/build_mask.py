"""
build_mask.py — Upload the UN countries mask GeoJSON to S3.

The mask is a MultiPolygon used at runtime as a MapLibre `within` expression
to hide OSM place labels (places_locality_*) over the territories of UN member
states that have requested label suppression.

Unlike build_borders.py, no tile conversion is needed — the GeoJSON is small
(~22 KB) and MapLibre consumes it as a plain JSON object.

Usage:
  uv run skills/build_mask.py
  uv run skills/build_mask.py --version 1     # → masks/un_2020_countries_mask__v1.geojson
  uv run skills/build_mask.py --no-upload     # validate only, skip S3

Source file (not committed — restricted UN data):
  data/un_countries/un_2020_countries_mask.geojson

S3 output:
  masks/un_2020_countries_mask__v{N}.geojson

Usage in MapxStyle (theme-core):
  mxStyle.enablePlacesMask("https://mapx.unepgrid.s3.unige.ch/mapx/masks/un_2020_countries_mask__v0.geojson")
  mxStyle.disablePlacesMask()
"""

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

SOURCE = REPO_ROOT / "data/un_countries/un_2020_countries_mask.geojson"

sys.path.insert(0, str(REPO_ROOT / "skills/s3"))


def _s3_key(version: int) -> str:
    return f"masks/un_2020_countries_mask__v{version}.geojson"


def validate(console) -> None:
    if not SOURCE.exists():
        console.print(f"[red]Missing source:[/red] {SOURCE.relative_to(REPO_ROOT)}")
        console.print(
            "Source GeoJSON is not committed. "
            "Contact the MapX/UNEP-GRID Geneva team for access."
        )
        sys.exit(1)
    size_kb = SOURCE.stat().st_size / 1024
    console.print(f"[green]Source found:[/green] {SOURCE.relative_to(REPO_ROOT)}  ({size_kb:.1f} KB)")


def main() -> None:
    from rich.console import Console
    from upload import upload_file

    console = Console()

    parser = argparse.ArgumentParser(
        description="Upload UN countries mask GeoJSON to S3"
    )
    parser.add_argument(
        "--version", type=int, default=0, metavar="N",
        help="S3 version suffix (default: 0 → masks/un_2020_countries_mask__v0.geojson)",
    )
    parser.add_argument(
        "--no-upload", action="store_true",
        help="Validate only — skip S3 upload",
    )
    args = parser.parse_args()

    validate(console)

    s3_key = _s3_key(args.version)

    if args.no_upload:
        console.print(f"Skipping upload (--no-upload). Source: [cyan]{SOURCE}[/cyan]")
        console.print(f"Would upload to: [cyan]{s3_key}[/cyan]")
        return

    upload_file(
        local_path=SOURCE,
        s3_key=s3_key,
        make_public=True,
        resource_type="geojson",
        name=f"UN Countries Mask GeoJSON v{args.version}",
        description=(
            "UN 2020 country boundaries mask (MultiPolygon). "
            "Used with MapLibre within() expression to suppress OSM place labels "
            "over territories of UN member states that requested label suppression."
        ),
    )

    import os
    endpoint = os.environ.get("UNIGE_S3_ENDPOINT", "").rstrip("/")
    bucket = os.environ.get("UNIGE_S3_BUCKET", "mapx")
    public_url = f"{endpoint}/{bucket}/{s3_key}"
    console.print(f"\n[bold]Public URL:[/bold] [cyan]{public_url}[/cyan]")
    console.print(
        "\n[dim]Usage in MapxStyle:[/dim]\n"
        f"  mxStyle.enablePlacesMask(\"{public_url}\")"
    )


if __name__ == "__main__":
    main()
