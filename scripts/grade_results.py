import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
from pathlib import Path

from black_sheep.engine.grading_pipeline import grade_prediction


def main() -> None:
    path = Path("data/outputs/latest_predictions.json")
    if not path.exists():
        print("No predictions file found. Run daily slate first.")
        return

    preds = json.loads(path.read_text())
    graded = [grade_prediction(p, p["recommended_side"]) for p in preds]
    out_path = Path("data/outputs/latest_grades.json")
    out_path.write_text(json.dumps(graded, indent=2))
    print(f"Graded {len(graded)} picks -> {out_path}")


if __name__ == "__main__":
    main()
