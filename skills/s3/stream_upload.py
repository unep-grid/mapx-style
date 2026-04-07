"""
stream_upload.py — Stream a remote URL directly to HCP S3 without local storage.

For servers that advertise Accept-Ranges: bytes + Content-Length (e.g. Protomaps CDN,
Cloudflare), uses chunked HTTP range requests so each 100 MB part is independently
retryable and the upload is fully resumable if the script is interrupted.

A state file at /tmp/mapx_stream_<hash>.json records the S3 multipart upload-id and
completed parts. Re-run the same command after a failure to resume automatically.

Falls back to a single streaming request for servers without range support.

Usage:
  uv run skills/s3/stream_upload.py <url> [s3_key] [--type TYPE] [--public]
                                    [--name NAME] [--description DESC]
                                    [--chunk-mb N]  # default 100

Example:
  uv run skills/s3/stream_upload.py \\
    https://build.protomaps.com/20260323.pmtiles \\
    layers/protomaps_basemap__v0.pmtiles --type pmtiles --public

Protomaps note:
  If PROTOMAPS_KEY is set in .env, it is appended as ?key=<KEY> to any
  build.protomaps.com URL. Verify the exact param name against Protomaps docs
  if you get a 401.
"""

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urlparse, urlunparse, parse_qs

import requests
from boto3.s3.transfer import TransferConfig
from rich.console import Console
from rich.progress import (
    BarColumn,
    DownloadColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeRemainingColumn,
    TransferSpeedColumn,
)

sys.path.insert(0, str(Path(__file__).parent))

from catalog import upsert_entry, warn_key
from s3_client import make_client
from set_acl import set_public_acl

console = Console()

DEFAULT_CHUNK_MB = 100
PART_SIZE = 10 * 1024 * 1024       # streaming fallback: 10 MB parts
MAX_RETRIES = 5
RETRY_BACKOFF = [15, 30, 60, 120, 300]   # seconds between attempts

_EXT_MAP = {
    ".pmtiles": ("application/x-protomaps", "pmtiles"),
    ".tif":     ("image/tiff",               "cog"),
    ".tiff":    ("image/tiff",               "cog"),
    ".geojson": ("application/geo+json",     "geojson"),
    ".json":    ("application/json",         "geojson"),
    ".pbf":     ("application/x-protobuf",   "glyphs"),
}


# ── helpers ──────────────────────────────────────────────────────────────────

def _make_id(s3_key: str) -> str:
    slug = Path(s3_key).stem.lower().replace(" ", "_").replace("-", "_")
    short_hash = hashlib.sha1(s3_key.encode()).hexdigest()[:6]
    return f"{slug}_{short_hash}"


def _add_protomaps_key(url: str) -> str:
    key = os.environ.get("PROTOMAPS_KEY", "")
    if not key or "build.protomaps.com" not in url:
        return url
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    qs["key"] = [key]
    return urlunparse(parsed._replace(query=urlencode({k: v[0] for k, v in qs.items()})))


def _state_path(s3_key: str) -> Path:
    tag = hashlib.sha1(s3_key.encode()).hexdigest()[:12]
    return Path(f"/tmp/mapx_stream_{tag}.json")


class _ProgressReader:
    """Wraps a readable to advance a Rich progress task (streaming fallback)."""
    def __init__(self, raw, progress, task):
        self._raw = raw
        self._progress = progress
        self._task = task

    def read(self, size=-1):
        data = self._raw.read(size)
        if data:
            self._progress.update(self._task, advance=len(data))
        return data


# ── chunked upload (range-capable servers) ───────────────────────────────────

def _chunk_upload(
    url: str,
    fetch_url: str,
    s3_key: str,
    total_bytes: int,
    content_type: str,
    chunk_size: int,
    s3,
    bucket: str,
) -> None:
    """
    Download in HTTP-range chunks, upload as S3 multipart.
    Saves/loads a JSON state file so re-running resumes where it left off.
    """
    state_path = _state_path(s3_key)

    # Resume or start fresh
    if state_path.exists():
        state = json.loads(state_path.read_text())
        # Sanity-check the saved state belongs to this upload
        if state.get("s3_key") == s3_key:
            upload_id = state["upload_id"]
            parts = state["parts"]
            next_offset = state["next_offset"]
            console.print(
                f"[yellow]Resuming[/yellow] from byte [cyan]{next_offset:,}[/cyan]"
                f"  ({next_offset * 100 // total_bytes}%)"
            )
        else:
            state_path.unlink()
            state = None
    else:
        state = None

    if state is None:
        mpu = s3.create_multipart_upload(Bucket=bucket, Key=s3_key, ContentType=content_type)
        upload_id = mpu["UploadId"]
        parts = []
        next_offset = 0
        state = {
            "url": url, "s3_key": s3_key, "upload_id": upload_id,
            "total_bytes": total_bytes, "chunk_size": chunk_size,
            "parts": [], "next_offset": 0,
        }
        state_path.write_text(json.dumps(state))
        console.print(f"  Resume state: [dim]{state_path}[/dim]")

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            DownloadColumn(),
            TransferSpeedColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Uploading…", total=total_bytes, completed=next_offset)
            offset = next_offset
            part_number = len(parts) + 1

            while offset < total_bytes:
                end = min(offset + chunk_size - 1, total_bytes - 1)

                # Download chunk with retry
                chunk_data = None
                for attempt in range(MAX_RETRIES):
                    try:
                        r = requests.get(
                            fetch_url,
                            headers={"Range": f"bytes={offset}-{end}"},
                            timeout=180,
                        )
                        r.raise_for_status()
                        chunk_data = r.content
                        break
                    except Exception as exc:
                        wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                        if attempt < MAX_RETRIES - 1:
                            progress.console.print(
                                f"[yellow]Download error (attempt {attempt + 1}/{MAX_RETRIES}):"
                                f" {exc} — retry in {wait}s[/yellow]"
                            )
                            time.sleep(wait)
                        else:
                            raise

                # Upload part with retry
                for attempt in range(MAX_RETRIES):
                    try:
                        part = s3.upload_part(
                            Bucket=bucket, Key=s3_key,
                            UploadId=upload_id,
                            PartNumber=part_number,
                            Body=chunk_data,
                        )
                        parts.append({"PartNumber": part_number, "ETag": part["ETag"]})
                        break
                    except Exception as exc:
                        wait = 10 * (attempt + 1)
                        if attempt < MAX_RETRIES - 1:
                            progress.console.print(
                                f"[yellow]S3 upload error (attempt {attempt + 1}/{MAX_RETRIES}):"
                                f" {exc} — retry in {wait}s[/yellow]"
                            )
                            time.sleep(wait)
                        else:
                            raise

                offset = end + 1
                part_number += 1
                progress.update(task, completed=offset)

                # Persist state after every successful part
                state["parts"] = parts
                state["next_offset"] = offset
                state_path.write_text(json.dumps(state))

    except Exception:
        console.print(
            f"\n[red]Upload interrupted.[/red] Re-run the same command to resume.\n"
            f"  State: [cyan]{state_path}[/cyan]"
        )
        raise

    # Complete multipart upload
    s3.complete_multipart_upload(
        Bucket=bucket, Key=s3_key,
        UploadId=upload_id,
        MultipartUpload={"Parts": parts},
    )
    state_path.unlink(missing_ok=True)
    console.print("[green]Upload complete.[/green]")


# ── streaming fallback (no range support) ────────────────────────────────────

def _stream_upload(fetch_url: str, s3_key: str, content_type: str, total: int | None, s3, bucket: str) -> None:
    resp = requests.get(fetch_url, stream=True, timeout=60)
    resp.raise_for_status()
    resp.raw.decode_content = True

    transfer_cfg = TransferConfig(
        multipart_threshold=PART_SIZE,
        multipart_chunksize=PART_SIZE,
        use_threads=True,
        max_concurrency=4,
    )

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        DownloadColumn(),
        TransferSpeedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("Uploading…", total=total)
        reader = _ProgressReader(resp.raw, progress, task)
        s3.upload_fileobj(
            reader, bucket, s3_key,
            ExtraArgs={"ContentType": content_type},
            Config=transfer_cfg,
        )
    console.print("[green]Upload complete.[/green]")


# ── public API ────────────────────────────────────────────────────────────────

def stream_upload(
    url: str,
    s3_key: str,
    make_public: bool = False,
    resource_type: str | None = None,
    name: str | None = None,
    description: str = "",
    chunk_mb: int = DEFAULT_CHUNK_MB,
) -> dict:
    """Stream <url> to <s3_key> on HCP S3. Returns the catalog entry dict."""
    s3, bucket = make_client()
    endpoint = os.environ.get("UNIGE_S3_ENDPOINT", "").rstrip("/")

    ext = Path(s3_key).suffix.lower()
    content_type, default_type = _EXT_MAP.get(ext, ("application/octet-stream", "other"))
    resource_type = resource_type or default_type

    fetch_url = _add_protomaps_key(url)

    console.print(f"Source : [cyan]{url}[/cyan]")
    console.print(f"Target : [cyan]{bucket}/{s3_key}[/cyan]  ({content_type})")

    # Probe source for range support
    try:
        head = requests.head(fetch_url, timeout=30, allow_redirects=True)
        head.raise_for_status()
        total = int(head.headers["content-length"]) if "content-length" in head.headers else None
        range_ok = head.headers.get("accept-ranges", "").lower() == "bytes" and total is not None
    except Exception:
        total = None
        range_ok = False

    if total:
        console.print(f"  Size : {total:,} bytes  ({total / 1_073_741_824:.1f} GB)")
    else:
        console.print("  Size : unknown")

    chunk_size = chunk_mb * 1024 * 1024

    if range_ok:
        console.print(f"  Mode : chunked range  ({chunk_mb} MB / part, resumable)")
        _chunk_upload(url, fetch_url, s3_key, total, content_type, chunk_size, s3, bucket)
    else:
        console.print("  Mode : streaming (server has no range support — not resumable)")
        _stream_upload(fetch_url, s3_key, content_type, total, s3, bucket)

    head = s3.head_object(Bucket=bucket, Key=s3_key)
    etag = head.get("ETag", "").strip('"')
    last_modified = head.get("LastModified", datetime.now(timezone.utc)).isoformat()
    size_bytes = head.get("ContentLength", 0)

    if make_public:
        set_public_acl(s3_key)

    public_url = f"{endpoint}/{bucket}/{s3_key}" if make_public else ""

    entry = {
        "id":            _make_id(s3_key),
        "name":          name or Path(s3_key).stem,
        "type":          resource_type,
        "storage":       "s3",
        "source_url":    url,
        "s3_key":        s3_key,
        "public_url":    public_url,
        "etag":          etag,
        "last_modified": last_modified,
        "size_bytes":    size_bytes,
        "description":   description,
    }
    upsert_entry(entry)
    console.print(f"[green]Catalog updated.[/green]  id=[cyan]{entry['id']}[/cyan]")
    if public_url:
        console.print(f"URL: {public_url}")
    return entry


def main() -> None:
    parser = argparse.ArgumentParser(description="Stream-upload a remote URL to HCP S3")
    parser.add_argument("url",           help="Remote URL to stream")
    parser.add_argument("s3_key",        nargs="?", help="S3 key (default: URL filename)")
    parser.add_argument("--type",        dest="rtype", help="Catalog type override")
    parser.add_argument("--public",      action="store_true", help="Make object publicly readable")
    parser.add_argument("--name",        default=None, help="Human-readable name for catalog")
    parser.add_argument("--description", default="", help="Description for catalog")
    parser.add_argument("--chunk-mb",    type=int, default=DEFAULT_CHUNK_MB,
                        help=f"Chunk size in MB for range-capable servers (default: {DEFAULT_CHUNK_MB})")
    args = parser.parse_args()

    s3_key = args.s3_key or Path(urlparse(args.url).path).name
    if not s3_key:
        console.print("[red]Cannot infer s3_key from URL — provide it explicitly.[/red]")
        sys.exit(1)
    warn_key(s3_key, console)

    stream_upload(
        url=args.url,
        s3_key=s3_key,
        make_public=args.public,
        resource_type=args.rtype,
        name=args.name,
        description=args.description,
        chunk_mb=args.chunk_mb,
    )


if __name__ == "__main__":
    main()
