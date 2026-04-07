"""
build_glyphs.py — Generate PBF glyph ranges from TTF fonts and upload to S3.

Usage:
  uv run scripts/build_glyphs.py
  uv run scripts/build_glyphs.py --no-upload            # generate only, skip S3
  uv run scripts/build_glyphs.py --version 2            # override style version
  uv run scripts/build_glyphs.py --out-dir /mnt/large_volume/tmp/glyphs

Font source:    data/fonts/files/<FamilyDir>/*.ttf
Combinations:   data/fonts/combinations.json — maps each MapLibre font name
                (e.g. "Noto Sans Medium") to a list of TTF stem names.
                The first stem is the primary font; subsequent stems fill in
                missing code points (Arabic, Bengali, etc.).
                build_pbf_glyphs merges them into a single PBF set per name.

Glyph output:   <out-dir>/<MapLibre font name>/{0-255}.pbf
S3 key:         style/v{N}/glyphs/<MapLibre font name>/{0-255}.pbf

Only the combination-named dirs are uploaded; raw per-TTF dirs are skipped.

Large-disk note: if /tmp is too small, pass --out-dir to a larger volume
  (e.g. /Volumes/lacie_storage_mbp_fxi/tmp/glyphs).
"""

import argparse
import json
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DEFAULT_FONTS_DIR = REPO_ROOT / "data/fonts/files"
DEFAULT_COMBINATIONS = REPO_ROOT / "data/fonts/combinations.json"
DEFAULT_OUT_DIR = Path("/tmp/glyphs")

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))

# Thread-local S3 clients (boto3 clients are not thread-safe across threads)
_tls = threading.local()


def _get_client():
    if not hasattr(_tls, "s3"):
        from s3_client import make_client
        _tls.s3, _tls.bucket = make_client()
    return _tls.s3, _tls.bucket


def _upload_and_set_public(pbf: Path, out_dir: Path, version: int) -> str:
    from set_acl import set_public_acl

    s3, bucket = _get_client()
    relative = pbf.relative_to(out_dir)
    s3_key = f"style/v{version}/glyphs/{relative}"

    s3.upload_file(
        str(pbf),
        bucket,
        s3_key,
        ExtraArgs={"ContentType": "application/x-protobuf"},
    )
    set_public_acl(s3_key)
    return s3_key


def main() -> None:
    parser = argparse.ArgumentParser(description="Build PBF glyphs and upload to S3")
    parser.add_argument(
        "--fonts-dir", type=Path, default=DEFAULT_FONTS_DIR,
        help=f"TTF source dir (default: {DEFAULT_FONTS_DIR})"
    )
    parser.add_argument(
        "--combinations", type=Path, default=DEFAULT_COMBINATIONS,
        help=f"Font combinations JSON (default: {DEFAULT_COMBINATIONS})"
    )
    parser.add_argument(
        "--out-dir", type=Path, default=DEFAULT_OUT_DIR,
        help=f"PBF output dir (default: {DEFAULT_OUT_DIR}). Use a large volume if /tmp is small."
    )
    parser.add_argument("--version", type=int, default=None, metavar="N",
                        help="Style version to upload to (default: read from style_version.json)")
    parser.add_argument("--no-upload", action="store_true", help="Skip S3 upload")
    parser.add_argument("--workers", type=int, default=6, help="Upload concurrency (default: 6)")
    args = parser.parse_args()

    from catalog import read_style_version
    from rich.console import Console
    from rich.progress import BarColumn, MofNCompleteColumn, Progress, SpinnerColumn, TextColumn

    console = Console()

    fonts_dir: Path = args.fonts_dir
    out_dir: Path = args.out_dir
    combinations_path: Path = args.combinations
    version: int = 0 if args.no_upload else read_style_version(args.version)

    if not fonts_dir.exists():
        console.print(f"[red]Fonts dir not found:[/red] {fonts_dir}")
        sys.exit(1)

    if not combinations_path.exists():
        console.print(f"[red]Combinations file not found:[/red] {combinations_path}")
        sys.exit(1)

    raw = json.loads(combinations_path.read_text())
    combinations: dict[str, list[str]] = {k: v for k, v in raw.items() if k != "comment"}
    console.print(
        f"Loaded [cyan]{len(combinations)}[/cyan] font combinations from "
        f"{combinations_path.relative_to(REPO_ROOT)}"
    )

    family_dirs = sorted(d for d in fonts_dir.iterdir() if d.is_dir())
    ttf_count = len(list(fonts_dir.rglob("*.ttf")))
    console.print(
        f"Found [cyan]{ttf_count}[/cyan] TTF files across "
        f"[cyan]{len(family_dirs)}[/cyan] families in {fonts_dir.relative_to(REPO_ROOT)}"
    )

    # Write a temporary combinations JSON without the comment key
    # (build_pbf_glyphs expects {"FontName": ["stem1", ...]} only)
    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, dir=out_dir
    ) as tmp:
        json.dump(combinations, tmp, indent=2)
        combinations_tmp = Path(tmp.name)

    console.print(f"Generating glyphs → [cyan]{out_dir}[/cyan]")
    try:
        for family_dir in family_dirs:
            result = subprocess.run(
                [
                    "build_pbf_glyphs",
                    "--combinations", str(combinations_tmp),
                    str(family_dir),
                    str(out_dir),
                ],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                console.print(
                    f"[red]build_pbf_glyphs failed for {family_dir.name}:[/red]\n{result.stderr}"
                )
                sys.exit(result.returncode)
            console.print(f"  [cyan]{family_dir.name}[/cyan] done")
    finally:
        combinations_tmp.unlink(missing_ok=True)

    console.print("[green]Glyphs generated.[/green]")

    # Only upload combination-named dirs — skip raw per-TTF dirs
    combination_names = set(combinations.keys())
    pbf_files = [
        f for f in out_dir.rglob("*.pbf")
        if f.parent.name in combination_names
    ]
    console.print(
        f"[cyan]{len(pbf_files)}[/cyan] PBF files across "
        f"[cyan]{len(combination_names)}[/cyan] font combinations"
    )

    if args.no_upload:
        console.print(f"Skipping upload (--no-upload). Files at: {out_dir}")
        return

    console.print(f"\nUploading to [cyan]style/v{version}/glyphs/[/cyan] with [cyan]{args.workers}[/cyan] workers…")
    failures: list[tuple[Path, str]] = []

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        MofNCompleteColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(f"Uploading PBFs [v{version}]…", total=len(pbf_files))

        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = {pool.submit(_upload_and_set_public, f, out_dir, version): f for f in pbf_files}
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as exc:
                    failures.append((futures[future], str(exc)))
                progress.advance(task)

    if failures:
        console.print(f"[red]{len(failures)} upload failures:[/red]")
        for path, err in failures[:20]:
            console.print(f"  {path.name}: {err}")
        sys.exit(1)

    console.print(
        f"[green]All {len(pbf_files)} PBFs uploaded to "
        f"style/v{version}/glyphs/[/green]"
    )


if __name__ == "__main__":
    main()
