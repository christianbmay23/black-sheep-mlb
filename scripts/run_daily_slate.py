import argparse
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from black_sheep.engine.slate_runner import run_slate
from black_sheep.utils.dates import utc_today_str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run daily MLB slate pipeline")
    parser.add_argument("--date", type=str, help="Slate date in YYYY-MM-DD format")
    parser.add_argument("--today", action="store_true", help="Run slate for UTC today")
    parser.add_argument("--demo", action="store_true", help="Force demo-mode collectors")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.date:
        date_str = args.date
    elif args.today or not args.date:
        date_str = utc_today_str()
    else:
        date_str = utc_today_str()

    predictions = run_slate(date_str, use_live=not args.demo)
    mode = "demo" if args.demo else "live-enabled"
    print(f"Ran slate for {date_str} ({mode}). Games: {len(predictions)}")
    for pred in predictions:
        print(
            f"{pred['game_id']} | {pred['recommended_side']} ML | edge={pred['edge']:.2%} | confidence={pred['confidence_tier']}"
        )


if __name__ == "__main__":
    main()
