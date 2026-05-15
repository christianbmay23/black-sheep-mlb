from __future__ import annotations

import csv
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CREATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "create_slate.py"
PROBABILITY_MODULE = REPO_ROOT / "echoiq_v3" / "probability_framework_v1.py"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    sys.path.insert(0, str(path.parent))
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)
    return module


create_slate_module = _load_module("create_slate_for_probability_tests", CREATE_SCRIPT)
probability_module = _load_module("echoiq_v3_probability_framework_for_tests", PROBABILITY_MODULE)


class EchoIQV3ProbabilityFrameworkTests(unittest.TestCase):
    def test_market_math_handles_exact_and_ambiguous_american_odds(self):
        probability, status = probability_module.american_odds_to_implied_probability("-295")
        self.assertEqual(status, "odds_exact")
        self.assertAlmostEqual(probability, 0.7468, places=4)

        probability, status = probability_module.american_odds_to_implied_probability("+165 to +190")
        self.assertIsNone(probability)
        self.assertEqual(status, "odds_ambiguous")

        self.assertEqual(probability_module.fair_odds_from_probability(0.70), -233)
        self.assertEqual(probability_module.fair_odds_from_probability(0.40), 150)

    def test_clean_hit_row_can_be_bet_eligible_without_mutating_label(self):
        candidate = _base_row(
            market_type="HIT",
            label="LEAN",
            line="Over 0.5",
            odds="-110",
            source_confidence="A",
            gate_status="PASSED",
            gates_passed="true",
            kill_switch="CLEAR",
            rationale_full="Confirmed No. 2 hitter with high-floor recent form.",
        )

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))

        self.assertEqual(result.promotion_eligibility, "BET")
        self.assertEqual(result.gate_status, "PASSED")
        self.assertGreater(result.edge or 0.0, 0.025)
        ledger = json.loads(result.audit_ledger)
        self.assertEqual(ledger[0]["component"], "baseline")
        self.assertEqual(ledger[-1]["value"], "BET")

    def test_open_gate_and_source_c_cap_row_at_conditional(self):
        candidate = _base_row(
            market_type="TB",
            label="CONDITIONAL",
            line="Over 1.5",
            odds="+145",
            source_confidence="C",
            gate_status="CONDITIONAL",
            gate_conditions="Delay resolution; lineup recheck",
            kill_switch="NOT_CLEARED",
            rationale_full="Delay risk and lineup recheck remain.",
        )

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))

        self.assertEqual(result.promotion_eligibility, "CONDITIONAL")
        self.assertEqual(result.gate_status, "CONDITIONAL")
        self.assertIn("OPEN_GATE_CONDITIONS", result.kill_flags)
        self.assertIn("KILL_SWITCH_NOT_CLEARED", result.kill_flags)

    def test_slate_runner_writes_supported_markets_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            candidate_path = slate_dir / "02_candidates" / "candidate_board.csv"
            verification_path = slate_dir / "03_verification" / "verification_board.csv"
            rows = [
                _base_row(market_type="HIT", label="LEAN", line="Over 0.5", odds="-110"),
                _base_row(market_type="HR", label="WATCHLIST", line="", odds="+450"),
            ]
            _write_prediction_rows(candidate_path, rows)
            _write_prediction_rows(verification_path, rows)

            run = probability_module.evaluate_slate(slate_dir, write=True)

            self.assertEqual(run.evaluated_rows, 1)
            self.assertEqual(run.skipped_rows, 1)
            written_rows = _read_csv(candidate_path)
            self.assertEqual(written_rows[0]["market_type"], "HIT")
            self.assertNotEqual(written_rows[0]["fair_probability"], "")
            self.assertEqual(written_rows[0]["promotion_eligibility"], "BET")
            self.assertEqual(written_rows[1]["market_type"], "HR")
            self.assertEqual(written_rows[1]["promotion_eligibility"], "")


def _create_test_slate(tmp_root: Path) -> Path:
    source_template = REPO_ROOT / "slates" / "_template"
    source_templates = REPO_ROOT / "echoiq_v3" / "templates"
    (tmp_root / "slates").mkdir()
    shutil.copytree(source_template, tmp_root / "slates" / "_template")
    shutil.copytree(source_templates, tmp_root / "echoiq_v3" / "templates")
    create_slate_module.create_slate("2026-05-05", repo_root=tmp_root)
    return tmp_root / "slates" / "2026-05-05"


def _write_prediction_rows(path: Path, rows: list[dict[str, str]]) -> None:
    fieldnames = [
        "slate_date",
        "game_id",
        "game",
        "source",
        "source_type",
        "prediction_bucket",
        "label",
        "market_type",
        "team",
        "player",
        "opponent",
        "pitcher",
        "line",
        "odds",
        "odds_estimated",
        "implied_probability",
        "fair_probability",
        "fair_odds",
        "edge",
        "edge_pct",
        "stake_units",
        "confidence_tier",
        "source_confidence",
        "gates_passed",
        "gate_status",
        "gate_conditions",
        "promotion_eligibility",
        "kill_switch",
        "audit_ledger",
        "rationale_short",
        "rationale_full",
        "status",
        "result",
        "profit_units",
        "grading_notes",
        "source_urls",
        "timestamp",
    ]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def _base_row(**overrides) -> dict[str, str]:
    row = {
        "slate_date": "2026-05-05",
        "game_id": "sample-game",
        "game": "NYY@BOS",
        "source": "EchoIQ",
        "source_type": "ECHOIQ",
        "prediction_bucket": "research_candidate",
        "label": "LEAN",
        "market_type": "HIT",
        "team": "NYY",
        "player": "Sample Hitter",
        "opponent": "BOS",
        "pitcher": "Sample Pitcher",
        "line": "Over 0.5",
        "odds": "-110",
        "odds_estimated": "false",
        "implied_probability": "",
        "fair_probability": "",
        "fair_odds": "",
        "edge": "",
        "edge_pct": "",
        "stake_units": "",
        "confidence_tier": "",
        "source_confidence": "A",
        "gates_passed": "true",
        "gate_status": "PASSED",
        "gate_conditions": "",
        "promotion_eligibility": "",
        "kill_switch": "CLEAR",
        "audit_ledger": "",
        "rationale_short": "Sample v1 row",
        "rationale_full": "Confirmed No. 2 hitter with high-floor recent form.",
        "status": "PREGAME",
        "result": "",
        "profit_units": "",
        "grading_notes": "",
        "source_urls": "https://example.test",
        "timestamp": "2026-05-05T10:00:00Z",
    }
    row.update(overrides)
    return row


if __name__ == "__main__":
    unittest.main()
