"""
build_sprites.py — Merge SVG source dirs, build SDF sprite sheets via spreet,
                   generate sprite-index.json, and optionally upload to S3.

Usage:
  uv run skills/build_sprites.py
  uv run skills/build_sprites.py --env staging
  uv run skills/build_sprites.py --env prod staging
  uv run skills/build_sprites.py --env all
  uv run skills/build_sprites.py --no-upload

Reads SVGs from:
  public/sprites/maki/       (Step 1 — copy from legacy)
  public/sprites/geology/    (Step 1 — copy from legacy)
  public/sprites/patterns/   (Step 3 — npm run build:patterns)

Local output (commit to repo — served via GitHub Pages):
  public/sprites/generated/sprite.json
  public/sprites/generated/sprite.png
  public/sprites/generated/sprite@2x.json
  public/sprites/generated/sprite@2x.png
  public/sprites/generated/sprite-index.json   ← icon catalog for in-app icon picker

S3 output (per env):
  style/{env}/assets/sprites/sprite.json
  style/{env}/assets/sprites/sprite.png
  style/{env}/assets/sprites/sprite@2x.json
  style/{env}/assets/sprites/sprite@2x.png
  style/{env}/assets/sprites/sprite-index.json

sprite-index.json — used by the icon picker to render icons from the sprite sheet:
  {
    "generated": "…", "env": "prod",
    "sprite_base": "style/prod/assets/sprites/sprite",
    "count": 562,
    "icons": [
      { "id": "maki-airport-11", "group": "maki",
        "x": 0, "y": 0, "w": 11, "h": 11, "sdf": true },
      …
    ]
  }

  The icon picker crops individual icons via:
    background-image: url(sprite_base + ".png")
    background-position: -{x}px -{y}px
    width: {w}px; height: {h}px
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
SVG_DIRS = [
    REPO_ROOT / "public/sprites/maki",
    REPO_ROOT / "public/sprites/geology",
    REPO_ROOT / "public/sprites/patterns",
]
OUTPUT_DIR = REPO_ROOT / "public/sprites/generated"
OUTPUT_BASE = OUTPUT_DIR / "sprite"

_SPRITE_FILES = [
    ("sprite.json",       "application/json"),
    ("sprite.png",        "image/png"),
    ("sprite@2x.json",    "application/json"),
    ("sprite@2x.png",     "image/png"),
    ("sprite-index.json", "application/json"),
]

sys.path.insert(0, str(REPO_ROOT / "skills/s3"))


def _icon_group(name: str) -> str:
    if name.startswith("maki-"):
        return "maki"
    if name.startswith("geol_"):
        return "geology"
    if name.startswith("t_"):
        return "pattern"
    return "other"


def _generate_index(env: str) -> Path:
    """Build sprite-index.json from sprite.json and write it to OUTPUT_DIR.

    env determines the sprite_base URL embedded in the index so the icon
    picker knows where to fetch the sprite sheet.
    """
    data = json.loads((OUTPUT_DIR / "sprite.json").read_text())
    icons = [
        {
            "id":    name,
            "group": _icon_group(name),
            "x":     entry["x"],
            "y":     entry["y"],
            "w":     entry["width"],
            "h":     entry["height"],
            "sdf":   entry.get("sdf", False),
        }
        for name, entry in sorted(data.items())
    ]
    index = {
        "generated":   datetime.now(timezone.utc).isoformat(),
        "env":         env,
        "sprite_base": f"style/{env}/assets/sprites/sprite",
        "count":       len(icons),
        "icons":       icons,
    }
    out = OUTPUT_DIR / "sprite-index.json"
    out.write_text(json.dumps(index, indent=2) + "\n")
    return out


def _upload_env(env: str, console) -> None:
    """Upload all sprite files and the index to S3 for the given env."""
    from s3_client import make_client
    from set_acl import set_public_acl

    s3, bucket = make_client()
    for filename, content_type in _SPRITE_FILES:
        local = OUTPUT_DIR / filename
        s3_key = f"style/{env}/assets/sprites/{filename}"
        console.print(f"  [cyan]{filename}[/cyan] → [cyan]{s3_key}[/cyan]")
        s3.upload_file(str(local), bucket, s3_key, ExtraArgs={"ContentType": content_type})
        set_public_acl(s3_key)
    console.print(f"[green]Uploaded sprites for env=[cyan]{env}[/cyan][/green]")


def _spreet(cmd: list[str], console) -> None:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        console.print(f"[red]spreet failed:[/red]\n{result.stderr}")
        sys.exit(result.returncode)


def main() -> None:
    from catalog import prompt_env
    from rich.console import Console

    console = Console()

    parser = argparse.ArgumentParser(description="Build sprite sheets and upload to S3")
    parser.add_argument("--env", nargs="+", metavar="ENV",
                        help="Target S3 env(s): prod, staging, all (prompted if omitted)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Generate sprite sheets and index only, skip S3 upload")
    args = parser.parse_args()

    envs: list[str] = [] if args.no_upload else prompt_env(args.env, console)

    # ── Build step ──────────────────────────────────────────────────────────────
    total_svgs = 0
    for d in SVG_DIRS:
        count = len(list(d.glob("*.svg"))) if d.exists() else 0
        total_svgs += count
        if count == 0:
            console.print(f"[yellow]Warning:[/yellow] {d.name}/ has no SVGs")

    if total_svgs == 0:
        console.print("[red]No SVGs found. Run Steps 1–3 first (copy maki/geology + build:patterns).[/red]")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="mapx_sprites_") as tmp:
        tmp_path = Path(tmp)
        merged = 0
        for source_dir in SVG_DIRS:
            if not source_dir.exists():
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

        console.print(f"Merged [cyan]{merged}[/cyan] SVGs into temp dir")
        console.print("Building sprite @1x…")
        _spreet(["spreet", "--sdf", str(tmp_path), str(OUTPUT_BASE)], console)
        console.print("Building sprite @2x…")
        _spreet(["spreet", "--sdf", "--ratio", "2", str(tmp_path), str(OUTPUT_BASE) + "@2x"], console)

    # ── Index ───────────────────────────────────────────────────────────────────
    # Use first upload env for the local copy's sprite_base; re-generated per env on upload.
    index_env = envs[0] if envs else "prod"
    index_path = _generate_index(index_env)
    count = json.loads(index_path.read_text())["count"]
    console.print(f"[green]Index:[/green] {index_path.relative_to(REPO_ROOT)}  ({count} icons)")
    console.print(f"[green]Done.[/green] Output: {OUTPUT_DIR.relative_to(REPO_ROOT)}/")

    if args.no_upload:
        return

    # ── Upload step ─────────────────────────────────────────────────────────────
    for env in envs:
        _generate_index(env)  # regenerate with correct sprite_base for this env
        _upload_env(env, console)


if __name__ == "__main__":
    main()
