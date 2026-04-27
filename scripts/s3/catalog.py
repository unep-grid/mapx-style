"""
catalog.py — CRUD helpers for data/catalog.json.

Run as a CLI:
  uv run scripts/s3/catalog.py list
  uv run scripts/s3/catalog.py show <id>
  uv run scripts/s3/catalog.py remove <id>

Import in other scripts:
  import sys
  from pathlib import Path
  sys.path.insert(0, str(Path(__file__).parent))
  from catalog import load_catalog, upsert_entry, remove_entry
"""

import json
import sys
from pathlib import Path

from rich.console import Console
from rich.table import Table

# Repo-root paths
CATALOG_PATH      = Path(__file__).parent.parent.parent / "data" / "catalog.json"
STYLE_VERSION_PATH = Path(__file__).parent.parent.parent / "style_version.json"

console = Console()


# ── Style version helper ────────────────────────────────────────────────────────

def read_style_version(override: int | None = None) -> int:
    """Return the style version. Uses override if provided, else reads style_version.json."""
    if override is not None:
        return int(override)
    return json.loads(STYLE_VERSION_PATH.read_text())["version"]


# ── Catalog CRUD ────────────────────────────────────────────────────────────────

def load_catalog() -> dict:
    """Load and return the catalog dict. Creates the file if missing."""
    if not CATALOG_PATH.exists():
        CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        empty = {"_comment": "MapX S3 asset catalog", "_version": 1, "resources": []}
        CATALOG_PATH.write_text(json.dumps(empty, indent=2))
        return empty
    return json.loads(CATALOG_PATH.read_text())


def save_catalog(catalog: dict) -> None:
    CATALOG_PATH.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")


def upsert_entry(entry: dict) -> None:
    """Insert or update a resource entry matched by its 'id' field."""
    catalog = load_catalog()
    resources = catalog.setdefault("resources", [])
    for i, r in enumerate(resources):
        if r.get("id") == entry["id"]:
            resources[i] = entry
            save_catalog(catalog)
            return
    resources.append(entry)
    save_catalog(catalog)


def remove_entry(resource_id: str) -> bool:
    """Remove entry by id. Returns True if found and removed."""
    catalog = load_catalog()
    before = len(catalog["resources"])
    catalog["resources"] = [r for r in catalog["resources"] if r.get("id") != resource_id]
    if len(catalog["resources"]) < before:
        save_catalog(catalog)
        return True
    return False


def get_entry(resource_id: str) -> dict | None:
    catalog = load_catalog()
    for r in catalog["resources"]:
        if r.get("id") == resource_id:
            return r
    return None


# ── CLI ────────────────────────────────────────────────────────────────────────

def _cmd_list() -> None:
    catalog = load_catalog()
    resources = catalog.get("resources", [])
    if not resources:
        console.print("[yellow]Catalog is empty.[/yellow]")
        return
    table = Table(title="MapX S3 Catalog", show_lines=True)
    for col in ("id", "name", "type", "storage", "size_bytes", "last_modified"):
        table.add_column(col, overflow="fold")
    for r in resources:
        table.add_row(
            r.get("id", ""),
            r.get("name", ""),
            r.get("type", ""),
            r.get("storage", ""),
            str(r.get("size_bytes", "")),
            (r.get("last_modified") or "")[:19],
        )
    console.print(table)


def _cmd_show(resource_id: str) -> None:
    entry = get_entry(resource_id)
    if entry is None:
        console.print(f"[red]Not found:[/red] {resource_id}")
        sys.exit(1)
    console.print_json(json.dumps(entry, indent=2))


def _cmd_remove(resource_id: str) -> None:
    if remove_entry(resource_id):
        console.print(f"[green]Removed:[/green] {resource_id}")
    else:
        console.print(f"[red]Not found:[/red] {resource_id}")
        sys.exit(1)


def main() -> None:
    if len(sys.argv) < 2:
        console.print("Usage: catalog.py [list | show <id> | remove <id>]")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "list":
        _cmd_list()
    elif cmd == "show" and len(sys.argv) == 3:
        _cmd_show(sys.argv[2])
    elif cmd == "remove" and len(sys.argv) == 3:
        _cmd_remove(sys.argv[2])
    else:
        console.print(f"[red]Unknown command:[/red] {' '.join(sys.argv[1:])}")
        sys.exit(1)


if __name__ == "__main__":
    main()
