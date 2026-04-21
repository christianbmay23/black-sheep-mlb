"""Shared pipeline utilities extracted from apr16_compute.py.

This package holds pure, reusable building blocks of the MLB pregame intel
compute pipeline (canvas marker I/O, market classification, game status
bucketing, snapshot writing, serializers). The orchestration entry points
still live in canvases/exports/apr16_compute.py and re-export the symbols
here so existing callers (build_ml_exports.py, bootstrap_live_slate.py,
_gen_apr*_canvas.py) keep working unchanged.

Do not add HTTP or I/O that is not already here; the goal of this package
is to remain easy to unit-test without network.
"""
from __future__ import annotations

__all__ = [
    "canvas_io",
    "markets",
    "snapshots",
    "status",
]
