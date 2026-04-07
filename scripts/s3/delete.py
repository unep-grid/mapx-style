"""
delete.py — Delete S3 objects by exact key or by prefix (bulk).

Usage:
  uv run scripts/s3/delete.py <s3_key>             # delete a single object
  uv run scripts/s3/delete.py <prefix> --prefix    # delete all under prefix
  uv run scripts/s3/delete.py glyphs/Roboto --prefix --yes  # skip confirmation

Examples:
  uv run scripts/s3/delete.py layers/old_borders__v0.pmtiles
  uv run scripts/s3/delete.py style/prod/assets/glyphs/Noto_Sans_Arabic --prefix
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from rich.console import Console

from s3_client import make_client

console = Console()


def delete_object(s3_key: str) -> None:
    s3, bucket = make_client()
    s3.delete_object(Bucket=bucket, Key=s3_key)
    console.print(f"[green]Deleted:[/green] {s3_key}")


def delete_prefix(prefix: str, yes: bool = False) -> None:
    s3, bucket = make_client()

    paginator = s3.get_paginator("list_objects_v2")
    keys: list[str] = []
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            keys.append(obj["Key"])

    if not keys:
        console.print(f"[yellow]No objects found under prefix:[/yellow] {prefix}")
        return

    console.print(f"Found [cyan]{len(keys)}[/cyan] objects under [cyan]{prefix}[/cyan]")

    if not yes:
        confirm = input(f"Delete all {len(keys)} objects? [y/N] ").strip().lower()
        if confirm != "y":
            console.print("Aborted.")
            return

    # S3 delete_objects accepts up to 1000 keys per call
    deleted = 0
    for i in range(0, len(keys), 1000):
        batch = [{"Key": k} for k in keys[i : i + 1000]]
        resp = s3.delete_objects(Bucket=bucket, Delete={"Objects": batch})
        deleted += len(resp.get("Deleted", []))
        for err in resp.get("Errors", []):
            console.print(f"[red]Error deleting {err['Key']}:[/red] {err.get('Message')}")

    console.print(f"[green]Deleted {deleted} objects.[/green]")


def main() -> None:
    parser = argparse.ArgumentParser(description="Delete S3 objects by key or prefix")
    parser.add_argument("s3_key", help="S3 key or prefix to delete")
    parser.add_argument(
        "--prefix", action="store_true",
        help="Treat s3_key as a prefix and delete all matching objects"
    )
    parser.add_argument(
        "--yes", "-y", action="store_true",
        help="Skip confirmation prompt when deleting by prefix"
    )
    args = parser.parse_args()

    try:
        if args.prefix:
            delete_prefix(args.s3_key, yes=args.yes)
        else:
            delete_object(args.s3_key)
    except Exception as exc:
        console.print(f"[red]Error:[/red] {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
