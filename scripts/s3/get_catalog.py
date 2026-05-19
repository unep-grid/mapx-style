"""
get_catalog.py — Generate a live inventory from the configured S3 bucket.

S3 is the source of truth. This script lists objects directly from the bucket and
renders a bounded table summary by default. JSON output returns the full
normalized inventory for scripts.

Usage:
  uv run scripts/s3/get_catalog.py
  uv run scripts/s3/get_catalog.py --prefix layers/
  uv run scripts/s3/get_catalog.py --prefix style/v1/glyphs/ --limit 50
  uv run scripts/s3/get_catalog.py --all
  uv run scripts/s3/get_catalog.py --format json
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent))

from rich.console import Console
from rich.table import Table

from s3_utils import list_s3_objects

console = Console()
DEFAULT_LIMIT = 20


def get_inventory(prefix: str = "") -> list[dict[str, Any]]:
    """Return all S3 objects under prefix."""
    return list_s3_objects(prefix)


def _iso(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value is not None else ""


def normalize_objects(objects: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert boto3 objects to a minimal stable shape."""
    rows = []
    for obj in sorted(objects, key=lambda item: item["Key"]):
        rows.append(
            {
                "key": obj["Key"],
                "etag": obj.get("ETag", "").strip('"'),
                "last_modified": _iso(obj.get("LastModified")),
                "size_bytes": obj.get("Size", 0),
            }
        )
    return rows


def _human_size(size: int) -> str:
    units = ("B", "KB", "MB", "GB", "TB")
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{size} B"


def _total_size(rows: list[dict[str, Any]]) -> int:
    return sum(row["size_bytes"] for row in rows)


def _select_rows(
    rows: list[dict[str, Any]],
    limit: int,
    show_all: bool = False,
) -> tuple[list[dict[str, Any]], bool]:
    if show_all or len(rows) <= limit:
        return rows, False
    if limit <= 0:
        return [], True

    head_count = (limit + 1) // 2
    tail_count = limit // 2
    selected = rows[:head_count]
    if tail_count:
        selected.extend(rows[-tail_count:])
    return selected, True


def print_table(rows: list[dict[str, Any]], limit: int = DEFAULT_LIMIT, show_all: bool = False) -> None:
    selected_rows, truncated = _select_rows(rows, limit, show_all)
    head_count = (limit + 1) // 2 if truncated and limit > 0 else len(selected_rows)

    if not selected_rows:
        console.print(
            "[green]Showing:[/green] "
            f"0 of {len(rows):,} objects"
            f"  |  [green]Total size:[/green] {_human_size(_total_size(rows))}"
        )
        return

    table = Table(title="S3 inventory", show_lines=False)
    table.add_column("Key", overflow="fold")
    table.add_column("Size", justify="right")
    table.add_column("LastModified")
    table.add_column("ETag", overflow="fold")

    for index, row in enumerate(selected_rows):
        if truncated and index == head_count:
            skipped = len(rows) - len(selected_rows)
            table.add_row(
                f"... {skipped:,} objects omitted ...",
                "",
                "",
                "",
                style="dim",
            )
        table.add_row(
            row["key"],
            _human_size(row["size_bytes"]),
            row["last_modified"][:19],
            row["etag"][:16],
        )

    console.print(table)
    console.print(
        "[green]Showing:[/green] "
        f"{len(selected_rows):,} of {len(rows):,} objects"
        f"  |  [green]Total size:[/green] {_human_size(_total_size(rows))}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a live S3 inventory")
    parser.add_argument("--prefix", default="", help="S3 key prefix filter")
    parser.add_argument(
        "--format",
        choices=("table", "json"),
        default="table",
        help="Output format (default: table)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"Maximum table rows to show as head/tail summary (default: {DEFAULT_LIMIT})",
    )
    parser.add_argument("--all", action="store_true", help="Show all rows in table output")
    args = parser.parse_args()

    if args.format == "json" and (args.limit != DEFAULT_LIMIT or args.all):
        parser.error("--limit and --all only apply to --format table")
    if args.limit < 0:
        parser.error("--limit must be 0 or greater")

    try:
        rows = normalize_objects(get_inventory(args.prefix))
    except Exception as exc:
        console.print(f"[red]Error:[/red] {exc}")
        sys.exit(1)

    if args.format == "json":
        console.print_json(json.dumps(rows, indent=2))
    elif not rows:
        console.print("[yellow]No objects found.[/yellow]")
    else:
        print_table(rows, limit=args.limit, show_all=args.all)


if __name__ == "__main__":
    main()
