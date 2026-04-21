"""Shared slate identity helpers and the current GAME_SPECS contract.

Slug behavior is intentionally limited to the current repo convention:

- Calendar dates map to lowercase three-letter month abbreviation plus
  non-zero-padded day, for example ``2026-04-16`` -> ``apr16``.
- Optional passthrough accepts existing ``apr16``-style slugs unchanged.
- Slugs are not year-qualified, so values like ``apr16`` are ambiguous across
  seasons by design. This module documents that limitation without changing it.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, TypedDict


class GameSpec(TypedDict):
    away: str
    home: str
    time_et: str
    away_a: int | None
    home_a: int | None
    weather: str
    run_env: str
    away_xera: float
    home_xera: float
    analyst_confidence: str
    rationale: str
    extra_flags: list[str]


GAME_SPEC_REQUIRED_KEYS = (
    "away",
    "home",
    "time_et",
    "away_a",
    "home_a",
    "weather",
    "run_env",
    "away_xera",
    "home_xera",
    "analyst_confidence",
    "rationale",
    "extra_flags",
)


def slug_from_calendar_date(iso: str, *, allow_slug_passthrough: bool = False) -> str:
    token = iso.strip().lower()
    if allow_slug_passthrough and re.fullmatch(r"[a-z]{3}\d{1,2}", token):
        return token
    dt = datetime.strptime(token, "%Y-%m-%d")
    return dt.strftime("%b").lower() + str(dt.day)


def validate_game_specs(specs: list[dict[str, Any]]) -> None:
    """Opt-in validation for callers or tests that want an early shape check."""
    for idx, spec in enumerate(specs):
        missing = [key for key in GAME_SPEC_REQUIRED_KEYS if key not in spec]
        if missing:
            raise ValueError(f"GAME_SPECS[{idx}] missing required keys: {', '.join(missing)}")
