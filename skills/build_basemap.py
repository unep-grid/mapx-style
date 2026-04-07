"""
build_basemap.py — Stream the Protomaps basemap PMTiles directly to S3.

No local storage required — streams from Protomaps CDN multipart into HCP S3.
File is ~7 GB; ensure PROTOMAPS_KEY is set in .env.

Usage:
  uv run skills/build_basemap.py
  uv run skills/build_basemap.py --date 20260323   # specific Protomaps build date
  uv run skills/build_basemap.py --version 1       # bump version → layers/protomaps_basemap__v1.pmtiles
  uv run skills/build_basemap.py --no-upload       # dry-run: print URL only, skip upload

Source:
  https://build.protomaps.com/{date}.pmtiles  (requires PROTOMAPS_KEY in .env)

S3 output:
  layers/protomaps_basemap__v{N}.pmtiles
"""

import argparse
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

sys.path.insert(0, str(REPO_ROOT / "skills/s3"))

PROTOMAPS_BASE = "https://build.protomaps.com"
DEFAULT_DATE = "20260323"


def _s3_key(version: int) -> str:
    return f"layers/protomaps_basemap__v{version}.pmtiles"


def _source_url(date: str) -> str:
    return f"{PROTOMAPS_BASE}/{date}.pmtiles"


def main() -> None:
    from dotenv import load_dotenv
    from range_test import test_range
    from rich.console import Console
    from stream_upload import stream_upload

    load_dotenv(REPO_ROOT / ".env")
    console = Console()

    parser = argparse.ArgumentParser(description="Stream Protomaps basemap to S3")
    parser.add_argument("--date",    default=DEFAULT_DATE, metavar="YYYYMMDD",
                        help=f"Protomaps build date (default: {DEFAULT_DATE})")
    parser.add_argument("--version", type=int, default=0, metavar="N",
                        help="S3 version suffix (default: 0 → protomaps_basemap__v0.pmtiles)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Print source URL and S3 key only — skip upload")
    args = parser.parse_args()

    url   = _source_url(args.date)
    s3_key = _s3_key(args.version)

    console.print(f"Source : [cyan]{url}[/cyan]")
    console.print(f"S3 key : [cyan]{s3_key}[/cyan]")

    if not os.environ.get("PROTOMAPS_KEY"):
        console.print("[yellow]Warning: PROTOMAPS_KEY not set — download may return 401.[/yellow]")

    if args.no_upload:
        console.print("--no-upload set, skipping.")
        return

    stream_upload(
        url=url,
        s3_key=s3_key,
        make_public=True,
        resource_type="pmtiles",
        name=f"Protomaps Basemap {args.date} v{args.version}",
        description=f"Protomaps planet basemap build {args.date}",
    )

    endpoint = os.environ.get("UNIGE_S3_ENDPOINT", "").rstrip("/")
    bucket   = os.environ.get("UNIGE_S3_BUCKET", "mapx")
    public_url = f"{endpoint}/{bucket}/{s3_key}"
    console.print(f"\nVerifying range access…")
    ok = test_range(public_url)
    if not ok:
        console.print("[yellow]Warning: range test failed — check HCP ACL settings.[/yellow]")


if __name__ == "__main__":
    main()
