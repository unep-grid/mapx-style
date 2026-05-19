"""Shared helpers for MapX S3 scripts."""

import base64
import hashlib
import json
import mimetypes
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlencode
from xml.etree import ElementTree

from botocore.exceptions import ClientError
from rich.console import Console

from s3_client import make_client

console = Console()

EXTRA_MIME = {
    ".pmtiles": "application/x-protomaps",
    ".geojson": "application/geo+json",
    ".pbf": "application/x-protobuf",
}


def content_type_for_path(path: Path) -> str:
    """Return an upload content type for a local file path."""
    ext = path.suffix.lower()
    if ext in EXTRA_MIME:
        return EXTRA_MIME[ext]
    mime, _ = mimetypes.guess_type(str(path))
    return mime or "application/octet-stream"


def public_url(s3_key: str) -> str:
    """Return the public URL for a logical S3 key."""
    endpoint = os.environ.get("S3_ENDPOINT", "").rstrip("/")
    bucket = os.environ.get("S3_BUCKET", "mapx")
    return f"{endpoint}/{bucket}/{s3_key}"


def metadata_from_head(s3_key: str, head: dict[str, Any], include_url: bool = False) -> dict[str, Any]:
    """Normalize S3 head_object metadata for console/json output."""
    last_modified = head.get("LastModified", datetime.now(timezone.utc))
    if hasattr(last_modified, "isoformat"):
        last_modified = last_modified.isoformat()
    metadata = {
        "key": s3_key,
        "etag": head.get("ETag", "").strip('"'),
        "last_modified": last_modified,
        "size_bytes": head.get("ContentLength", 0),
    }
    if include_url:
        metadata["url"] = public_url(s3_key)
    return metadata


def print_metadata(metadata: dict[str, Any]) -> None:
    console.print("[green]S3 object:[/green]")
    console.print_json(json.dumps(metadata, indent=2))
    if metadata.get("url"):
        console.print(f"URL: {metadata['url']}")


def strip_namespace_prefix(key: str, bucket: str) -> str:
    """Convert HCP namespace keys like mapx/layers/a.pmtiles to layers/a.pmtiles."""
    prefix = f"{bucket}/"
    return key[len(prefix):] if key.startswith(prefix) else key


def _list_hcp_namespace(prefix: str, bucket: str) -> list[dict[str, Any]]:
    endpoint = os.environ["S3_ENDPOINT"].rstrip("/")
    access_key = base64.b64encode(os.environ["S3_USER"].encode()).decode()
    secret_key = hashlib.md5(os.environ["S3_KEY"].encode()).hexdigest()
    query_prefix = prefix if prefix.startswith(f"{bucket}/") else f"{bucket}/{prefix}"
    objects: list[dict[str, Any]] = []
    token = ""

    while True:
        params = {"list-type": "2"}
        if query_prefix:
            params["prefix"] = query_prefix
        if token:
            params["continuation-token"] = token

        result = subprocess.run(
            [
                "curl",
                "-sS",
                "--aws-sigv4", "aws:amz:us-east-1:s3",
                "--user", f"{access_key}:{secret_key}",
                f"{endpoint}/?{urlencode(params, quote_via=quote)}",
            ],
            check=True,
            capture_output=True,
        )

        root = ElementTree.fromstring(result.stdout)
        namespace = root.tag.split("}", 1)[0] + "}" if root.tag.startswith("{") else ""

        for item in root.findall(f"{namespace}Contents"):
            key = strip_namespace_prefix(item.findtext(f"{namespace}Key", default=""), bucket)
            size = int(item.findtext(f"{namespace}Size", default="0"))
            if not key or (key.endswith("/") and size == 0):
                continue
            objects.append(
                {
                    "Key": key,
                    "Size": size,
                    "ETag": item.findtext(f"{namespace}ETag", default="").strip('"'),
                    "LastModified": item.findtext(f"{namespace}LastModified", default=""),
                }
            )

        truncated = root.findtext(f"{namespace}IsTruncated", default="false").lower() == "true"
        token = root.findtext(f"{namespace}NextContinuationToken", default="")
        if not truncated or not token:
            break

    return objects


def list_s3_objects(prefix: str = "") -> list[dict[str, Any]]:
    """Return live S3 objects using logical keys."""
    s3, bucket = make_client()
    paginator = s3.get_paginator("list_objects_v2")
    objects: list[dict[str, Any]] = []
    try:
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            objects.extend(page.get("Contents", []))
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "NoSuchKey":
            return _list_hcp_namespace(prefix, bucket)
        raise

    if not objects:
        return _list_hcp_namespace(prefix, bucket)

    for obj in objects:
        obj["Key"] = strip_namespace_prefix(obj["Key"], bucket)
    return [obj for obj in objects if not (obj["Key"].endswith("/") and obj.get("Size", 0) == 0)]
