"""Deterministic EchoIQ v3 probability framework v1.

The v1 engine is intentionally small and auditable. It supports only HIT and
TB props, consumes existing EchoIQ slate rows, and emits a component ledger
instead of hiding decisions behind a black-box score.
"""

from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


SUPPORTED_MARKETS = {"HIT", "TB"}
OUTPUT_COLUMNS = [
    "fair_odds",
    "edge_pct",
    "promotion_eligibility",
    "audit_ledger",
]
KEY_FIELDS = ["slate_date", "game", "market_type", "team", "player", "line"]
PASSED_GATE_STATUSES = {"PASSED", "CLEARED"}
CLEAR_KILL_SWITCHES = {"", "CLEAR", "CLEARED", "NONE", "NO", "FALSE"}
TRUE_VALUES = {"1", "TRUE", "YES", "Y"}


@dataclass(frozen=True)
class MarketConfig:
    market_type: str
    baseline_probability: float
    edge_threshold: float
    min_probability: float
    max_probability: float
    confidence_scale: dict[str, float]


@dataclass(frozen=True)
class ProbabilityResult:
    market_type: str
    fair_probability: float
    implied_probability: float | None
    fair_odds: int
    edge: float | None
    edge_pct: float | None
    confidence_tier: str
    gate_status: str
    promotion_eligibility: str
    kill_switch: str
    audit_ledger: str
    kill_flags: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class SlateProbabilityRun:
    slate_path: Path
    evaluated_rows: int
    skipped_rows: int
    candidate_path: Path
    verification_path: Path
    wrote_files: bool
    results: list[ProbabilityResult]


def load_market_configs(path: Path | None = None) -> dict[str, MarketConfig]:
    config_path = path or Path(__file__).resolve().parent / "config" / "probability_framework_v1.csv"
    configs: dict[str, MarketConfig] = {}
    with config_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            market_type = row["market_type"].strip().upper()
            configs[market_type] = MarketConfig(
                market_type=market_type,
                baseline_probability=float(row["baseline_probability"]),
                edge_threshold=float(row["edge_threshold"]),
                min_probability=float(row["min_probability"]),
                max_probability=float(row["max_probability"]),
                confidence_scale={
                    "A": float(row["confidence_a"]),
                    "B": float(row["confidence_b"]),
                    "C": float(row["confidence_c"]),
                    "D": float(row["confidence_d"]),
                    "F": float(row["confidence_f"]),
                    "": 0.0,
                },
            )
    return configs


def evaluate_row(
    candidate: dict[str, str],
    *,
    verification: dict[str, str] | None = None,
    weather: dict[str, str] | None = None,
    pitcher: dict[str, str] | None = None,
    lineup: dict[str, str] | None = None,
    configs: dict[str, MarketConfig] | None = None,
) -> ProbabilityResult | None:
    configs = configs or load_market_configs()
    market_type = (candidate.get("market_type") or "").strip().upper()
    config = configs.get(market_type)
    if config is None:
        return None

    verification = verification or {}
    weather = weather or {}
    pitcher = pitcher or {}
    lineup = lineup or {}
    context_text = _context_text(candidate, verification, weather, pitcher, lineup)
    source_confidence = _first_present(candidate, verification, "source_confidence").upper()
    confidence_scale = config.confidence_scale.get(source_confidence, 0.0)

    ledger: list[dict[str, float | str]] = [
        {"component": "baseline", "value": round(config.baseline_probability, 4), "reason": f"{market_type} v1 baseline"}
    ]

    probability = config.baseline_probability
    for name, value, reason in _positive_adjustments(market_type, context_text, candidate, verification, lineup):
        probability += value
        ledger.append({"component": name, "value": round(value, 4), "reason": reason})
    for name, value, reason in _negative_adjustments(market_type, context_text, candidate, verification, weather, pitcher):
        probability -= value
        ledger.append({"component": name, "value": round(-value, 4), "reason": reason})

    probability = _clamp(probability, config.min_probability, config.max_probability)
    ledger.append({"component": "bounded_probability", "value": round(probability, 4), "reason": "market min/max clamp"})

    probability = _clamp(probability * confidence_scale, 0.0, config.max_probability)
    ledger.append(
        {
            "component": "confidence_scale",
            "value": round(confidence_scale, 4),
            "reason": f"source_confidence={source_confidence or 'missing'}",
        }
    )

    implied_probability, odds_status = american_odds_to_implied_probability(candidate.get("odds"))
    edge = None if implied_probability is None else probability - implied_probability
    edge_pct = None if edge is None else edge * 100.0
    fair_odds = fair_odds_from_probability(probability)

    kill_flags = _kill_flags(candidate, verification, odds_status, source_confidence, edge, config.edge_threshold)
    gate_status = _gate_status(candidate, verification, kill_flags, edge, config.edge_threshold)
    promotion_eligibility = _promotion_eligibility(
        candidate,
        verification,
        source_confidence,
        edge,
        config.edge_threshold,
        gate_status,
        kill_flags,
    )
    confidence_tier = _confidence_tier(source_confidence, edge, config.edge_threshold, kill_flags)
    kill_switch = _merged_kill_switch(candidate, verification, kill_flags)

    ledger.extend(
        [
            {
                "component": "implied_probability",
                "value": "" if implied_probability is None else round(implied_probability, 4),
                "reason": odds_status,
            },
            {"component": "fair_odds", "value": fair_odds, "reason": "converted from fair_probability"},
            {"component": "edge_pct", "value": "" if edge_pct is None else round(edge_pct, 2), "reason": "fair minus implied, percentage points"},
            {"component": "promotion_cap", "value": promotion_eligibility, "reason": gate_status},
        ]
    )

    return ProbabilityResult(
        market_type=market_type,
        fair_probability=round(probability, 4),
        implied_probability=None if implied_probability is None else round(implied_probability, 4),
        fair_odds=fair_odds,
        edge=None if edge is None else round(edge, 4),
        edge_pct=None if edge_pct is None else round(edge_pct, 2),
        confidence_tier=confidence_tier,
        gate_status=gate_status,
        promotion_eligibility=promotion_eligibility,
        kill_switch=kill_switch,
        audit_ledger=json.dumps(ledger, separators=(",", ":")),
        kill_flags=tuple(kill_flags),
    )


def evaluate_slate(slate_path: Path | str, *, write: bool = False) -> SlateProbabilityRun:
    slate_path = Path(slate_path)
    candidate_path = slate_path / "02_candidates" / "candidate_board.csv"
    verification_path = slate_path / "03_verification" / "verification_board.csv"
    weather_path = slate_path / "01_raw_research" / "weather_park_board.csv"
    pitcher_path = slate_path / "01_raw_research" / "pitcher_vulnerability_board.csv"
    lineup_path = slate_path / "01_raw_research" / "lineup_cluster_board.csv"

    candidate_rows, candidate_headers = _read_csv(candidate_path)
    verification_rows, verification_headers = _read_csv(verification_path)
    weather_rows, _ = _read_csv(weather_path)
    pitcher_rows, _ = _read_csv(pitcher_path)
    lineup_rows, _ = _read_csv(lineup_path)

    verification_index = {_row_key(row): row for row in verification_rows}
    weather_index = {_simple_key(row, ["slate_date", "game"]): row for row in weather_rows}
    pitcher_index = {_simple_key(row, ["slate_date", "game", "pitcher"]): row for row in pitcher_rows}
    lineup_index = {_simple_key(row, ["slate_date", "game", "team"]): row for row in lineup_rows}

    results: list[ProbabilityResult] = []
    skipped_rows = 0
    for row in candidate_rows:
        market_type = (row.get("market_type") or "").strip().upper()
        if market_type not in SUPPORTED_MARKETS:
            skipped_rows += 1
            continue
        verification = verification_index.get(_row_key(row), {})
        weather = weather_index.get(_simple_key(row, ["slate_date", "game"]), {})
        pitcher = pitcher_index.get(_simple_key(row, ["slate_date", "game", "pitcher"]), {})
        lineup = lineup_index.get(_simple_key(row, ["slate_date", "game", "team"]), {})
        result = evaluate_row(row, verification=verification, weather=weather, pitcher=pitcher, lineup=lineup)
        if result is None:
            skipped_rows += 1
            continue
        _apply_result(row, result)
        matched_verification = verification_index.get(_row_key(row))
        if matched_verification is not None:
            _apply_result(matched_verification, result)
        results.append(result)

    if write:
        _write_csv(candidate_path, candidate_rows, _extend_headers(candidate_headers, OUTPUT_COLUMNS))
        _write_csv(verification_path, verification_rows, _extend_headers(verification_headers, OUTPUT_COLUMNS))

    return SlateProbabilityRun(
        slate_path=slate_path,
        evaluated_rows=len(results),
        skipped_rows=skipped_rows,
        candidate_path=candidate_path,
        verification_path=verification_path,
        wrote_files=write,
        results=results,
    )


def american_odds_to_implied_probability(value: str | None) -> tuple[float | None, str]:
    text = (value or "").strip()
    if not text:
        return None, "odds_missing"
    matches = re.findall(r"(?<![\d.])[+-]\d{2,4}(?![\d.])", text)
    if len(matches) != 1:
        return None, "odds_ambiguous"
    odds = int(matches[0])
    if odds > 0:
        return 100.0 / (odds + 100.0), "odds_exact"
    return abs(odds) / (abs(odds) + 100.0), "odds_exact"


def fair_odds_from_probability(probability: float) -> int:
    probability = _clamp(probability, 0.0001, 0.9999)
    if probability >= 0.5:
        return round(-100.0 * probability / (1.0 - probability))
    return round(100.0 * (1.0 - probability) / probability)


def _positive_adjustments(
    market_type: str,
    text: str,
    candidate: dict[str, str],
    verification: dict[str, str],
    lineup: dict[str, str],
) -> Iterable[tuple[str, float, str]]:
    if re.search(r"confirmed\s+(no\.?|#)?\s*[1-3]\b|leadoff|top-two|top two", text):
        yield "lineup_slot_boost", 0.025 if market_type == "HIT" else 0.020, "confirmed premium lineup slot"
    elif re.search(r"middle order|cleanup|confirmed\s+(no\.?|#)?\s*[4-5]\b", text):
        yield "lineup_slot_boost", 0.010, "confirmed middle-order role"

    if re.search(r"high-floor|hot form|recent form|stable floor|cleaner fit|covers .*projection|projection", text):
        yield "research_support_boost", 0.020 if market_type == "HIT" else 0.015, "research packet supports market fit"

    if re.search(r"favorable weather|weather help|weather boost|wind .*out|breeze out|park_weather_multiplier", text):
        yield "environment_boost", 0.010 if market_type == "TB" else 0.005, "environment text is favorable"

    if _truthy(candidate.get("gates_passed")) or _truthy(verification.get("gates_passed")):
        yield "verified_gate_boost", 0.010, "upstream gates_passed true"

    cluster_score = _as_float(lineup.get("top6_barrel_score"))
    if cluster_score is not None and cluster_score >= 70:
        yield "lineup_cluster_boost", 0.010, "lineup cluster score >= 70"


def _negative_adjustments(
    market_type: str,
    text: str,
    candidate: dict[str, str],
    verification: dict[str, str],
    weather: dict[str, str],
    pitcher: dict[str, str],
) -> Iterable[tuple[str, float, str]]:
    if _first_present(candidate, verification, "gate_conditions"):
        yield "open_gate_penalty", 0.035, "gate_conditions remain open"

    if re.search(r"delay|rain|restart|relisted|weather.*risk|lineup recheck", text):
        yield "weather_or_recheck_penalty", 0.035, "delay/weather/recheck risk remains"

    if re.search(r"lineup gap|giants lineup|full .*lineup context|tbd|projected", text):
        yield "lineup_uncertainty_penalty", 0.030, "lineup context is incomplete"

    if re.search(r"wind in|suppression|lefty-lefty|pitcher quality|bullpen check|pitch cap|small-sample", text):
        yield "matchup_risk_penalty", 0.020, "matchup or volatility risk remains"

    if re.search(r"steep price", text):
        yield "price_fragility_penalty", 0.010, "expensive hit price noted"

    weather_confidence = (weather.get("source_confidence") or "").strip().upper()
    if weather and weather_confidence in {"C", "D", "F"}:
        yield "weather_confidence_penalty", 0.015, f"weather source_confidence={weather_confidence}"

    volatility = _as_float(pitcher.get("volatility_score"))
    if volatility is not None and volatility >= 70:
        yield "pitcher_volatility_penalty", 0.015, "pitcher volatility score >= 70"


def _kill_flags(
    candidate: dict[str, str],
    verification: dict[str, str],
    odds_status: str,
    source_confidence: str,
    edge: float | None,
    edge_threshold: float,
) -> list[str]:
    flags: list[str] = []
    label = _first_present(candidate, verification, "label").upper()
    gate_status = _first_present(candidate, verification, "gate_status").upper()
    kill_switch = _first_present(candidate, verification, "kill_switch").upper()
    if label in {"PASS", "AVOID", "EXTERNAL"}:
        flags.append(f"LABEL_{label}")
    if odds_status != "odds_exact":
        flags.append(odds_status.upper())
    if _truthy(_first_present(candidate, verification, "odds_estimated")):
        flags.append("ODDS_ESTIMATED")
    if source_confidence not in {"A", "B"}:
        flags.append(f"SOURCE_CONFIDENCE_{source_confidence or 'MISSING'}")
    if gate_status and gate_status not in PASSED_GATE_STATUSES:
        flags.append(f"GATE_{gate_status}")
    if kill_switch and kill_switch not in CLEAR_KILL_SWITCHES:
        flags.append(f"KILL_SWITCH_{kill_switch}")
    if _first_present(candidate, verification, "gate_conditions"):
        flags.append("OPEN_GATE_CONDITIONS")
    if edge is None:
        flags.append("EDGE_MISSING")
    elif edge < edge_threshold:
        flags.append("EDGE_BELOW_THRESHOLD")
    return flags


def _gate_status(
    candidate: dict[str, str],
    verification: dict[str, str],
    kill_flags: list[str],
    edge: float | None,
    edge_threshold: float,
) -> str:
    existing = _first_present(candidate, verification, "gate_status").upper()
    if existing in {"FAILED", "BLOCKED"} or any(flag.startswith("LABEL_AVOID") for flag in kill_flags):
        return "BLOCKED"
    if existing == "CONDITIONAL" or "OPEN_GATE_CONDITIONS" in kill_flags:
        return "CONDITIONAL"
    if kill_flags:
        return "PENDING"
    if edge is not None and edge >= edge_threshold:
        return "PASSED"
    return "PENDING"


def _promotion_eligibility(
    candidate: dict[str, str],
    verification: dict[str, str],
    source_confidence: str,
    edge: float | None,
    edge_threshold: float,
    gate_status: str,
    kill_flags: list[str],
) -> str:
    existing_label = _first_present(candidate, verification, "label").upper()
    if existing_label in {"PASS", "AVOID"}:
        return existing_label
    if source_confidence == "F":
        return "PASS"
    if gate_status == "CONDITIONAL" or "OPEN_GATE_CONDITIONS" in kill_flags:
        return "CONDITIONAL"
    if source_confidence == "D":
        return "WATCHLIST"
    if source_confidence == "C":
        return "LEAN" if edge is not None and edge > 0 else "WATCHLIST"
    if kill_flags:
        return "LEAN" if edge is not None and edge > 0 and "EDGE_BELOW_THRESHOLD" in kill_flags else "WATCHLIST"
    if gate_status in PASSED_GATE_STATUSES and source_confidence in {"A", "B"} and edge is not None and edge >= edge_threshold:
        return "BET"
    if edge is not None and edge > 0:
        return "LEAN"
    return "WATCHLIST"


def _confidence_tier(source_confidence: str, edge: float | None, edge_threshold: float, kill_flags: list[str]) -> str:
    if source_confidence not in {"A", "B"}:
        return source_confidence.title() if source_confidence else "Missing"
    if kill_flags and any(flag not in {"EDGE_BELOW_THRESHOLD"} for flag in kill_flags):
        return f"{source_confidence}-capped"
    if edge is not None and edge >= edge_threshold:
        return f"{source_confidence}-edge"
    return f"{source_confidence}-lean"


def _merged_kill_switch(candidate: dict[str, str], verification: dict[str, str], kill_flags: list[str]) -> str:
    existing = _first_present(candidate, verification, "kill_switch")
    if kill_flags:
        return ";".join(kill_flags)
    return existing or "CLEAR"


def _apply_result(row: dict[str, str], result: ProbabilityResult) -> None:
    row["fair_probability"] = f"{result.fair_probability:.4f}"
    row["implied_probability"] = "" if result.implied_probability is None else f"{result.implied_probability:.4f}"
    row["fair_odds"] = str(result.fair_odds)
    row["edge"] = "" if result.edge is None else f"{result.edge:.4f}"
    row["edge_pct"] = "" if result.edge_pct is None else f"{result.edge_pct:.2f}"
    row["confidence_tier"] = result.confidence_tier
    row["gate_status"] = result.gate_status
    row["promotion_eligibility"] = result.promotion_eligibility
    row["kill_switch"] = result.kill_switch
    row["audit_ledger"] = result.audit_ledger


def _read_csv(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    if not path.exists():
        return [], []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return list(reader), list(reader.fieldnames or [])


def _write_csv(path: Path, rows: list[dict[str, str]], headers: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def _extend_headers(headers: list[str], additions: list[str]) -> list[str]:
    result = list(headers)
    for column in additions:
        if column not in result:
            result.append(column)
    return result


def _row_key(row: dict[str, str]) -> tuple[str, ...]:
    return _simple_key(row, KEY_FIELDS)


def _simple_key(row: dict[str, str], fields: list[str]) -> tuple[str, ...]:
    return tuple((row.get(field) or "").strip().lower() for field in fields)


def _context_text(*rows: dict[str, str]) -> str:
    chunks: list[str] = []
    for row in rows:
        chunks.extend(str(value) for value in row.values() if value)
    return " ".join(chunks).lower()


def _first_present(*rows_and_field: object) -> str:
    *rows, field = rows_and_field
    for row in rows:
        if isinstance(row, dict):
            value = row.get(str(field))
            if value is not None and str(value).strip():
                return str(value).strip()
    return ""


def _truthy(value: str | None) -> bool:
    return (value or "").strip().upper() in TRUE_VALUES


def _as_float(value: str | None) -> float | None:
    if value is None or str(value).strip() == "":
        return None
    try:
        return float(str(value).strip().replace("%", ""))
    except ValueError:
        return None


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))
