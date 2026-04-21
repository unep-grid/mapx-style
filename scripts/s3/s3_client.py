"""
s3_client.py — HCP-compatible boto3 S3 client factory.

HCP credential encoding:
  access_key = base64(username)      (no padding newline)
  secret_key = md5(password).hexdigest()

Usage:
  from s3_client import make_client
  s3, bucket = make_client()
"""

import base64
import hashlib
import os
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv

# .env lives at repo root — three levels up from scripts/s3/
_ENV_PATH = Path(__file__).parent.parent.parent / ".env"
load_dotenv(_ENV_PATH)


def _encode_credentials(username: str, password: str) -> tuple[str, str]:
    """Return (access_key_id, secret_access_key) encoded for HCP."""
    access_key = base64.b64encode(username.encode()).decode()
    secret_key = hashlib.md5(password.encode()).hexdigest()
    return access_key, secret_key


def make_client():
    """
    Build a boto3 S3 client configured for the HCP endpoint.

    Returns:
        (boto3.client, bucket_name)
    """
    endpoint = os.environ["S3_ENDPOINT"].rstrip("/")
    username  = os.environ["S3_USER"]
    password  = os.environ["S3_KEY"]
    bucket    = os.environ.get("S3_BUCKET", "mapx")

    access_key, secret_key = _encode_credentials(username, password)

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="us-east-1",  # dummy — required by SDK
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            # Prevent x-amz-checksum-* headers that HCP rejects
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
        ),
    )
    return client, bucket
