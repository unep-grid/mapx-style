"""
build_sprites.py — Build two sprite sheets (SDF icons + non-SDF patterns),
                   generate sprite-index.json, and optionally upload to S3.

Usage:
  uv run scripts/build_sprites.py
  uv run scripts/build_sprites.py --no-upload
  uv run scripts/build_sprites.py --version 2   # override style version

Reads SVGs from:
  packages/theme-core/assets/sprites/maki/       (SDF icons)
  packages/theme-core/assets/sprites/geology/    (SDF icons)
  packages/theme-core/assets/sprites/patterns/   (non-SDF fills — run npm run build:patterns first)

Local output (gitignored — not committed):
  packages/theme-core/assets/sprites/generated/sprite.json
  packages/theme-core/assets/sprites/generated/sprite.png
  packages/theme-core/assets/sprites/generated/sprite@2x.json
  packages/theme-core/assets/sprites/generated/sprite@2x.png
  packages/theme-core/assets/sprites/generated/sprite_patterns.json
  packages/theme-core/assets/sprites/generated/sprite_patterns.png
  packages/theme-core/assets/sprites/generated/sprite_patterns@2x.json
  packages/theme-core/assets/sprites/generated/sprite_patterns@2x.png
  packages/theme-core/assets/sprites/generated/sprite-index.json   ← combined icon catalog

S3 output (versioned):
  style/v{N}/sprites/sprite.json         (SDF icons)
  style/v{N}/sprites/sprite.png
  style/v{N}/sprites/sprite@2x.json
  style/v{N}/sprites/sprite@2x.png
  style/v{N}/sprites/sprite_patterns.json   (non-SDF patterns)
  style/v{N}/sprites/sprite_patterns.png
  style/v{N}/sprites/sprite_patterns@2x.json
  style/v{N}/sprites/sprite_patterns@2x.png
  style/v{N}/sprites/sprite-index.json

sprite-index.json — combined catalog for icon picker:
  {
    "generated": "…",
    "version": 1,
    "sprites": {
      "default":  "https://…/style/v1/sprites/sprite",
      "patterns": "https://…/style/v1/sprites/sprite_patterns"
    },
    "count": 562,
    "icons": [
      { "id": "maki-airport-11", "group": "maki", "sprite": "default",
        "x": 0, "y": 0, "w": 11, "h": 11, "sdf": true },
      { "id": "t_b_lines_01", "group": "pattern", "sprite": "patterns",
        "x": 0, "y": 0, "w": 32, "h": 32, "sdf": false },
      …
    ]
  }

  Icon picker resolves sprite base URL from index["sprites"][icon["sprite"]].
"""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
ASSETS = REPO_ROOT / "packages/theme-core/assets/sprites"

SVG_DIRS_SDF = [
    ASSETS / "maki",
    ASSETS / "geology",
]
SVG_DIRS_PATTERNS = [
    ASSETS / "patterns",
]
OUTPUT_DIR = ASSETS / "generated"
OUTPUT_BASE = OUTPUT_DIR / "sprite"
OUTPUT_PATTERNS_BASE = OUTPUT_DIR / "sprite_patterns"

_SPRITE_FILES = [
    ("sprite.json",               "application/json"),
    ("sprite.png",                "image/png"),
    ("sprite@2x.json",            "application/json"),
    ("sprite@2x.png",             "image/png"),
    ("sprite_patterns.json",      "application/json"),
    ("sprite_patterns.png",       "image/png"),
    ("sprite_patterns@2x.json",   "application/json"),
    ("sprite_patterns@2x.png",    "image/png"),
    ("sprite-index.json",         "application/json"),
]

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))

S3_BASE = "https://mapx.unepgrid.s3.unige.ch/mapx"


def _icon_meta(name: str) -> tuple[str, str]:
    """Return (group, sprite_id) for an icon name."""
    if name.startswith("maki-"):
        return "maki", "default"
    if name.startswith("geol_"):
        return "geology", "default"
    if name.startswith("t_"):
        return "pattern", "patterns"
    return "other", "default"


def _generate_index(version: int) -> Path:
    """Build combined sprite-index.json from both sprite JSON files."""
    icons = []

    # SDF icons (maki + geology)
    sdf_data = json.loads((OUTPUT_DIR / "sprite.json").read_text())
    for name, entry in sorted(sdf_data.items()):
        group, sprite_id = _icon_meta(name)
        icons.append({
            "id":     name,
            "group":  group,
            "sprite": sprite_id,
            "x":      entry["x"],
            "y":      entry["y"],
            "w":      entry["width"],
            "h":      entry["height"],
            "sdf":    True,
        })

    # Non-SDF patterns
    patterns_data = json.loads((OUTPUT_DIR / "sprite_patterns.json").read_text())
    for name, entry in sorted(patterns_data.items()):
        group, sprite_id = _icon_meta(name)
        icons.append({
            "id":     name,
            "group":  group,
            "sprite": sprite_id,
            "x":      entry["x"],
            "y":      entry["y"],
            "w":      entry["width"],
            "h":      entry["height"],
            "sdf":    False,
        })

    index = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "version":   version,
        "sprites": {
            "default":  f"{S3_BASE}/style/v{version}/sprites/sprite",
            "patterns": f"{S3_BASE}/style/v{version}/sprites/sprite_patterns",
        },
        "count": len(icons),
        "icons": icons,
    }
    out = OUTPUT_DIR / "sprite-index.json"
    out.write_text(json.dumps(index, indent=2) + "\n")
    return out


def _upload_version(version: int, console) -> None:
    from s3_client import make_client
    from set_acl import set_public_acl

    s3, bucket = make_client()
    for filename, content_type in _SPRITE_FILES:
        local = OUTPUT_DIR / filename
        s3_key = f"style/v{version}/sprites/{filename}"
        console.print(f"  [cyan]{filename}[/cyan] → [cyan]{s3_key}[/cyan]")
        s3.upload_file(str(local), bucket, s3_key, ExtraArgs={"ContentType": content_type})
        set_public_acl(s3_key)
    console.print(f"[green]Uploaded sprites to style/v{version}/sprites/[/green]")


def _spreet(cmd: list[str], console) -> None:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        console.print(f"[red]spreet failed:[/red]\n{result.stderr}")
        sys.exit(result.returncode)


def _merge_svgs(source_dirs: list[Path], tmp_path: Path, console) -> int:
    """Copy SVGs from source_dirs into tmp_path, warn on name collisions. Returns count."""
    merged = 0
    for source_dir in source_dirs:
        if not source_dir.exists():
            console.print(f"[yellow]Warning:[/yellow] {source_dir.relative_to(REPO_ROOT)} has no SVGs")
            continue
        for svg in source_dir.glob("*.svg"):
            dest = tmp_path / svg.name
            if dest.exists():
                console.print(
                    f"[yellow]Name collision:[/yellow] {svg.name} "
                    f"(from {source_dir.name}/) — skipped"
                )
                continue
            shutil.copy2(svg, dest)
            merged += 1
    return merged


def main() -> None:
    from catalog import read_style_version
    from rich.console import Console

    console = Console()

    parser = argparse.ArgumentParser(description="Build sprite sheets and upload to S3")
    parser.add_argument("--version", type=int, default=None, metavar="N",
                        help="Style version to upload to (default: read from style_version.json)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Generate sprite sheets and index only, skip S3 upload")
    args = parser.parse_args()

    version: int = 0 if args.no_upload else read_style_version(args.version)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── SDF sprite (maki + geology) ──────────────────────────────────────────────
    sdf_count = sum(len(list(d.glob("*.svg"))) for d in SVG_DIRS_SDF if d.exists())
    if sdf_count == 0:
        console.print("[red]No SDF SVGs found (maki/geology). Check packages/theme-core/assets/sprites/.[/red]")
        sys.exit(1)

    with tempfile.TemporaryDirectory(prefix="mapx_sprites_sdf_") as tmp:
        tmp_path = Path(tmp)
        merged = _merge_svgs(SVG_DIRS_SDF, tmp_path, console)
        console.print(f"SDF: merged [cyan]{merged}[/cyan] SVGs")
        console.print("Building sprite @1x (SDF)…")
        _spreet(["spreet", "--sdf", str(tmp_path), str(OUTPUT_BASE)], console)
        console.print("Building sprite @2x (SDF)…")
        _spreet(["spreet", "--sdf", "--ratio", "2", str(tmp_path), str(OUTPUT_BASE) + "@2x"], console)

    # ── Non-SDF pattern sprite ───────────────────────────────────────────────────
    pat_count = sum(len(list(d.glob("*.svg"))) for d in SVG_DIRS_PATTERNS if d.exists())
    if pat_count == 0:
        console.print("[yellow]No pattern SVGs found — run: npm run build:patterns[/yellow]")
        console.print("[yellow]Skipping pattern sprite build.[/yellow]")
        # Write empty placeholders so index generation doesn't fail
        for suffix in ("sprite_patterns.json", "sprite_patterns@2x.json"):
            (OUTPUT_DIR / suffix).write_text("{}\n")
        for suffix in ("sprite_patterns.png", "sprite_patterns@2x.png"):
            (OUTPUT_DIR / suffix).write_bytes(b"")
    else:
        with tempfile.TemporaryDirectory(prefix="mapx_sprites_patterns_") as tmp:
            tmp_path = Path(tmp)
            merged = _merge_svgs(SVG_DIRS_PATTERNS, tmp_path, console)
            console.print(f"Patterns: merged [cyan]{merged}[/cyan] SVGs")
            console.print("Building sprite_patterns @1x…")
            _spreet(["spreet", str(tmp_path), str(OUTPUT_PATTERNS_BASE)], console)
            console.print("Building sprite_patterns @2x…")
            _spreet(["spreet", "--ratio", "2", str(tmp_path), str(OUTPUT_PATTERNS_BASE) + "@2x"], console)

    # ── Combined index ───────────────────────────────────────────────────────────
    index_path = _generate_index(version)
    count = json.loads(index_path.read_text())["count"]
    console.print(f"[green]Index:[/green] {index_path.relative_to(REPO_ROOT)}  ({count} icons)")
    console.print(f"[green]Done.[/green] Output: {OUTPUT_DIR.relative_to(REPO_ROOT)}/")

    if args.no_upload:
        return

    # ── Upload step ──────────────────────────────────────────────────────────────
    _upload_version(version, console)


if __name__ == "__main__":
    main()
