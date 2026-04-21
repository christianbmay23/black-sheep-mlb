"""Shared numeric parsing helpers for the MLB pregame intel pipeline."""
from __future__ import annotations

from typing import Any


def parse_float(value: Any) -> float | None:
    if value in {None, "", "—"}:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        if text.startswith("."):
            try:
                return float(f"0{text}")
            except ValueError:
                return None
    return None


def parse_int(value: Any) -> int | None:
    if value in {None, "", "—"}:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def safe_div(num: float, den: float) -> float | None:
    if den == 0:
        return None
    return num / den
