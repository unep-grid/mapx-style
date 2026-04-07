"""
stream_upload_progress.py — Show progress of a running or interrupted stream upload.

Reads the JSON state file written by stream_upload.py and prints current progress.

Usage:
  uv run skills/s3/stream_upload_progress.py                  # auto-detect state file
  uv run skills/s3/stream_upload_progress.py --watch          # refresh every 10s
  uv run skills/s3/stream_upload_progress.py --watch 30       # refresh every 30s
  uv run skills/s3/stream_upload_progress.py <state_file>     # explicit path
"""

import argparse
import hashlib
import sys
import time
from pathlib import Path

STATE_DIR = Path("/tmp")
STATE_GLOB = "mapx_stream_*.json"


def _find_state_files() -> list[Path]:
    return sorted(STATE_DIR.glob(STATE_GLOB), key=lambda p: p.stat().st_mtime, reverse=True)


def _render(path: Path) -> None:
    import json
    from rich.console import Console
    from rich.table import Table

    console = Console()

    try:
        state = json.loads(path.read_text())
    except Exception as e:
        console.print(f"[red]Cannot read state file:[/red] {e}")
        return

    total   = state.get("total_bytes", 0)
    done    = state.get("next_offset", 0)
    parts   = state.get("parts", [])
    s3_key  = state.get("s3_key", "?")
    url     = state.get("url", "?")
    chunk   = state.get("chunk_size", 100 * 1024 * 1024)

    pct         = done * 100 / total if total else 0
    gb_done     = done / 1_073_741_824
    gb_total    = total / 1_073_741_824
    gb_remain   = gb_total - gb_done
    parts_total = -(-total // chunk)  # ceiling division

    bar_width = 40
    filled    = int(bar_width * pct / 100)
    bar       = "█" * filled + "░" * (bar_width - filled)

    console.print()
    console.print(f"[bold]Stream upload progress[/bold]  [dim]{path.name}[/dim]")
    console.print(f"  Source : [cyan]{url}[/cyan]")
    console.print(f"  Target : [cyan]{s3_key}[/cyan]")
    console.print()
    console.print(f"  [{bar}] [bold]{pct:.1f}%[/bold]")
    console.print(
        f"  {gb_done:.1f} / {gb_total:.1f} GB"
        f"  ({len(parts)}/{parts_total} parts of {chunk // 1_048_576} MB)"
        f"  —  [yellow]{gb_remain:.1f} GB remaining[/yellow]"
    )
    console.print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Show stream_upload.py progress")
    parser.add_argument("state_file", nargs="?", type=Path, help="State file path (auto-detected if omitted)")
    parser.add_argument("--watch", nargs="?", const=10, type=int, metavar="SECONDS",
                        help="Refresh every N seconds (default: 10)")
    args = parser.parse_args()

    if args.state_file:
        candidates = [args.state_file]
    else:
        candidates = _find_state_files()

    if not candidates:
        from rich.console import Console
        Console().print("[yellow]No active upload state files found in /tmp.[/yellow]")
        sys.exit(0)

    path = candidates[0]

    if args.watch is not None:
        try:
            while True:
                print("\033[2J\033[H", end="")  # clear screen
                _render(path)
                time.sleep(args.watch)
        except KeyboardInterrupt:
            pass
    else:
        _render(path)


if __name__ == "__main__":
    main()
