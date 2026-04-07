"""
list_objects.py — List all objects in the configured HCP bucket.

Usage:
  uv run skills/s3/list_objects.py [--prefix <prefix>]
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from botocore.exceptions import ClientError
from rich.console import Console
from rich.table import Table

from s3_client import make_client

console = Console()


def list_objects(prefix: str = "") -> list[dict]:
    s3, bucket = make_client()
    paginator = s3.get_paginator("list_objects_v2")
    objects = []
    try:
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                objects.append(obj)
    except ClientError as exc:
        # HCP returns NoSuchKey instead of an empty list when the bucket has no objects
        if exc.response["Error"]["Code"] == "NoSuchKey":
            return []
        raise
    return objects


def main() -> None:
    parser = argparse.ArgumentParser(description="List S3 bucket objects")
    parser.add_argument("--prefix", default="", help="Key prefix filter")
    args = parser.parse_args()

    try:
        objects = list_objects(args.prefix)
    except Exception as exc:
        console.print(f"[red]Error:[/red] {exc}")
        sys.exit(1)

    if not objects:
        console.print("[yellow]No objects found.[/yellow]")
        return

    table = Table(title="Bucket objects", show_lines=False)
    table.add_column("Key", overflow="fold")
    table.add_column("Size", justify="right")
    table.add_column("LastModified")
    table.add_column("ETag", overflow="fold")

    for obj in objects:
        size = obj["Size"]
        if size >= 1_048_576:
            size_str = f"{size / 1_048_576:.1f} MB"
        elif size >= 1024:
            size_str = f"{size / 1024:.1f} KB"
        else:
            size_str = f"{size} B"
        table.add_row(
            obj["Key"],
            size_str,
            str(obj["LastModified"])[:19],
            obj.get("ETag", "").strip('"')[:16],
        )

    console.print(table)
    console.print(f"[green]Total:[/green] {len(objects)} objects")


if __name__ == "__main__":
    main()
