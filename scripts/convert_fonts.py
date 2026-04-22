"""
convert_fonts.py — Convert @fontsource WOFF2 files to TTF for PBF glyph generation.

Reads data/fonts/combinations.json to know which stems are needed, finds the
matching WOFF2 in node_modules/@fontsource/{package}/files/, and converts via
fontTools. Output goes to data/fonts/files/ (flat directory, gitignored).

Replaces download_fonts.py — no internet access required; fonts come from the
@fontsource/* npm packages already installed by `npm install`.

Usage:
  uv run scripts/convert_fonts.py               # convert all stems
  uv run scripts/convert_fonts.py --migrate     # also rewrite combinations.json stems
  uv run scripts/convert_fonts.py --dry-run     # list conversions without writing
  uv run scripts/convert_fonts.py --stem NotoSans-Regular  # one stem (old or new name)
"""

import argparse
import json
import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from rich.console import Console
from rich.table import Table

REPO_ROOT = Path(__file__).parent.parent
COMBINATIONS_FILE = REPO_ROOT / "data/fonts/combinations.json"
FONTS_OUT_DIR = REPO_ROOT / "data/fonts/files"
NODE_MODULES = REPO_ROOT / "node_modules" / "@fontsource"

# Maps old-style stem prefix → (fontsource package slug, primary subset)
PREFIX_MAP = {
    "NotoSans": ("noto-sans", "latin"),
    "NotoSansArabic": ("noto-sans-arabic", "arabic"),
    "NotoSansArmenian": ("noto-sans-armenian", "armenian"),
    "NotoSansBengali": ("noto-sans-bengali", "bengali"),
    "NotoSansSC": ("noto-sans-sc", "chinese-simplified"),
    "NotoSansMono": ("noto-sans-mono", "latin"),
    "Roboto": ("roboto", "latin"),
    "TitilliumWeb": ("titillium-web", "latin"),
    "LibreBaskerville": ("libre-baskerville", "latin"),
    "VarelaRound": ("varela-round", "latin"),
}

WEIGHT_MAP = {
    "Thin": 100,
    "ExtraLight": 200,
    "Light": 300,
    "Regular": 400,
    "Medium": 500,
    "SemiBold": 600,
    "Bold": 700,
    "ExtraBold": 800,
    "Black": 900,
}


# All fontsource package slugs, longest first to avoid partial prefix matches
_PACKAGE_SLUGS = sorted(
    {v[0] for v in PREFIX_MAP.values()}, key=len, reverse=True
)


def stem_to_fontsource(old_stem: str) -> tuple[str, Path] | None:
    """
    Convert an old-style stem (e.g. 'NotoSans-Medium', 'Roboto-BoldItalic')
    to (new_stem, woff2_path). Also handles already-migrated new-style stems.
    Returns None if the stem cannot be resolved.
    """
    if "-" not in old_stem:
        return None

    # Already in fontsource format: stem starts with a known package slug
    for slug in _PACKAGE_SLUGS:
        if old_stem.startswith(f"{slug}-"):
            woff2 = NODE_MODULES / slug / "files" / f"{old_stem}.woff2"
            return old_stem, woff2

    family_part, weight_part = old_stem.split("-", 1)

    prefix_entry = PREFIX_MAP.get(family_part)
    if prefix_entry is None:
        return None

    pkg, subset = prefix_entry

    is_italic = weight_part.endswith("Italic")
    if is_italic:
        weight_name = weight_part[: -len("Italic")] or "Regular"
    else:
        weight_name = weight_part

    numeric = WEIGHT_MAP.get(weight_name)
    if numeric is None:
        return None

    style = "italic" if is_italic else "normal"
    new_stem = f"{pkg}-{subset}-{numeric}-{style}"
    woff2 = NODE_MODULES / pkg / "files" / f"{new_stem}.woff2"
    return new_stem, woff2


def collect_stems(combinations: dict) -> list[tuple[str, str, Path]]:
    """
    Return list of (old_stem, new_stem, woff2_path) for all unique stems.
    """
    seen: set[str] = set()
    result: list[tuple[str, str, Path]] = []

    for stems in combinations.values():
        if not isinstance(stems, list):
            continue
        for old_stem in stems:
            if old_stem in seen:
                continue
            seen.add(old_stem)
            mapped = stem_to_fontsource(old_stem)
            if mapped is None:
                continue
            new_stem, woff2 = mapped
            result.append((old_stem, new_stem, woff2))

    return sorted(result, key=lambda t: t[1])


def convert_woff2_to_ttf(woff2_path: Path, out_path: Path) -> None:
    font = TTFont(str(woff2_path))
    font.flavor = None  # strip WOFF2 wrapper → plain TTF/OTF
    font.save(str(out_path))


def migrate_combinations(combinations: dict, stem_map: dict[str, str]) -> dict:
    """Return a new combinations dict with all old stems replaced by new stems."""
    migrated = {}
    for key, value in combinations.items():
        if key == "comment":
            migrated[key] = value
        elif isinstance(value, list):
            migrated[key] = [stem_map.get(s, s) for s in value]
        else:
            migrated[key] = value
    return migrated


def main() -> None:
    console = Console()

    parser = argparse.ArgumentParser(
        description="Convert @fontsource WOFF2 → TTF for glyph pipeline."
    )
    parser.add_argument(
        "--migrate",
        action="store_true",
        help="Also rewrite combinations.json stems to fontsource naming",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List conversions without writing any files",
    )
    parser.add_argument(
        "--stem",
        metavar="STEM",
        help="Convert a single stem only (old or new format)",
    )
    args = parser.parse_args()

    raw = json.loads(COMBINATIONS_FILE.read_text())
    entries = collect_stems(raw)

    if args.stem:
        entries = [e for e in entries if e[0] == args.stem or e[1] == args.stem]
        if not entries:
            console.print(f"[red]Stem not found:[/red] {args.stem}")
            sys.exit(1)

    # Validate all WOFF2 paths exist before touching the filesystem
    missing = [(old, woff2) for old, _, woff2 in entries if not woff2.exists()]
    if missing:
        console.print("[red]Missing WOFF2 files (run `npm install` first):[/red]")
        for old_stem, path in missing:
            console.print(f"  {old_stem} → {path.relative_to(REPO_ROOT)}")
        sys.exit(1)

    # Report
    table = Table("Old stem", "New stem (TTF)", "WOFF2 source", show_header=True)
    for old_stem, new_stem, woff2 in entries:
        changed = "[green]→[/green]" if old_stem != new_stem else "[dim]=[/dim]"
        table.add_row(old_stem, new_stem, str(woff2.relative_to(NODE_MODULES.parent)))
    console.print(table)
    console.print(f"\n[cyan]{len(entries)}[/cyan] stems to convert → [cyan]{FONTS_OUT_DIR.relative_to(REPO_ROOT)}[/cyan]")

    if args.dry_run:
        console.print("[yellow]--dry-run: no files written.[/yellow]")
        return

    FONTS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    converted = 0
    for old_stem, new_stem, woff2 in entries:
        out_path = FONTS_OUT_DIR / f"{new_stem}.ttf"
        convert_woff2_to_ttf(woff2, out_path)
        converted += 1
        console.print(f"  [green]✓[/green] {new_stem}.ttf")

    console.print(f"\n[green]{converted} TTF files written.[/green]")

    if args.migrate:
        stem_map = {old: new for old, new, _ in entries}
        migrated = migrate_combinations(raw, stem_map)

        backup = COMBINATIONS_FILE.with_suffix(".json.bak")
        shutil.copy(COMBINATIONS_FILE, backup)
        console.print(f"Backup saved: [dim]{backup.relative_to(REPO_ROOT)}[/dim]")

        COMBINATIONS_FILE.write_text(json.dumps(migrated, indent=2) + "\n")
        console.print(f"[green]combinations.json updated.[/green]")


if __name__ == "__main__":
    main()
