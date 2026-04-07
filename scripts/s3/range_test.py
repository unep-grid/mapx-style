"""
range_test.py — Verify that an HCP public URL supports HTTP 206 partial content.

Required for PMTiles and Cloud-Optimized GeoTIFF (COG) clients.

Usage:
  uv run scripts/s3/range_test.py <public_url> [--range bytes=0-511]

Exit code 0 = 206 confirmed.
Exit code 1 = wrong status or request error.
"""

import argparse
import sys

import requests
from rich.console import Console

console = Console()

HCP_AUTH = {"Authorization": "AWS all_users:"}


def test_range(url: str, byte_range: str = "bytes=0-511") -> bool:
    # HEAD — check Accept-Ranges and Content-Length
    console.print(f"\n[bold]HEAD[/bold] {url}")
    head = requests.head(url, headers=HCP_AUTH, timeout=20, allow_redirects=True)
    console.print(f"  Status         : {head.status_code}")
    console.print(f"  Accept-Ranges  : {head.headers.get('Accept-Ranges', '[not set]')}")
    console.print(f"  Content-Length : {head.headers.get('Content-Length', '[not set]')}")
    console.print(f"  Content-Type   : {head.headers.get('Content-Type', '[not set]')}")

    # Range GET
    console.print(f"\n[bold]GET[/bold] {url}  Range: {byte_range}")
    resp = requests.get(
        url,
        headers={**HCP_AUTH, "Range": byte_range},
        timeout=20,
        stream=True,
    )
    body = resp.raw.read(1024)
    console.print(f"  Status         : {resp.status_code}", end="  ")

    if resp.status_code == 206:
        console.print("[green]✓ 206 Partial Content — range requests work[/green]")
        console.print(f"  Content-Range  : {resp.headers.get('Content-Range', '[not set]')}")
        console.print(f"  Bytes received : {len(body)}")
        return True
    elif resp.status_code == 200:
        console.print("[yellow]⚠ 200 OK — full content returned (range ignored or not supported)[/yellow]")
        console.print("Check CORS/HCP namespace settings for Content-Range exposure.")
        return False
    elif resp.status_code in (401, 403):
        console.print(f"[red]✗ {resp.status_code} — unauthorized[/red]")
        console.print("Run: uv run scripts/s3/set_acl.py <s3_key> --public")
        return False
    else:
        console.print(f"[red]✗ Unexpected status {resp.status_code}[/red]")
        console.print(resp.text[:300])
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Test HTTP 206 range support")
    parser.add_argument("url", help="Full public URL of the object")
    parser.add_argument("--range", default="bytes=0-511", dest="byte_range",
                        help="Byte range to request (default: bytes=0-511)")
    args = parser.parse_args()

    try:
        ok = test_range(args.url, args.byte_range)
    except requests.exceptions.RequestException as exc:
        console.print(f"[red]Request error:[/red] {exc}")
        sys.exit(1)

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
