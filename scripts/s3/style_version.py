"""Read the MapX style asset version."""

import json
from pathlib import Path

STYLE_VERSION_PATH = Path(__file__).parent.parent.parent / "style_version.json"


def read_style_version(override: int | None = None) -> int:
    """Return the style asset version, or an explicit override."""
    if override is not None:
        return int(override)
    return json.loads(STYLE_VERSION_PATH.read_text())["version"]
