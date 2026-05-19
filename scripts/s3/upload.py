"""
upload.py — Upload a local file to HCP S3, optionally make it public,
            and print the resulting object metadata.

Usage:
  uv run scripts/s3/upload.py <local_path> [s3_key] [--public]

Examples:
  uv run scripts/s3/upload.py ~/data/world.pmtiles layers/world__v0.pmtiles --public
  uv run scripts/s3/upload.py countries.geojson masks/countries__v0.geojson --public
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from rich.console import Console
from rich.progress import BarColumn, DownloadColumn, Progress, SpinnerColumn, TextColumn

from s3_client import make_client
from s3_utils import content_type_for_path, metadata_from_head, print_metadata
from set_acl import set_public_acl

console = Console()


def upload_file(
    local_path: Path,
    s3_key: str,
    make_public: bool = False,
) -> dict:
    """Upload local_path to s3_key. Returns live S3 object metadata."""
    s3, bucket = make_client()
    content_type = content_type_for_path(local_path)
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
    if make_public:
        set_public_acl(s3_key)

    metadata = metadata_from_head(s3_key, head, include_url=make_public)
    print_metadata(metadata)
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload file to HCP S3")
    parser.add_argument("local_path",    type=Path,        help="Local file to upload")
    parser.add_argument("s3_key",        nargs="?",        help="S3 key (default: filename)")
    parser.add_argument("--public",      action="store_true", help="Make object publicly readable")
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
    )


if __name__ == "__main__":
    main()
