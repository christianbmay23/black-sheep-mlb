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

    def test_field_aware_adjustments_ignore_unrelated_row_text(self):
        clean = _base_row(
            market_type="HIT",
            label="LEAN",
            odds="-110",
            rationale_full="This free-text note says lineup recheck, wind in, and stale odds.",
            lineup_status="Confirmed No. 2",
            supporting_factors="high-floor recent form",
        )
        control = dict(clean)
        control["rationale_full"] = "No unrelated risk phrases here."

        clean_result = probability_module.evaluate_row(clean, verification=dict(clean))
        control_result = probability_module.evaluate_row(control, verification=dict(control))

        self.assertEqual(clean_result.fair_probability, control_result.fair_probability)
        self.assertEqual(clean_result.probability_risk_gates, ())

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
            lineup_status="Confirmed No. 2",
            supporting_factors="high-floor recent form",
        )

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))

        self.assertEqual(result.promotion_eligibility, "BET")
        self.assertEqual(result.gate_status, "PASSED")
        self.assertGreater(result.edge or 0.0, 0.025)
        ledger = json.loads(result.audit_ledger)
        self.assertEqual(ledger[0]["component"], "baseline")
        self.assertEqual(ledger[-1]["value"], "BET")

    def test_promotion_only_gate_caps_promotion_without_probability_penalty(self):
        base = _base_row(
            market_type="TB",
            label="LEAN",
            line="Over 1.5",
            odds="+145",
            source_confidence="A",
            gate_status="PASSED",
            gate_conditions="fair probability not loaded; edge not loaded; missing final review",
            kill_switch="CLEAR",
        )
        control = dict(base)
        control["gate_conditions"] = ""

        result = probability_module.evaluate_row(base, verification=dict(base))
        control_result = probability_module.evaluate_row(control, verification=dict(control))

        self.assertEqual(result.fair_probability, control_result.fair_probability)
        self.assertEqual(result.probability_risk_gates, ())
        self.assertIn("fair_probability_not_loaded", result.promotion_only_gates)
        self.assertNotEqual(result.promotion_eligibility, "BET")
        ledger = json.loads(result.audit_ledger)
        self.assertTrue(any(item["component"] == "promotion_block_only" for item in ledger))
        self.assertFalse(any(item["component"] == "probability_penalty" for item in ledger))

    def test_probability_risk_gate_reduces_probability_and_caps_promotion(self):
        candidate = _base_row(
            market_type="TB",
            label="LEAN",
            line="Over 1.5",
            odds="+145",
            source_confidence="A",
            gate_status="PASSED",
            gate_conditions="Delay resolution; lineup recheck",
            kill_switch="CLEAR",
        )
        control = dict(candidate)
        control["gate_conditions"] = ""

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))
        control_result = probability_module.evaluate_row(control, verification=dict(control))

        self.assertLess(result.fair_probability, control_result.fair_probability)
        self.assertIn("weather_delay_restart_risk", result.probability_risk_gates)
        self.assertIn("lineup_not_confirmed", result.probability_risk_gates)
        self.assertNotEqual(result.promotion_eligibility, "BET")
        self.assertEqual(result.gate_status, "CONDITIONAL")
        ledger = json.loads(result.audit_ledger)
        self.assertTrue(any(item["component"] == "probability_penalty" for item in ledger))

    def test_ambiguous_odds_blocks_implied_probability_and_edge(self):
        candidate = _base_row(
            market_type="HIT",
            label="LEAN",
            odds="+165 to +190",
            source_confidence="A",
            gate_status="PASSED",
            kill_switch="CLEAR",
        )

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))

        self.assertIsNone(result.implied_probability)
        self.assertIsNone(result.edge)
        self.assertIn("ODDS_AMBIGUOUS", result.kill_flags)
        self.assertNotEqual(result.promotion_eligibility, "BET")

    def test_clean_hr_row_scores_but_needs_all_hr_gates_for_bet(self):
        missing_gate = _base_row(
            market_type="HR",
            label="LEAN",
            odds="+850",
            source_confidence="A",
            gate_status="PASSED",
            kill_switch="CLEAR",
            player_active="true",
            lineup_confirmed="true",
            starter_confirmed="true",
            weather_confirmed="true",
            lineup_status="Confirmed No. 2",
            current_odds_status="",
            supporting_factors="barrel support",
            weather_status="favorable weather",
        )
        clean = dict(missing_gate)
        clean["current_odds_status"] = "late_live"

        missing_result = probability_module.evaluate_row(missing_gate, verification=dict(missing_gate))
        clean_result = probability_module.evaluate_row(clean, verification=dict(clean))

        self.assertEqual(missing_result.market_type, "HR")
        self.assertGreater(missing_result.fair_probability, 0.0)
        self.assertIn("stale_odds", missing_result.probability_risk_gates)
        self.assertNotEqual(missing_result.promotion_eligibility, "BET")
        self.assertEqual(clean_result.promotion_eligibility, "BET")

    def test_stale_morning_hr_price_blocks_promotion(self):
        candidate = _base_row(
            market_type="HR",
            label="LEAN",
            odds="+850",
            source_confidence="A",
            gate_status="PASSED",
            kill_switch="CLEAR",
            player_active="true",
            lineup_confirmed="true",
            starter_confirmed="true",
            weather_confirmed="true",
            current_odds_status="morning-only",
            supporting_factors="barrel support",
            weather_status="favorable weather",
        )

        result = probability_module.evaluate_row(candidate, verification=dict(candidate))

        self.assertIn("stale_odds", result.probability_risk_gates)
        self.assertNotEqual(result.promotion_eligibility, "BET")

    def test_hr_uses_higher_edge_threshold_than_hit_and_tb(self):
        configs = probability_module.load_market_configs()

        self.assertGreater(configs["HR"].edge_threshold, configs["HIT"].edge_threshold)
        self.assertGreater(configs["HR"].edge_threshold, configs["TB"].edge_threshold)

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

            self.assertEqual(run.evaluated_rows, 2)
            self.assertEqual(run.skipped_rows, 0)
            written_rows = _read_csv(candidate_path)
            self.assertEqual(written_rows[0]["market_type"], "HIT")
            self.assertNotEqual(written_rows[0]["fair_probability"], "")
            self.assertEqual(written_rows[0]["promotion_eligibility"], "BET")
            self.assertEqual(written_rows[1]["market_type"], "HR")
            self.assertNotEqual(written_rows[1]["fair_probability"], "")
            self.assertNotEqual(written_rows[1]["promotion_eligibility"], "BET")

    def test_may14_hr_examples_remain_below_bet_due_to_missing_gates(self):
        run = probability_module.evaluate_slate(REPO_ROOT / "slates" / "2026-05-14", write=False)
        hr_results = [result for result in run.results if result.market_type == "HR"]

        self.assertGreaterEqual(len(hr_results), 1)
        self.assertTrue(all(result.promotion_eligibility != "BET" for result in hr_results))
        self.assertTrue(any(result.probability_risk_gates for result in hr_results))


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
        "missing_gates",
        "risk_flags",
        "supporting_factors",
        "odds_is_estimated",
        "current_odds_status",
        "player_active",
        "lineup_status",
        "lineup_confirmed",
        "starter_confirmed",
        "weather_status",
        "weather_confirmed",
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
        "missing_gates": "",
        "risk_flags": "",
        "supporting_factors": "",
        "odds_is_estimated": "false",
        "current_odds_status": "current",
        "player_active": "",
        "lineup_status": "",
        "lineup_confirmed": "",
        "starter_confirmed": "",
        "weather_status": "",
        "weather_confirmed": "",
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
