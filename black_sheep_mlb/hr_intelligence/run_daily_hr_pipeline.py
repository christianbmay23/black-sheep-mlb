"""CLI entrypoint for EchoIQ HR Intelligence v1."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from black_sheep_mlb.hr_intelligence.runner import run_daily_hr_pipeline


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build EchoIQ HR Intelligence v1 boards.")
    parser.add_argument("--date", required=True)
    parser.add_argument("--fixture", action="store_true", help="Run fixture/demo mode. No live APIs are called.")
    parser.add_argument("--fixture-file", default=None)
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args(argv)

    summary = run_daily_hr_pipeline(
        date=args.date,
        fixture=args.fixture,
        fixture_file=Path(args.fixture_file) if args.fixture_file else None,
        output_dir=Path(args.output_dir) if args.output_dir else None,
    )
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
