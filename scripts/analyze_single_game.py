#!/usr/bin/env python3
"""Run the EchoIQ MLB report pipeline for one matchup."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from black_sheep_mlb.pipelines.echoiq_slate import run_echoiq_slate  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build EchoIQ MLB outputs for one game.")
    parser.add_argument("--date", required=True)
    parser.add_argument("--away", required=True)
    parser.add_argument("--home", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--odds-provider", default="none", choices=["none", "manual"])
    parser.add_argument("--manual-odds", "--manual-odds-csv", dest="manual_odds", default=None)
    parser.add_argument("--manual-props", default=None)
    parser.add_argument("--manual-weather", default=None)
    parser.add_argument("--manual-ballpark", default=None)
    parser.add_argument("--manual-lineups", default=None)
    parser.add_argument("--manual-inputs", default=None)
    args = parser.parse_args(argv)

    summary = run_echoiq_slate(
        date=args.date,
        mode="full",
        away=args.away,
        home=args.home,
        output_dir=Path(args.output_dir),
        odds_provider_name=args.odds_provider,
        manual_odds_csv=Path(args.manual_odds) if args.manual_odds else None,
        manual_props_csv=Path(args.manual_props) if args.manual_props else None,
        manual_weather_csv=Path(args.manual_weather) if args.manual_weather else None,
        manual_ballpark_csv=Path(args.manual_ballpark) if args.manual_ballpark else None,
        manual_lineups_csv=Path(args.manual_lineups) if args.manual_lineups else None,
        manual_inputs_json=Path(args.manual_inputs) if args.manual_inputs else None,
    )
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
