import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from black_sheep.engine.slate_runner import run_slate
from black_sheep.utils.dates import utc_today_str


def main() -> None:
    date_str = utc_today_str()
    predictions = run_slate(date_str)
    print(f"Ran slate for {date_str}. Games: {len(predictions)}")
    for pred in predictions:
        print(
            f"{pred['game_id']} | {pred['recommended_side']} ML | edge={pred['edge']:.2%} | confidence={pred['confidence_tier']}"
        )


if __name__ == "__main__":
    main()
