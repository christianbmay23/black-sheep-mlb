#!/usr/bin/env python3
"""Run EchoIQ v3 Probability Framework v1 for supported prop markets."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from echoiq_v3.probability_framework_v1 import evaluate_slate  # noqa: E402


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate EchoIQ v3 HIT/TB candidates with deterministic probability rules.")
    parser.add_argument("slate_path", help="Slate folder, e.g. slates/2026-05-14")
    parser.add_argument("--write", action="store_true", help="Write probability fields back to candidate and verification boards.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable summary.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    result = evaluate_slate(Path(args.slate_path), write=args.write)

    payload = {
        "slate_path": str(result.slate_path),
        "evaluated_rows": result.evaluated_rows,
        "skipped_rows": result.skipped_rows,
        "wrote_files": result.wrote_files,
        "markets": sorted({row.market_type for row in result.results}),
        "promotion_eligibility": _count_promotions(result),
    }
    if result.results:
        payload["example_audit_ledger"] = json.loads(result.results[0].audit_ledger)

    if args.json:
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        print("EchoIQ v3 Probability Framework v1")
        print(f"Slate: {result.slate_path}")
        print(f"Evaluated rows: {result.evaluated_rows}")
        print(f"Skipped rows: {result.skipped_rows}")
        print(f"Wrote files: {result.wrote_files}")
        print("Promotion eligibility:")
        for label, count in payload["promotion_eligibility"].items():
            print(f"- {label}: {count}")
        if result.results:
            print("Example audit ledger:")
            print(json.dumps(json.loads(result.results[0].audit_ledger), indent=2))
    return 0


def _count_promotions(result) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in result.results:
        counts[row.promotion_eligibility] = counts.get(row.promotion_eligibility, 0) + 1
    return dict(sorted(counts.items()))


if __name__ == "__main__":
    sys.exit(main())
