"""
download_fonts.py — Download font TTF files from Google Fonts into data/fonts/files/.

Reads data/fonts/sources.json to know which families/weights to fetch.
Uses the Google Fonts download/list JSON API (same endpoint used by gftools) to
get per-file download URLs, then fetches only the static variants we need.

Usage:
  uv run skills/download_fonts.py                    # download all families
  uv run skills/download_fonts.py --dir Noto_Sans    # one directory only
  uv run skills/download_fonts.py --dry-run          # list files without downloading

Google Fonts manifest API:
  https://fonts.google.com/download/list?family=<url-encoded-name>
  Response prefix ")]}'\\n" must be stripped before JSON parse (XSSI protection).
  Each fileRef has {filename, url}; static variants are under "static/" subdirectory.
"""

import argparse
import json
import sys
import urllib.parse
from pathlib import Path

import requests
from rich.console import Console
from rich.table import Table

REPO_ROOT = Path(__file__).parent.parent
SOURCES_FILE = REPO_ROOT / "data/fonts/sources.json"
FONTS_DIR = REPO_ROOT / "data/fonts/files"

MANIFEST_URL = "https://fonts.google.com/download/list?family={}"


def _italic_suffix(weight_name: str) -> str:
    """Return the italic filename suffix for a given weight name."""
    return "Italic" if weight_name == "Regular" else f"{weight_name}Italic"


def _expected_files(family: dict) -> list[str]:
    """Return the list of expected TTF filenames for a family entry."""
    stem = family["stem"]
    files = [f"{stem}-{w}.ttf" for w in family["weights"]]
    for w in family.get("italics", []):
        files.append(f"{stem}-{_italic_suffix(w)}.ttf")
    return sorted(files)


def _fetch_url_map(google_family: str, console: Console) -> dict[str, str]:
    """
    Fetch the download/list manifest and return {basename: download_url}.
    Basenames are stripped of any leading directory (e.g. "static/").
    Returns empty dict on failure.
    """
    url = MANIFEST_URL.format(urllib.parse.quote(google_family))
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        console.print(f"[red]manifest fetch failed:[/red] {exc}")
        return {}
    data = json.loads(resp.text[5:])  # strip ")]}'\n" XSSI prefix
    return {
        Path(item["filename"]).name: item["url"]
        for item in data["manifest"]["fileRefs"]
    }


def download_family(
    family: dict, out_dir: Path, dry_run: bool, console: Console
) -> tuple[int, int]:
    """Download one font family. Returns (downloaded, missing) counts."""
    google_family = family["google_family"]
    expected = _expected_files(family)
    out_dir.mkdir(parents=True, exist_ok=True)

    if dry_run:
        for f in expected:
            console.print(f"  [dim]would save:[/dim] {out_dir.relative_to(REPO_ROOT)}/{f}")
        return len(expected), 0

    console.print(f"  Fetching manifest for [cyan]{google_family}[/cyan] …", end=" ")
    url_map = _fetch_url_map(google_family, console)
    if not url_map:
        return 0, len(expected)
    console.print(f"[green]{len(url_map)} files in manifest[/green]")

    downloaded, missing = 0, 0
    for filename in expected:
        src_url = url_map.get(filename)
        if src_url is None:
            console.print(f"    [yellow]not in manifest:[/yellow] {filename}")
            missing += 1
            continue
        try:
            font_resp = requests.get(src_url, timeout=60)
            font_resp.raise_for_status()
        except requests.RequestException as exc:
            console.print(f"    [red]download failed:[/red] {filename} ({exc})")
            missing += 1
            continue
        (out_dir / filename).write_bytes(font_resp.content)
        downloaded += 1

    return downloaded, missing


def main() -> None:
    console = Console()

    parser = argparse.ArgumentParser(
        description="Download font TTF files from Google Fonts into data/fonts/files/."
    )
    parser.add_argument(
        "--dir", metavar="DIR",
        help="Download only families in this directory (e.g. Noto_Sans)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="List files that would be downloaded without fetching anything",
    )
    args = parser.parse_args()

    sources = json.loads(SOURCES_FILE.read_text())

    groups = sources["fonts"]
    if args.dir:
        groups = [g for g in groups if g["dir"] == args.dir]
        if not groups:
            console.print(f"[red]No directory '{args.dir}' found in sources.json.[/red]")
            sys.exit(1)

    total_dl, total_missing = 0, 0

    for group in groups:
        out_dir = FONTS_DIR / group["dir"]
        console.print(f"\n[bold]{group['dir']}[/bold] → {out_dir.relative_to(REPO_ROOT)}")
        for family in group["families"]:
            dl, missing = download_family(family, out_dir, args.dry_run, console)
            total_dl += dl
            total_missing += missing

    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_row("Files downloaded:", f"[green]{total_dl}[/green]")
    if total_missing:
        table.add_row("Files missing:", f"[yellow]{total_missing}[/yellow]")

    console.print()
    console.print(table)

    if total_missing:
        console.print(
            "[yellow]Some files were not found in the Google Fonts manifest. "
            "Check that the stem/weight names in sources.json match the manifest.[/yellow]"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
