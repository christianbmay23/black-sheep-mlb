"""Deterministic EchoIQ v3 probability framework v1.1.

The engine is intentionally small and auditable. It supports HIT, TB, and
conservative HR props, consumes existing EchoIQ slate rows, and emits a
component ledger instead of hiding decisions behind a black-box score.
"""

from __future__ import annotations

import csv
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


SUPPORTED_MARKETS = {"HIT", "TB", "HR"}
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
FALSE_VALUES = {"0", "FALSE", "NO", "N"}
HR_LATE_LIVE_ODDS_STATUSES = {"LIVE", "LATE LIVE", "VERIFIED", "LATE-VERIFIED"}
ODDS_AMBIGUOUS_STATUS = "odds_ambiguous"

FIELD_GROUPS = {
    "lineup": ("lineup_status", "lineup_slot", "batting_order_slot"),
    "supporting": ("supporting_factors", "supporting_factor", "research_support"),
    "risk": ("risk_flags", "risk_flag"),
    "gate": ("gate_conditions", "missing_gates"),
    "weather": ("weather_status", "weather_park_context", "park_weather_context", "environment_label", "weather_override"),
    "odds": ("current_odds_status", "odds_status"),
}

PROMOTION_ONLY_GATE_PHRASES = {
    "fair_probability_not_loaded": (
        "fair probability not loaded",
        "fair probability",
        "fair probability loaded: no",
    ),
    "edge_not_loaded": (
        "edge not loaded",
        "edge loaded: no",
    ),
    "kill_switch_not_reviewed": (
        "kill switch not yet reviewed",
        "kill switch clear: no",
    ),
    "missing_timestamp": (
        "missing timestamp",
        "timestamp missing",
    ),
    "missing_final_review": (
        "missing final review",
        "final review",
    ),
    "incomplete_administrative_verification": (
        "incomplete administrative verification",
        "administrative verification",
        "fair price",
    ),
}

PROBABILITY_RISK_GATE_PHRASES = {
    "player_not_confirmed_active": (
        "player not confirmed active",
        "inactive player",
        "not active",
    ),
    "lineup_not_confirmed": (
        "lineup not confirmed",
        "lineup recheck",
        "lineup gap",
        "lineup conflict",
        "full lineup context",
        "projected lineup",
    ),
    "starter_not_confirmed": (
        "starter not confirmed",
        "starter unconfirmed",
        "probable starter",
    ),
    "stale_odds": (
        "stale odds",
        "morning-only",
        "morning only",
        "not late-live verified",
        "need live price check",
        "captured in report only",
        "article-only",
        "article only",
    ),
    "ambiguous_odds": (
        "ambiguous odds",
        "split market",
        "range",
        "best shown",
    ),
    "weather_delay_restart_risk": (
        "weather delay",
        "delay resolution",
        "restart risk",
        "rain delay",
        "relisted odds",
        "relisted market",
        "new first-pitch time",
        "wind in",
    ),
    "pitcher_opener_uncertainty": (
        "opener uncertainty",
        "pitcher uncertainty",
        "bullpen confirmation",
        "bullpen map",
        "pitch cap",
        "opener",
    ),
    "confirmed_injury_scratch_risk": (
        "injury",
        "scratch",
        "late scratch",
    ),
    "game_already_started": (
        "game already started",
        "in progress",
        "live game",
    ),
    "conflicting_sources": (
        "conflicting sources",
        "source conflict",
        "sources conflict",
    ),
}

LINEUP_SLOT_BOOST_PHRASES = {
    "premium": ("leadoff", "top two", "top-two", "confirmed no. 1", "confirmed #1", "confirmed no. 2", "confirmed #2", "confirmed no. 3", "confirmed #3"),
    "middle": ("middle order", "cleanup", "confirmed no. 4", "confirmed #4", "confirmed no. 5", "confirmed #5"),
}
SUPPORT_BOOST_PHRASES = ("high-floor", "hot form", "recent form", "stable floor", "cleaner fit", "projection", "statcast", "barrel")
ENVIRONMENT_BOOST_PHRASES = ("favorable weather", "weather help", "weather boost", "wind out", "breeze out", "park_weather_multiplier", "carry boost")
MATCHUP_RISK_PHRASES = ("wind in", "suppression", "lefty-lefty", "pitcher quality", "bullpen check", "pitch cap", "small-sample")


@dataclass(frozen=True)
class MarketConfig:
    market_type: str
    baseline_probability: float
    edge_threshold: float
    min_probability: float
    max_probability: float
    confidence_scale: dict[str, float]
    premium_lineup_slot_boost: float
    middle_lineup_slot_boost: float
    research_support_boost: float
    environment_boost: float
    verified_gate_boost: float
    lineup_cluster_boost: float
    probability_risk_gate_penalty: float
    weather_delay_penalty: float
    lineup_uncertainty_penalty: float
    matchup_risk_penalty: float
    price_fragility_penalty: float
    weather_confidence_penalty: float
    pitcher_volatility_penalty: float
    ambiguous_odds_penalty: float


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
    promotion_only_gates: tuple[str, ...] = field(default_factory=tuple)
    probability_risk_gates: tuple[str, ...] = field(default_factory=tuple)


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
                premium_lineup_slot_boost=_config_float(row, "premium_lineup_slot_boost", 0.025 if market_type == "HIT" else 0.020),
                middle_lineup_slot_boost=_config_float(row, "middle_lineup_slot_boost", 0.010),
                research_support_boost=_config_float(row, "research_support_boost", 0.020 if market_type == "HIT" else 0.015),
                environment_boost=_config_float(row, "environment_boost", 0.010 if market_type == "TB" else 0.005),
                verified_gate_boost=_config_float(row, "verified_gate_boost", 0.010),
                lineup_cluster_boost=_config_float(row, "lineup_cluster_boost", 0.010),
                probability_risk_gate_penalty=_config_float(row, "probability_risk_gate_penalty", 0.035),
                weather_delay_penalty=_config_float(row, "weather_delay_penalty", 0.035),
                lineup_uncertainty_penalty=_config_float(row, "lineup_uncertainty_penalty", 0.030),
                matchup_risk_penalty=_config_float(row, "matchup_risk_penalty", 0.020),
                price_fragility_penalty=_config_float(row, "price_fragility_penalty", 0.010),
                weather_confidence_penalty=_config_float(row, "weather_confidence_penalty", 0.015),
                pitcher_volatility_penalty=_config_float(row, "pitcher_volatility_penalty", 0.015),
                ambiguous_odds_penalty=_config_float(row, "ambiguous_odds_penalty", 0.020),
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
    context = StructuredContext(candidate=candidate, verification=verification, weather=weather, pitcher=pitcher, lineup=lineup)
    source_confidence = _first_present(candidate, verification, "source_confidence").upper()
    confidence_scale = config.confidence_scale.get(source_confidence, 0.0)
    implied_probability, odds_status = american_odds_to_implied_probability(candidate.get("odds"))
    promotion_only_gates, probability_risk_gates = _classify_gates(market_type, context, odds_status)

    ledger: list[dict[str, float | str]] = [
        {"component": "baseline", "value": round(config.baseline_probability, 4), "reason": f"{market_type} v1.1 baseline"}
    ]

    probability = config.baseline_probability
    for gate in promotion_only_gates:
        ledger.append({"component": "promotion_block_only", "value": gate, "reason": "open structured gate does not reduce fair_probability"})

    for name, value, reason in _positive_adjustments(market_type, context, config):
        probability += value
        ledger.append({"component": name, "value": round(value, 4), "reason": reason})
    for name, value, reason in _negative_adjustments(market_type, context, config, probability_risk_gates, odds_status):
        probability -= value
        component = "probability_penalty" if name.startswith("gate_") or name == "ambiguous_odds_penalty" else name
        ledger.append({"component": component, "value": round(-value, 4), "reason": reason})

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

    edge = None if implied_probability is None else probability - implied_probability
    edge_pct = None if edge is None else edge * 100.0
    fair_odds = fair_odds_from_probability(probability)

    kill_flags = _kill_flags(candidate, verification, context, odds_status, source_confidence, edge, config.edge_threshold, promotion_only_gates, probability_risk_gates)
    gate_status = _gate_status(candidate, verification, kill_flags, edge, config.edge_threshold, promotion_only_gates, probability_risk_gates)
    promotion_eligibility = _promotion_eligibility(
        candidate,
        verification,
        source_confidence,
        edge,
        config.edge_threshold,
        gate_status,
        kill_flags,
        promotion_only_gates,
        probability_risk_gates,
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
        promotion_only_gates=tuple(promotion_only_gates),
        probability_risk_gates=tuple(probability_risk_gates),
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
    if not _is_clean_american_odds(text):
        return None, ODDS_AMBIGUOUS_STATUS
    odds = int(text)
    if odds > 0:
        return 100.0 / (odds + 100.0), "odds_exact"
    return abs(odds) / (abs(odds) + 100.0), "odds_exact"


def fair_odds_from_probability(probability: float) -> int:
    probability = _clamp(probability, 0.0001, 0.9999)
    if probability >= 0.5:
        return round(-100.0 * probability / (1.0 - probability))
    return round(100.0 * (1.0 - probability) / probability)


@dataclass(frozen=True)
class StructuredContext:
    candidate: dict[str, str]
    verification: dict[str, str]
    weather: dict[str, str]
    pitcher: dict[str, str]
    lineup: dict[str, str]

    def first(self, field: str) -> str:
        return _first_present(self.candidate, self.verification, self.weather, self.pitcher, self.lineup, field)

    def values(self, fields: Iterable[str], *, include_weather: bool = False) -> list[str]:
        rows = [self.candidate, self.verification, self.lineup, self.pitcher]
        if include_weather:
            rows.append(self.weather)
        values: list[str] = []
        for row in rows:
            for field in fields:
                value = row.get(field)
                if value is not None and str(value).strip():
                    values.append(str(value).strip())
        return values


def _positive_adjustments(
    market_type: str,
    context: StructuredContext,
    config: MarketConfig,
) -> Iterable[tuple[str, float, str]]:
    lineup_text = _joined_lower(context.values(FIELD_GROUPS["lineup"]))
    if _contains_any(lineup_text, LINEUP_SLOT_BOOST_PHRASES["premium"]):
        yield "lineup_slot_boost", config.premium_lineup_slot_boost, "structured lineup field shows premium slot"
    elif _contains_any(lineup_text, LINEUP_SLOT_BOOST_PHRASES["middle"]):
        yield "lineup_slot_boost", config.middle_lineup_slot_boost, "structured lineup field shows middle-order role"

    support_text = _joined_lower(context.values(FIELD_GROUPS["supporting"]))
    if _contains_any(support_text, SUPPORT_BOOST_PHRASES):
        yield "research_support_boost", config.research_support_boost, "structured supporting_factors field supports market fit"

    weather_text = _joined_lower(context.values(FIELD_GROUPS["weather"], include_weather=True))
    if _contains_any(weather_text, ENVIRONMENT_BOOST_PHRASES):
        yield "environment_boost", config.environment_boost, "structured weather field is favorable"

    if _truthy(context.candidate.get("gates_passed")) or _truthy(context.verification.get("gates_passed")):
        yield "verified_gate_boost", config.verified_gate_boost, "upstream gates_passed true"

    cluster_score = _as_float(context.lineup.get("top6_barrel_score"))
    if cluster_score is not None and cluster_score >= 70:
        yield "lineup_cluster_boost", config.lineup_cluster_boost, "lineup cluster score >= 70"


def _negative_adjustments(
    market_type: str,
    context: StructuredContext,
    config: MarketConfig,
    probability_risk_gates: list[str],
    odds_status: str,
) -> Iterable[tuple[str, float, str]]:
    for gate in probability_risk_gates:
        penalty = config.weather_delay_penalty if gate == "weather_delay_restart_risk" else config.probability_risk_gate_penalty
        yield f"gate_{gate}", penalty, f"structured probability_risk_gate={gate}"

    if odds_status == ODDS_AMBIGUOUS_STATUS:
        yield "ambiguous_odds_penalty", config.ambiguous_odds_penalty, "odds field is not one clean American price"

    risk_text = _joined_lower(context.values(FIELD_GROUPS["risk"]))
    if _contains_any(risk_text, MATCHUP_RISK_PHRASES):
        yield "matchup_risk_penalty", config.matchup_risk_penalty, "structured risk_flags show matchup or volatility risk"

    lineup_text = _joined_lower(context.values(FIELD_GROUPS["lineup"]))
    if _contains_any(lineup_text, ("lineup gap", "tbd", "projected", "unconfirmed")):
        yield "lineup_uncertainty_penalty", config.lineup_uncertainty_penalty, "structured lineup field is incomplete"

    odds_text = _joined_lower(context.values(FIELD_GROUPS["odds"]))
    if "steep price" in odds_text:
        yield "price_fragility_penalty", config.price_fragility_penalty, "structured odds status notes steep price"

    weather_confidence = (context.weather.get("source_confidence") or "").strip().upper()
    if context.weather and weather_confidence in {"C", "D", "F"}:
        yield "weather_confidence_penalty", config.weather_confidence_penalty, f"weather source_confidence={weather_confidence}"

    volatility = _as_float(context.pitcher.get("volatility_score"))
    if volatility is not None and volatility >= 70:
        yield "pitcher_volatility_penalty", config.pitcher_volatility_penalty, "pitcher volatility score >= 70"


def _kill_flags(
    candidate: dict[str, str],
    verification: dict[str, str],
    context: StructuredContext,
    odds_status: str,
    source_confidence: str,
    edge: float | None,
    edge_threshold: float,
    promotion_only_gates: list[str],
    probability_risk_gates: list[str],
) -> list[str]:
    flags: list[str] = []
    label = _first_present(candidate, verification, "label").upper()
    gate_status = _first_present(candidate, verification, "gate_status").upper()
    kill_switch = _first_present(candidate, verification, "kill_switch").upper()
    if label in {"PASS", "AVOID", "EXTERNAL"}:
        flags.append(f"LABEL_{label}")
    if odds_status != "odds_exact":
        flags.append(odds_status.upper())
    if _truthy(_first_present(candidate, verification, "odds_estimated")) or _truthy(_first_present(candidate, verification, "odds_is_estimated")):
        flags.append("ODDS_ESTIMATED")
    if source_confidence not in {"A", "B"}:
        flags.append(f"SOURCE_CONFIDENCE_{source_confidence or 'MISSING'}")
    if gate_status and gate_status not in PASSED_GATE_STATUSES:
        flags.append(f"GATE_{gate_status}")
    if kill_switch and kill_switch not in CLEAR_KILL_SWITCHES:
        flags.append(f"KILL_SWITCH_{kill_switch}")
    if promotion_only_gates:
        flags.append("PROMOTION_ONLY_GATES")
    if probability_risk_gates:
        flags.append("PROBABILITY_RISK_GATES")
    if _hr_public_article_only(context):
        flags.append("HR_PUBLIC_ARTICLE_ONLY")
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
    promotion_only_gates: list[str],
    probability_risk_gates: list[str],
) -> str:
    existing = _first_present(candidate, verification, "gate_status").upper()
    if existing in {"FAILED", "BLOCKED"} or any(flag.startswith("LABEL_AVOID") for flag in kill_flags):
        return "BLOCKED"
    if existing == "CONDITIONAL" or promotion_only_gates or probability_risk_gates:
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
    promotion_only_gates: list[str],
    probability_risk_gates: list[str],
) -> str:
    existing_label = _first_present(candidate, verification, "label").upper()
    if existing_label in {"PASS", "AVOID"}:
        return existing_label
    if source_confidence == "F":
        return "PASS"
    if gate_status == "CONDITIONAL" and _first_present(candidate, verification, "label").upper() == "CONDITIONAL":
        return "CONDITIONAL"
    if promotion_only_gates or probability_risk_gates:
        return "LEAN" if edge is not None and edge > 0 and source_confidence in {"A", "B", "C"} else "WATCHLIST"
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


def _classify_gates(market_type: str, context: StructuredContext, odds_status: str) -> tuple[list[str], list[str]]:
    promotion_only: list[str] = []
    probability_risk: list[str] = []

    gate_text = _joined_lower(context.values(FIELD_GROUPS["gate"]))
    risk_text = _joined_lower(context.values(FIELD_GROUPS["risk"]))
    odds_text = _joined_lower(context.values(FIELD_GROUPS["odds"]))
    weather_text = _joined_lower(context.values(FIELD_GROUPS["weather"], include_weather=True))
    lineup_text = _joined_lower(context.values(FIELD_GROUPS["lineup"]))
    combined_structured_gate_text = " ".join([gate_text, risk_text, odds_text, weather_text, lineup_text])

    for gate, phrases in PROMOTION_ONLY_GATE_PHRASES.items():
        if _contains_any(combined_structured_gate_text, phrases):
            _append_unique(promotion_only, gate)
    for gate, phrases in PROBABILITY_RISK_GATE_PHRASES.items():
        if _contains_any(combined_structured_gate_text, phrases):
            _append_unique(probability_risk, gate)

    if odds_status == ODDS_AMBIGUOUS_STATUS:
        _append_unique(probability_risk, "ambiguous_odds")

    _append_status_gate(probability_risk, "player_active", context.first("player_active"), "player_not_confirmed_active")
    _append_status_gate(probability_risk, "lineup_confirmed", context.first("lineup_confirmed") or context.first("lineup_status"), "lineup_not_confirmed")
    _append_status_gate(probability_risk, "starter_confirmed", context.first("starter_confirmed") or context.first("starter_status"), "starter_not_confirmed")
    _append_status_gate(probability_risk, "weather_confirmed", context.first("weather_confirmed") or context.first("weather_status"), "weather_context_missing")

    current_odds_status = context.first("current_odds_status") or context.first("odds_status")
    if current_odds_status and _normalized(current_odds_status).upper() not in HR_LATE_LIVE_ODDS_STATUSES:
        if _contains_any(_normalized(current_odds_status), ("stale", "morning", "article", "not late-live", "report only", "ambiguous")):
            _append_unique(probability_risk, "stale_odds")

    if market_type == "HR":
        _append_hr_required_gate(probability_risk, context, "player_active", "player_not_confirmed_active")
        _append_hr_required_gate(probability_risk, context, "lineup_confirmed", "lineup_not_confirmed")
        _append_hr_required_gate(probability_risk, context, "starter_confirmed", "starter_not_confirmed")
        if not _hr_weather_context_confirmed(context):
            _append_unique(probability_risk, "weather_context_missing")
        if _normalized(current_odds_status).upper() not in HR_LATE_LIVE_ODDS_STATUSES:
            _append_unique(probability_risk, "stale_odds")

    return promotion_only, probability_risk


def _append_status_gate(gates: list[str], field: str, value: str, gate: str) -> None:
    if not value:
        return
    status = _status_bool(value)
    if status is False:
        _append_unique(gates, gate)


def _append_hr_required_gate(gates: list[str], context: StructuredContext, field: str, gate: str) -> None:
    value = context.first(field)
    if field == "lineup_confirmed":
        value = value or context.first("lineup_status")
    if field == "starter_confirmed":
        value = value or context.first("starter_status")
    if _status_bool(value) is not True:
        _append_unique(gates, gate)


def _hr_weather_context_confirmed(context: StructuredContext) -> bool:
    if _status_bool(context.first("weather_confirmed")) is True:
        return True
    weather_status = context.first("weather_status")
    if _status_bool(weather_status) is True:
        return True
    weather_context = _joined_lower(context.values(FIELD_GROUPS["weather"], include_weather=True))
    return bool(weather_context) and not _contains_any(weather_context, ("missing", "unverified", "unknown", "tbd"))


def _hr_public_article_only(context: StructuredContext) -> bool:
    if (context.first("market_type") or "").upper() != "HR":
        return False
    source_type = _normalized(context.first("source_type"))
    source = _normalized(context.first("source"))
    support = _joined_lower(context.values(FIELD_GROUPS["supporting"]))
    return (
        ("external" in source_type or "article" in source_type or "public" in source_type)
        and not support
        and ("echoiq" not in source and "model" not in source)
    )


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


def _status_bool(value: str | None) -> bool | None:
    normalized = _normalized(value).upper()
    if not normalized:
        return None
    if normalized in TRUE_VALUES or normalized in PASSED_GATE_STATUSES:
        return True
    if normalized in FALSE_VALUES or normalized in {"MISSING", "UNVERIFIED", "UNCONFIRMED", "PROJECTED", "PENDING", "TBD", "NO LINEUP", "INACTIVE"}:
        return False
    if "CONFIRMED" in normalized and "NOT CONFIRMED" not in normalized and "UNCONFIRMED" not in normalized:
        return True
    if any(token in normalized for token in ("NOT CONFIRMED", "UNCONFIRMED", "PROJECTED", "TBD", "MISSING", "UNKNOWN")):
        return False
    return None


def _as_float(value: str | None) -> float | None:
    if value is None or str(value).strip() == "":
        return None
    try:
        return float(str(value).strip().replace("%", ""))
    except ValueError:
        return None


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _config_float(row: dict[str, str], field: str, default: float) -> float:
    value = row.get(field)
    if value is None or str(value).strip() == "":
        return default
    return float(str(value).strip())


def _is_clean_american_odds(text: str) -> bool:
    if " " in text:
        return False
    if text[0:1] not in {"+", "-"}:
        return False
    digits = text[1:]
    return digits.isdigit() and 2 <= len(digits) <= 4


def _normalized(value: str | None) -> str:
    return " ".join(str(value or "").strip().replace("_", " ").split())


def _joined_lower(values: Iterable[str]) -> str:
    return " | ".join(_normalized(value).lower() for value in values if _normalized(value))


def _contains_any(text: str, phrases: Iterable[str]) -> bool:
    if not text:
        return False
    return any(phrase in text for phrase in phrases)


def _append_unique(values: list[str], value: str) -> None:
    if value not in values:
        values.append(value)
