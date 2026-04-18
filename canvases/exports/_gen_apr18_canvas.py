#!/usr/bin/env python3
"""Refresh Apr 18: run model pipeline + exports (same as build_ml_exports --compute --date 2026-04-18)."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

EXPORT_SCRIPT = Path(__file__).resolve().parent / "build_ml_exports.py"


def main() -> None:
    subprocess.run(
        [sys.executable, str(EXPORT_SCRIPT), "--date", "2026-04-18", "--compute"],
        check=True,
    )


if __name__ == "__main__":
    main()
