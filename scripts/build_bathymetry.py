"""
build_bathymetry.py — Download VersaTiles bathymetry, convert to PMTiles, upload to S3.

Uses `versatiles convert` to fetch and convert the remote .versatiles file to PMTiles
format locally, then uploads to S3 under the layers/ prefix.

Usage:
  uv run scripts/build_bathymetry.py
  uv run scripts/build_bathymetry.py --version 1       # bump version → layers/bathymetry__v1.pmtiles
  uv run scripts/build_bathymetry.py --no-upload        # convert only, keep file at --out path
  uv run scripts/build_bathymetry.py --out /data/bath.pmtiles  # custom output path

Source:
  https://download.versatiles.org/bathymetry-vectors.versatiles
  ~681 MB MVT, zoom 0–10, source-layer: bathymetry, property: mindepth (negative meters)

S3 output:
  layers/bathymetry__v{N}.pmtiles

These names must stay in sync with:
  - public/style/style.json  (mapx_bathymetry source + bathymetry layer)
  - packages/theme-core/src/layer_resolver.js  (bathymetry entry)
"""

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

SOURCE_URL = "https://download.versatiles.org/bathymetry-vectors.versatiles"

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))


def _s3_key(version: int) -> str:
    return f"layers/bathymetry__v{version}.pmtiles"


def convert(source_url: str, out_path: Path, console) -> None:
    """Run versatiles convert to download and convert to PMTiles."""
    cmd = ["versatiles", "convert", source_url, str(out_path)]
    console.print(f"Running: [cyan]{' '.join(cmd)}[/cyan]")
    console.print(f"  Source: {source_url}  (~681 MB)")
    result = subprocess.run(cmd, capture_output=False, text=True)
    if result.returncode != 0:
        console.print("[red]versatiles convert failed.[/red]")
        sys.exit(result.returncode)
    size_mb = out_path.stat().st_size / 1_048_576
    console.print(f"[green]PMTiles generated:[/green] {out_path}  ({size_mb:.1f} MB)")


def main() -> None:
    from rich.console import Console
    from upload import upload_file
    from range_test import test_range
    import os

    console = Console()

    parser = argparse.ArgumentParser(description="Convert VersaTiles bathymetry to PMTiles and upload to S3")
    parser.add_argument("--version", type=int, default=0, metavar="N",
                        help="S3 version suffix (default: 0 → layers/bathymetry__v0.pmtiles)")
    parser.add_argument("--out", type=Path, default=None,
                        help="Output path for the PMTiles file (default: /tmp/bathymetry__vN.pmtiles)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Convert only — skip S3 upload and keep the local file")
    args = parser.parse_args()

    s3_key = _s3_key(args.version)
    out_path: Path = args.out or Path(f"/tmp/bathymetry__v{args.version}.pmtiles")

    convert(SOURCE_URL, out_path, console)

    if args.no_upload:
        console.print(f"Skipping upload (--no-upload). File at: [cyan]{out_path}[/cyan]")
        return

    upload_file(
        local_path=out_path,
        s3_key=s3_key,
        make_public=True,
        resource_type="pmtiles",
        name=f"VersaTiles Bathymetry v{args.version}",
        description="Global ocean depth zones from GEBCO. Source-layer: bathymetry, property: mindepth (negative meters).",
    )

    endpoint = os.environ.get("UNIGE_S3_ENDPOINT", "").rstrip("/")
    bucket = os.environ.get("UNIGE_S3_BUCKET", "mapx")
    public_url = f"{endpoint}/{bucket}/{s3_key}"
    console.print("\nVerifying range access…")
    ok = test_range(public_url)
    if not ok:
        console.print("[yellow]Warning: range test failed — check HCP ACL settings.[/yellow]")

    # Clean up temp file unless a custom path was given
    if args.out is None and out_path.exists():
        out_path.unlink()
        console.print(f"Removed temp file: {out_path}")


if __name__ == "__main__":
    main()
