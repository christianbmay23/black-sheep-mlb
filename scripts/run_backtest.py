import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from black_sheep.engine.slate_runner import run_slate


def main() -> None:
    preds = run_slate("2026-04-14")
    print({"games": len(preds), "avg_edge": (sum(p["edge"] for p in preds) / len(preds)) if preds else 0.0})


if __name__ == "__main__":
    main()
