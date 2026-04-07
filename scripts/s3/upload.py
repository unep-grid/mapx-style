"""
upload.py — Upload a local file to HCP S3, optionally make it public,
            and update data/catalog.json.

Usage:
  uv run scripts/s3/upload.py <local_path> [s3_key] [--type TYPE] [--public]
                             [--name NAME] [--description DESC]

Examples:
  uv run scripts/s3/upload.py ~/data/world.pmtiles maps/world.pmtiles --type pmtiles --public
  uv run scripts/s3/upload.py countries.geojson geodata/countries.geojson --public
"""

import argparse
import hashlib
import mimetypes
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from rich.console import Console
from rich.progress import BarColumn, DownloadColumn, Progress, SpinnerColumn, TextColumn

from catalog import upsert_entry
from s3_client import make_client
from set_acl import set_public_acl

console = Console()

_EXT_TYPE_MAP = {
    ".pmtiles": "pmtiles",
    ".tif":     "cog",
    ".tiff":    "cog",
    ".geojson": "geojson",
    ".json":    "geojson",
    ".mp4":     "video",
    ".webm":    "video",
    ".png":     "image",
    ".jpg":     "image",
    ".jpeg":    "image",
    ".gpkg":    "geopackage",
    ".pbf":     "glyphs",
}

_EXTRA_MIME = {
    ".pmtiles": "application/x-protomaps",
    ".geojson": "application/geo+json",
    ".pbf":     "application/x-protobuf",
}


def _make_id(s3_key: str) -> str:
    """Stable short id from the s3_key."""
    slug = Path(s3_key).stem.lower().replace(" ", "_").replace("-", "_")
    short_hash = hashlib.sha1(s3_key.encode()).hexdigest()[:6]
    return f"{slug}_{short_hash}"


def _content_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in _EXTRA_MIME:
        return _EXTRA_MIME[ext]
    mime, _ = mimetypes.guess_type(str(path))
    return mime or "application/octet-stream"


def upload_file(
    local_path: Path,
    s3_key: str,
    make_public: bool = False,
    resource_type: str | None = None,
    name: str | None = None,
    description: str = "",
) -> dict:
    """Upload local_path to s3_key. Returns the catalog entry dict."""
    s3, bucket = make_client()
    content_type = _content_type(local_path)
    file_size = local_path.stat().st_size

    console.print(
        f"Uploading [cyan]{local_path.name}[/cyan] → [cyan]{s3_key}[/cyan]"
        f"  ({file_size:,} bytes, {content_type})"
    )

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        DownloadColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Uploading…", total=file_size)

        def _callback(n: int) -> None:
            progress.update(task, advance=n)

        with local_path.open("rb") as fh:
            s3.upload_fileobj(
                fh,
                bucket,
                s3_key,
                ExtraArgs={"ContentType": content_type},
                Callback=_callback,
            )

    console.print("[green]Upload complete.[/green]")

    head = s3.head_object(Bucket=bucket, Key=s3_key)
    etag = head.get("ETag", "").strip('"')
    last_modified = head.get("LastModified", datetime.now(timezone.utc)).isoformat()

    if make_public:
        set_public_acl(s3_key)

    endpoint = os.environ.get("UNIGE_S3_ENDPOINT", "").rstrip("/")
    public_url = f"{endpoint}/{bucket}/{s3_key}" if make_public else ""

    entry = {
        "id":            _make_id(s3_key),
        "name":          name or local_path.stem,
        "type":          resource_type or _EXT_TYPE_MAP.get(local_path.suffix.lower(), "other"),
        "storage":       "s3",
        "s3_key":        s3_key,
        "public_url":    public_url,
        "etag":          etag,
        "last_modified": last_modified,
        "size_bytes":    file_size,
        "description":   description,
        "source":        "",
    }
    upsert_entry(entry)
    console.print(f"[green]Catalog updated.[/green]  id=[cyan]{entry['id']}[/cyan]")
    if public_url:
        console.print(f"URL: {public_url}")
    return entry


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload file to HCP S3 and update catalog")
    parser.add_argument("local_path",    type=Path,        help="Local file to upload")
    parser.add_argument("s3_key",        nargs="?",        help="S3 key (default: filename)")
    parser.add_argument("--type",        dest="rtype",     help="Catalog type override")
    parser.add_argument("--public",      action="store_true", help="Make object publicly readable")
    parser.add_argument("--name",        default=None,     help="Human-readable name for catalog")
    parser.add_argument("--description", default="",       help="Description for catalog")
    args = parser.parse_args()

    local_path: Path = args.local_path.expanduser().resolve()
    if not local_path.exists():
        console.print(f"[red]File not found:[/red] {local_path}")
        sys.exit(1)

    s3_key = args.s3_key or local_path.name

    upload_file(
        local_path=local_path,
        s3_key=s3_key,
        make_public=args.public,
        resource_type=args.rtype,
        name=args.name,
        description=args.description,
    )


if __name__ == "__main__":
    main()
