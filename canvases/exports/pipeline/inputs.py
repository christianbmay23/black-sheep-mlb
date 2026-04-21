"""Shared loader for dated slate input modules.

This keeps the current ``models/<slug>_inputs.py`` workflow intact while
formalizing the small set of exports the compute path expects today.
Validation is intentionally minimal and compatibility-safe: required exports
must exist, basic types must be reasonable, and the derived canvas path must be
computable from ``CANVAS_SLUG``.
"""
from __future__ import annotations

import importlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]


@dataclass(frozen=True)
class SlateInputs:
    slug: str
    report_date: str
    canvas_slug: str
    canvas_path: Path
    game_specs: list[dict[str, Any]]
    make_sp_profile: Any


def _require_attr(mod: Any, attr: str) -> Any:
    if not hasattr(mod, attr):
        raise AttributeError(f"{mod.__name__} missing required export: {attr}")
    return getattr(mod, attr)


def load_slate_inputs(slug: str, *, root: Path = ROOT) -> SlateInputs:
    mod = importlib.import_module(f"models.{slug}_inputs")

    report_date = _require_attr(mod, "REPORT_DATE")
    canvas_slug = _require_attr(mod, "CANVAS_SLUG")
    game_specs = _require_attr(mod, "GAME_SPECS")
    make_sp_profile = _require_attr(mod, "make_sp_profile")

    if not isinstance(report_date, str):
        raise TypeError(f"{mod.__name__}.REPORT_DATE must be str")
    if not isinstance(canvas_slug, str):
        raise TypeError(f"{mod.__name__}.CANVAS_SLUG must be str")
    if not isinstance(game_specs, list):
        raise TypeError(f"{mod.__name__}.GAME_SPECS must be list")
    if not callable(make_sp_profile):
        raise TypeError(f"{mod.__name__}.make_sp_profile must be callable")

    canvas_path = root / "canvases" / f"mlb-pregame-intel-{canvas_slug}.canvas.tsx"

    return SlateInputs(
        slug=slug,
        report_date=report_date,
        canvas_slug=canvas_slug,
        canvas_path=canvas_path,
        game_specs=game_specs,
        make_sp_profile=make_sp_profile,
    )
