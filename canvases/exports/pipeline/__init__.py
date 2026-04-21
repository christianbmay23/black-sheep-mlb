"""Shared pipeline utilities extracted from apr16_compute.py.

This package holds pure, reusable building blocks of the MLB pregame intel
compute pipeline (canvas marker I/O, market classification, game status
bucketing, snapshot writing, serializers). HTTP/data fetching lives in
``fetch``; hitter/pitcher/lineup feature engineering lives in ``features``;
numeric parsing helpers live in ``parseutil``. The orchestration entry points
still live in canvases/exports/apr16_compute.py and re-export symbols so
existing callers (build_ml_exports.py, bootstrap_live_slate.py,
_gen_apr*_canvas.py) keep working unchanged.
"""
from __future__ import annotations

__all__ = [
    "canvas_io",
    "features",
    "fetch",
    "markets",
    "parseutil",
    "slate",
    "snapshots",
    "status",
]
