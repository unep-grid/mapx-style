"""
set_acl.py — Set or verify the public-read ACL on an HCP S3 object.

HCP quirks:
  - Canned ACL strings ("public-read") are silently ignored.
  - PutObjectAcl with explicit policy raises MalformedXML on some HCP namespaces.
  - On those namespaces, public access is granted at the namespace level — all
    objects are accessible via the Authorization: AWS all_users: header without
    any per-object ACL. set_public_acl() treats MalformedXML as a non-fatal
    warning in that case.

Usage:
  uv run scripts/s3/set_acl.py <s3_key> --public
  uv run scripts/s3/set_acl.py <s3_key> --verify

Import in other skills:
  from set_acl import set_public_acl
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from botocore.exceptions import ClientError
from rich.console import Console

from s3_client import make_client

console = Console()

ALL_USERS_URI = "http://acs.amazonaws.com/groups/global/AllUsers"


def set_public_acl(s3_key: str) -> None:
    """Apply an explicit public-read ACL to an existing object."""
    s3, bucket = make_client()

    # Fetch current ACL to obtain the required Owner block
    current = s3.get_object_acl(Bucket=bucket, Key=s3_key)
    owner = current.get("Owner", {})

    policy = {
        "Grants": [
            {
                "Grantee": {"Type": "Group", "URI": ALL_USERS_URI},
                "Permission": "READ",
            }
        ],
        "Owner": owner,
    }

    try:
        s3.put_object_acl(Bucket=bucket, Key=s3_key, AccessControlPolicy=policy)
        console.print(f"[green]Public ACL applied:[/green] {s3_key}")
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "MalformedXML":
            # HCP namespace-level public access — PutObjectAcl not supported.
            # Objects are already accessible via Authorization: AWS all_users:
            console.print(
                f"[yellow]ACL skipped (namespace-level public access):[/yellow] {s3_key}"
            )
        else:
            raise


def verify_acl(s3_key: str) -> bool:
    """Return True if AllUsers:READ grant is present."""
    s3, bucket = make_client()
    acl = s3.get_object_acl(Bucket=bucket, Key=s3_key)
    for grant in acl.get("Grants", []):
        grantee = grant.get("Grantee", {})
        if (
            grantee.get("Type") == "Group"
            and grantee.get("URI") == ALL_USERS_URI
            and grant.get("Permission") == "READ"
        ):
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage HCP object ACL")
    parser.add_argument("s3_key", help="S3 key of the target object")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--public", action="store_true", help="Apply public-read ACL")
    group.add_argument("--verify", action="store_true", help="Check if public-read ACL is set")
    args = parser.parse_args()

    try:
        if args.public:
            set_public_acl(args.s3_key)
        elif args.verify:
            is_public = verify_acl(args.s3_key)
            if is_public:
                console.print(f"[green]Public ACL confirmed:[/green] {args.s3_key}")
            else:
                console.print(f"[yellow]Not public:[/yellow] {args.s3_key}")
                sys.exit(1)
    except Exception as exc:
        console.print(f"[red]Error:[/red] {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
