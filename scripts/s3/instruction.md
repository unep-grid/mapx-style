# S3 Quick Reference — HCP

Full documentation: **[DEVELOPERS.md](../../DEVELOPERS.md)** · AI guide: **[CLAUDE.md](../../CLAUDE.md)**

---

## Endpoint / bucket

```
Endpoint : $S3_ENDPOINT   (from .env)
Bucket   : $S3_BUCKET     (from .env, default: mapx)
Public URL: $S3_PUBLIC_BASE_URL/<key>
```

## Inventory rule

S3 is the catalog. Use `get_catalog.py` to list the bucket live before uploading.
Do not commit generated catalog snapshots. Store provenance in the relevant dataset
README or build-script comments.

## Credentials (encoded automatically by s3_client.py)

```bash
ACCESS_KEY=$(echo -n "$S3_USER" | base64)
SECRET_KEY=$(echo -n "$S3_KEY"  | md5sum | awk '{print $1}')
```

## Public access header (required on every request)

```bash
curl -H "Authorization: AWS all_users:" \
     "${S3_PUBLIC_BASE_URL}/layers/mapx_borders__v1.pmtiles"
```

## List objects (raw curl)

```bash
curl -v "${S3_ENDPOINT}/?list-type=2&prefix=${S3_BUCKET}/layers/" \
  --aws-sigv4 "aws:amz:us-east-1:s3" \
  --user "${ACCESS_KEY}:${SECRET_KEY}"
```

## Scripts (run from repo root)

```bash
uv run scripts/s3/upload.py <file> [s3_key] [--public]
uv run scripts/s3/get_catalog.py [--prefix <prefix>] [--limit N|--all] [--format table|json]
uv run scripts/s3/set_acl.py <s3_key> --public
uv run scripts/s3/set_acl.py <s3_key> --verify
uv run scripts/s3/range_test.py <public_url>
```
