"""Small filesystem cache helpers."""
from __future__ import annotations

import hashlib
from pathlib import Path


def safe_cache_path(root: Path, namespace: str, key: str, suffix: str) -> Path:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:24]
    path = root / namespace / f"{digest}.{suffix.lstrip('.')}"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path
