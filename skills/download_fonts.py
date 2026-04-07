"""
download_fonts.py — Download font TTF files from Google Fonts into data/fonts/files/.

Reads data/fonts/sources.json to know which families/weights to fetch.
For each family, downloads the Google Fonts zip and extracts the matching
static TTF files (renamed to match the {stem}-{WeightName}.ttf convention
used by data/fonts/combinations.json and build_glyphs.py).

Usage:
  uv run skills/download_fonts.py                    # download all families
  uv run skills/download_fonts.py --dir Noto_Sans    # one directory only
  uv run skills/download_fonts.py --dry-run          # list files without downloading

Google Fonts zip URL:
  https://fonts.google.com/download?family=<url-encoded-name>

The zip contains static TTF files either at the root or under a static/ subfolder.
"""

import argparse
import io
import json
import sys
import urllib.parse
import zipfile
from pathlib import Path

import requests
from rich.console import Console
from rich.table import Table

REPO_ROOT = Path(__file__).parent.parent
SOURCES_FILE = REPO_ROOT / "data/fonts/sources.json"
FONTS_DIR = REPO_ROOT / "data/fonts/files"

GOOGLE_FONTS_DL = "https://fonts.google.com/download"


def _italic_suffix(weight: str) -> str:
    """Return the italic filename suffix for a given weight name."""
    return "Italic" if weight == "Regular" else f"{weight}Italic"


def _expected_files(family: dict) -> list[str]:
    """Return the list of expected TTF filenames for a family entry."""
    stem = family["stem"]
    files = [f"{stem}-{w}.ttf" for w in family["weights"]]
    for w in family.get("italics", []):
        files.append(f"{stem}-{_italic_suffix(w)}.ttf")
    return sorted(files)


def _zip_candidates(zf: zipfile.ZipFile, filename: str) -> str | None:
    """
    Find `filename` inside the zip, checking root and static/ subfolder.
    Returns the zip entry name if found, else None.
    """
    # Exact match at root
    if filename in zf.namelist():
        return filename
    # Any path ending with /filename (covers static/ and nested dirs)
    for name in zf.namelist():
        if name.endswith(f"/{filename}"):
            return name
    return None


def download_family(family: dict, out_dir: Path, dry_run: bool, console: Console) -> tuple[int, int]:
    """Download one font family. Returns (downloaded, missing) counts."""
    google_family = family["google_family"]
    expected = _expected_files(family)
    out_dir.mkdir(parents=True, exist_ok=True)

    if dry_run:
        for f in expected:
            console.print(f"  [dim]would save:[/dim] {out_dir.relative_to(REPO_ROOT)}/{f}")
        return len(expected), 0

    url = f"{GOOGLE_FONTS_DL}?family={urllib.parse.quote(google_family)}"
    console.print(f"  Fetching [cyan]{google_family}[/cyan] …", end=" ")

    try:
        resp = requests.get(url, timeout=60, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
    except requests.RequestException as exc:
        console.print(f"[red]FAILED[/red] ({exc})")
        return 0, len(expected)

    console.print(f"[green]{len(resp.content) // 1024} KB[/green]")

    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    downloaded, missing = 0, 0

    for filename in expected:
        entry = _zip_candidates(zf, filename)
        if entry is None:
            console.print(f"    [yellow]missing in zip:[/yellow] {filename}")
            missing += 1
            continue
        dest = out_dir / filename
        dest.write_bytes(zf.read(entry))
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

    # Summary table
    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_row("Files downloaded:", f"[green]{total_dl}[/green]")
    if total_missing:
        table.add_row("Files missing in zips:", f"[yellow]{total_missing}[/yellow]")

    console.print()
    console.print(table)

    if total_missing:
        console.print(
            "[yellow]Some files were not found in the Google Fonts zips. "
            "Check that the stem/weight names in sources.json match the zip contents.[/yellow]"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
