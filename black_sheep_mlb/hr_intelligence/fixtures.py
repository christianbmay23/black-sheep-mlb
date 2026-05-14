"""Fixture loading for EchoIQ HR Intelligence v1."""
from __future__ import annotations

import json
from pathlib import Path

from black_sheep_mlb.hr_intelligence.config import DEFAULT_FIXTURE_FILE, FIXTURE_DIR
from black_sheep_mlb.hr_intelligence.schema import HitterInput


def default_fixture_path(root: Path) -> Path:
    return root / FIXTURE_DIR / DEFAULT_FIXTURE_FILE


def load_fixture_rows(path: Path, *, date: str) -> tuple[list[HitterInput], dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = [HitterInput.from_dict(item, date_override=date) for item in payload.get("hitters", [])]
    metadata = {
        "fixture_file": str(path),
        "fixture_date": payload.get("date", ""),
        "source_status": payload.get("source_status", "fixture_only"),
        "notes": payload.get("notes", ""),
    }
    return rows, metadata
