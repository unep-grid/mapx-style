"""
build_style.py — Upload the MapX style JSON files to S3 (versioned).

Usage:
  uv run scripts/build_style.py
  uv run scripts/build_style.py --version 2   # override style version
  uv run scripts/build_style.py --no-upload   # dry-run, print paths only

S3 output:
  style/v{N}/style.json
  style/v{N}/style_debug.json
"""

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
STYLE_DIR = REPO_ROOT / "packages/theme-core/src/style"
STYLE_FILES = [
    ("style.json",       "application/json"),
    ("style_debug.json", "application/json"),
]

sys.path.insert(0, str(REPO_ROOT / "scripts/s3"))


def main() -> None:
    from catalog import read_style_version
    from rich.console import Console
    from s3_client import make_client
    from set_acl import set_public_acl

    console = Console()

    parser = argparse.ArgumentParser(description="Upload style JSON files to S3")
    parser.add_argument("--version", type=int, default=None, metavar="N",
                        help="Style version to upload to (default: read from style_version.json)")
    parser.add_argument("--no-upload", action="store_true",
                        help="Print target S3 keys without uploading")
    args = parser.parse_args()

    version = read_style_version(args.version)
    console.print(f"Style version: [cyan]v{version}[/cyan]")

    for filename, content_type in STYLE_FILES:
        local = STYLE_DIR / filename
        s3_key = f"style/v{version}/{filename}"
        if not local.exists():
            console.print(f"[red]Not found:[/red] {local.relative_to(REPO_ROOT)}")
            sys.exit(1)
        size_kb = local.stat().st_size // 1024
        console.print(f"  [cyan]{filename}[/cyan] ({size_kb} KB) → [cyan]{s3_key}[/cyan]")

    if args.no_upload:
        console.print("[yellow]Skipping upload (--no-upload).[/yellow]")
        return

    s3_base = os.environ.get("S3_PUBLIC_BASE_URL", "").rstrip("/")
    if not s3_base:
        console.print("[red]S3_PUBLIC_BASE_URL is not set in .env[/red]")
        sys.exit(1)

    s3, bucket = make_client()
    for filename, content_type in STYLE_FILES:
        local = STYLE_DIR / filename
        s3_key = f"style/v{version}/{filename}"
        rendered = json.loads(local.read_text().replace("__S3_BASE__", s3_base))
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        ) as tmp:
            json.dump(rendered, tmp)
            tmp_path = tmp.name
        try:
            s3.upload_file(tmp_path, bucket, s3_key, ExtraArgs={"ContentType": content_type})
        finally:
            Path(tmp_path).unlink(missing_ok=True)
        set_public_acl(s3_key)
        console.print(f"[green]Uploaded:[/green] {s3_key}")

    console.print(f"[green]Done.[/green] Style v{version} uploaded.")


if __name__ == "__main__":
    main()
