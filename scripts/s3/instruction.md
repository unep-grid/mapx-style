# S3 Quick Reference — HCP (UNIGE)

Full documentation: **[DEVELOPERS.md](../../DEVELOPERS.md)** · AI guide: **[CLAUDE.md](../../CLAUDE.md)**

---

## Endpoint / bucket

```
Endpoint : https://mapx.unepgrid.s3.unige.ch/
Bucket   : mapx  (UNIGE_S3_BUCKET in .env)
Public URL: https://mapx.unepgrid.s3.unige.ch/mapx/<key>
```

## Credentials (encoded automatically by s3_client.py)

```bash
ACCESS_KEY=$(echo -n "$UNIGE_S3_USER" | base64)
SECRET_KEY=$(echo -n "$UNIGE_S3_KEY"  | md5sum | awk '{print $1}')
```

## Public access header (required on every request)

```bash
curl -H "Authorization: AWS all_users:" \
     https://mapx.unepgrid.s3.unige.ch/mapx/maps/world.pmtiles
```

## List objects (raw curl)

```bash
curl -v "${UNIGE_S3_ENDPOINT}/?list-type=2&prefix=maps/" \
  --aws-sigv4 "aws:amz:us-east-1:s3" \
  --user "${ACCESS_KEY}:${SECRET_KEY}"
```

## Skills (run from repo root)

```bash
uv run scripts/s3/upload.py <file> [s3_key] [--type TYPE] [--public] [--name NAME]
uv run scripts/s3/list_objects.py [--prefix <prefix>]
uv run scripts/s3/set_acl.py <s3_key> --public
uv run scripts/s3/set_acl.py <s3_key> --verify
uv run scripts/s3/range_test.py <public_url>
uv run scripts/s3/catalog.py list
uv run scripts/s3/catalog.py show <id>
uv run scripts/s3/catalog.py remove <id>
```
