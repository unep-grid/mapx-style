"""
catalog.py — CRUD helpers for data/catalog.json.

Run as a CLI:
  uv run skills/s3/catalog.py list
  uv run skills/s3/catalog.py show <id>
  uv run skills/s3/catalog.py remove <id>

Import in other skills:
  import sys
  from pathlib import Path
  sys.path.insert(0, str(Path(__file__).parent))
  from catalog import load_catalog, upsert_entry, remove_entry
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console

load_dotenv(Path(__file__).parent.parent.parent / ".env")
from rich.table import Table

# Repo-root paths
CATALOG_PATH     = Path(__file__).parent.parent.parent / "data" / "catalog.json"
S3_STRUCTURE_PATH = Path(__file__).parent.parent.parent / "s3_structure.json"

console = Console()


# ── S3 structure helpers ────────────────────────────────────────────────────────

def load_structure() -> dict:
    """Load s3_structure.json from the repo root."""
    if S3_STRUCTURE_PATH.exists():
        return json.loads(S3_STRUCTURE_PATH.read_text())
    return {}


def warn_key(s3_key: str, con=None) -> None:
    """Warn if s3_key does not start with a known prefix from s3_structure.json."""
    _con = con or console
    structure = load_structure()
    paths = structure.get("paths", {})
    prefixes = [v["prefix"] for v in paths.values() if "prefix" in v]
    # Strip template variables — keep only the static leading segment
    static = [p.split("{")[0] for p in prefixes]
    if not any(s3_key.startswith(p) for p in static):
        _con.print(
            f"[yellow]Warning:[/yellow] key [cyan]{s3_key}[/cyan] does not match any known prefix. "
            f"Expected one of: {', '.join(repr(p) for p in static)}"
        )


def prompt_env(given: list[str] | None, con=None) -> list[str]:
    """Return a validated list of target envs. Prompts interactively if omitted.

    Accepts env names or 'all'. Valid envs come from s3_structure.json paths.style.envs.
    Deduplicates while preserving order.
    """
    _con = con or console
    structure = load_structure()
    valid = structure.get("paths", {}).get("style", {}).get("envs", ["prod", "staging"])

    def _expand(choices: list[str]) -> list[str]:
        result = []
        for c in choices:
            if c == "all":
                result.extend(valid)
            elif c in valid:
                result.append(c)
            else:
                _con.print(
                    f"[red]Unknown env:[/red] {c!r}. "
                    f"Valid: {', '.join(valid + ['all'])}"
                )
                raise SystemExit(1)
        return list(dict.fromkeys(result))  # deduplicate, preserve order

    if given:
        return _expand(given)

    # Check UNIGE_S3_ENV before prompting interactively
    env_var = os.environ.get("UNIGE_S3_ENV")
    if env_var:
        _con.print(f"Using env from UNIGE_S3_ENV: [cyan]{env_var}[/cyan]")
        return _expand([env_var])

    # Interactive prompt
    opts = "  ".join(f"[{i + 1}] {e}" for i, e in enumerate(valid))
    opts += f"  [{len(valid) + 1}] all"
    _con.print(f"\nTarget env:  {opts}")
    raw = input(f"  Choice [1={valid[0]}]: ").strip() or "1"

    try:
        idx = int(raw) - 1
        if 0 <= idx < len(valid):
            choice = [valid[idx]]
        elif idx == len(valid):
            choice = ["all"]
        else:
            raise ValueError
    except ValueError:
        choice = [raw]  # treat as name

    return _expand(choice)


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
