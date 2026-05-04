"""Live data adapters for EchoIQ HR Intelligence v1.

Phase 1 intentionally uses only the repo's existing public MLB Stats API
client. It does not call keyed odds, weather, Statcast, or sportsbook APIs.
"""
from __future__ import annotations

import csv
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame, MLBStatsClient
from black_sheep_mlb.data_sources.manual_market_provider import ManualMarketCSVProvider, normalize_market_type
from black_sheep_mlb.hr_intelligence.schema import HitterInput
from black_sheep_mlb.markets.schema import MarketSide, MarketType, PlayerPropMarket


VERIFIED = "verified"
ESTIMATED = "estimated"
MISSING = "missing"


@dataclass(frozen=True)
class ScheduleGame:
    game_pk: int
    date: str
    game: str
    away_team: str
    home_team: str
    status: str
    field_status: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class ProbablePitcher:
    game_pk: int
    team: str
    opponent: str
    pitcher_name: str
    pitcher_id: str
    side: str
    field_status: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class LineupEntry:
    game_pk: int
    game: str
    player_name: str
    player_id: str
    team: str
    opponent: str
    opposing_pitcher: str
    opposing_pitcher_id: str
    bat_side: str
    pitcher_hand: str
    lineup_spot: int
    lineup_status: str
    starter_status: str
    field_status: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class HROdds:
    date: str
    game_id: str
    game: str
    player_name: str
    player_id: str
    team: str
    opponent: str
    sportsbook: str
    market_name: str
    american_odds: int
    retrieved_at: str
    source_status: str
    provider: str
    source_notes: str = ""


@dataclass(frozen=True)
class HROddsResult:
    odds: list[HROdds]
    warnings: list[str] = field(default_factory=list)
    sources_checked: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class HybridRows:
    rows: list[HitterInput]
    metadata: dict[str, object]


def load_mlb_schedule(date: str, *, client: MLBStatsClient | None = None) -> list[ScheduleGame]:
    """Load real MLB schedule rows from the public MLB Stats API."""
    mlb_client = client or MLBStatsClient(timeout=10, retries=1)
    return [_schedule_game(game) for game in mlb_client.get_schedule(date)]


def load_probable_pitchers(
    date: str,
    *,
    client: MLBStatsClient | None = None,
    schedule: list[ScheduleGame] | None = None,
) -> list[ProbablePitcher]:
    """Load probable pitchers from the public MLB schedule response."""
    mlb_client = client or MLBStatsClient(timeout=10, retries=1)
    raw_games = _raw_games_from_schedule(date, mlb_client, schedule)
    pitchers: list[ProbablePitcher] = []
    for game in raw_games:
        pitchers.extend(_probable_pitchers_for_game(game))
    return pitchers


def load_lineups(
    date: str,
    *,
    client: MLBStatsClient | None = None,
    schedule: list[ScheduleGame] | None = None,
) -> list[LineupEntry]:
    """Load posted batting orders from MLB live game feeds when available."""
    mlb_client = client or MLBStatsClient(timeout=10, retries=1)
    raw_games = _raw_games_from_schedule(date, mlb_client, schedule)
    lineups: list[LineupEntry] = []
    for game in raw_games:
        try:
            feed = _get_game_feed(mlb_client, game.game_pk)
        except Exception:
            continue
        lineups.extend(_lineups_for_game(game, feed))
    return lineups


def load_hr_odds(
    date: str,
    *,
    game_keys: list[str] | None = None,
    provider: Any | None = None,
    root: Path | None = None,
) -> list[HROdds]:
    """Load verified hitter-level HR odds from existing repo market sources.

    This adapter does not scrape sportsbooks or make paid API calls. If a
    keyed provider is not already implemented for player props, it returns an
    empty list and leaves the pipeline non-actionable.
    """
    return _load_hr_odds_result(date, game_keys=game_keys, provider=provider, root=root).odds


def build_hybrid_rows(
    date: str,
    *,
    fixture_rows: list[HitterInput],
    client: MLBStatsClient | None = None,
) -> HybridRows:
    """Build HitterInput rows using live schedule/lineups and fixture stats.

    Real phase-1 fields: schedule, probable starters, posted lineups.
    Estimated phase-1 fields: hitter/pitcher Statcast-style features from
    fixture templates.
    Missing phase-1 fields: live HR odds, weather/park, true Statcast features.
    """
    mlb_client = client or MLBStatsClient(timeout=10, retries=1)
    warnings: list[str] = []
    try:
        schedule = load_mlb_schedule(date, client=mlb_client)
    except Exception as exc:
        schedule = []
        warnings.append(f"MLB schedule unavailable: {exc}")
    try:
        probables = load_probable_pitchers(date, client=mlb_client, schedule=schedule)
    except Exception as exc:
        probables = []
        warnings.append(f"MLB probable pitchers unavailable: {exc}")
    try:
        lineups = load_lineups(date, client=mlb_client, schedule=schedule)
    except Exception as exc:
        lineups = []
        warnings.append(f"MLB lineups unavailable: {exc}")
    odds_result = _load_hr_odds_result(date, game_keys=[game.game for game in schedule])
    warnings.extend(odds_result.warnings)
    odds_index = _index_best_hr_odds(odds_result.odds)

    if not lineups:
        return HybridRows(
            rows=_diagnostic_fixture_rows(date, fixture_rows, schedule_available=bool(schedule)),
            metadata={
                "source_status": "hybrid",
                "schedule_games": len(schedule),
                "probable_pitchers": len(probables),
                "lineup_entries": 0,
                "hr_odds_rows": len(odds_result.odds),
                "odds_sources_checked": odds_result.sources_checked,
                "warnings": warnings + ["No verified MLB lineup entries were available; emitted non-actionable fixture diagnostics."],
            },
        )

    rows = []
    for idx, entry in enumerate(lineups):
        template = fixture_rows[idx % len(fixture_rows)] if fixture_rows else HitterInput(
            date=date,
            game=entry.game,
            player_name=entry.player_name,
            team=entry.team,
            opponent=entry.opponent,
            opposing_pitcher=entry.opposing_pitcher,
        )
        odds = _best_odds_for_entry(entry, odds_index)
        rows.append(_hybrid_row_from_lineup(entry, template, date, odds=odds))

    return HybridRows(
        rows=rows,
        metadata={
            "source_status": "hybrid",
            "schedule_games": len(schedule),
            "probable_pitchers": len(probables),
            "lineup_entries": len(lineups),
            "hr_odds_rows": len(odds_result.odds),
            "odds_sources_checked": odds_result.sources_checked,
            "warnings": warnings,
        },
    )


def _load_hr_odds_result(
    date: str,
    *,
    game_keys: list[str] | None = None,
    provider: Any | None = None,
    root: Path | None = None,
) -> HROddsResult:
    repo_root = root or Path.cwd()
    warnings: list[str] = []
    sources_checked: list[str] = []
    odds: list[HROdds] = []

    if provider is not None:
        sources_checked.append(str(getattr(provider, "provider_name", provider.__class__.__name__)))
        try:
            markets = provider.get_player_prop_markets(
                date,
                game_keys=game_keys or None,
                markets=[MarketType.BATTER_HOME_RUNS.value],
            )
            odds.extend(_hr_odds_from_markets(date, markets))
        except Exception as exc:
            warnings.append(f"HR odds provider unavailable: {exc}")

    manual_snapshot = repo_root / "data" / "manual" / "market_snapshot.csv"
    if manual_snapshot.is_file():
        sources_checked.append(str(manual_snapshot))
        manual_provider = ManualMarketCSVProvider(manual_snapshot)
        odds.extend(
            _hr_odds_from_markets(
                date,
                manual_provider.get_player_prop_markets(
                    date,
                    game_keys=None,
                    markets=[MarketType.BATTER_HOME_RUNS.value],
                ),
            )
        )

    dated_props = repo_root / "data" / "manual" / date / "props.csv"
    if dated_props.is_file():
        sources_checked.append(str(dated_props))
        odds.extend(_hr_odds_from_dated_props_csv(date, dated_props))

    if not odds:
        if not os.environ.get("ODDS_API_KEY") and not os.environ.get("THE_ODDS_API_KEY"):
            warnings.append("No ODDS_API_KEY is present; live HR odds remain missing.")
        else:
            warnings.append("ODDS_API_KEY is present, but the existing repo provider does not expose HR player props yet.")
        if os.environ.get("SPORTSGAMEODDS_API_KEY"):
            warnings.append("SPORTSGAMEODDS_API_KEY is present, but live player-prop fetch is not implemented in the repo scaffold.")
        if not sources_checked:
            warnings.append("No dated manual HR prop CSV was found for this date.")

    return HROddsResult(odds=odds, warnings=warnings, sources_checked=sources_checked)


def _hr_odds_from_markets(date: str, markets: list[PlayerPropMarket]) -> list[HROdds]:
    rows: list[HROdds] = []
    for market in markets:
        market_type = getattr(market, "market_type", "")
        if (
            _market_type_value(market_type) != MarketType.BATTER_HOME_RUNS.value
            and normalize_market_type(market_type) != MarketType.BATTER_HOME_RUNS
        ):
            continue
        if not _is_yes_side(getattr(market, "side", "")):
            continue
        price = _parse_american_odds(getattr(market, "price", None))
        if price is None:
            continue
        player_name = str(getattr(market, "player_name", "") or "")
        if not player_name:
            continue
        rows.append(
            HROdds(
                date=date,
                game_id=str(getattr(market, "provider_event_id", "") or ""),
                game=str(getattr(market, "game_key", "") or ""),
                player_name=player_name,
                player_id=str(getattr(market, "player_id", "") or ""),
                team=str(getattr(market, "team", "") or ""),
                opponent="",
                sportsbook=str(getattr(market, "sportsbook", "") or getattr(market, "provider", "") or ""),
                market_name=MarketType.BATTER_HOME_RUNS.value,
                american_odds=price,
                retrieved_at=str(getattr(market, "timestamp", "") or _now_utc()),
                source_status=f"odds={VERIFIED}",
                provider=str(getattr(market, "provider", "") or ""),
                source_notes=str(getattr(market, "source_confidence", "") or ""),
            )
        )
    return rows


def _hr_odds_from_dated_props_csv(date: str, path: Path) -> list[HROdds]:
    rows: list[HROdds] = []
    with path.open(newline="", encoding="utf-8") as handle:
        for raw in csv.DictReader(handle):
            if str(raw.get("date") or "").strip() != date:
                continue
            if normalize_market_type(raw.get("prop_type")) != MarketType.BATTER_HOME_RUNS:
                continue
            price = _best_price_from_manual_row(raw)
            if price is None:
                continue
            player_name = str(raw.get("player") or raw.get("player_name") or "").strip()
            if not player_name:
                continue
            away = str(raw.get("away_team") or "").strip()
            home = str(raw.get("home_team") or "").strip()
            rows.append(
                HROdds(
                    date=date,
                    game_id=str(raw.get("game_id") or "").strip(),
                    game=f"{away}@{home}" if away and home else "",
                    player_name=player_name,
                    player_id=str(raw.get("player_id") or "").strip(),
                    team=str(raw.get("team") or "").strip(),
                    opponent=str(raw.get("opponent") or "").strip(),
                    sportsbook=str(raw.get("sportsbook") or raw.get("source") or "manual").strip(),
                    market_name="home_runs",
                    american_odds=price,
                    retrieved_at=str(raw.get("timestamp") or "").strip() or _now_utc(),
                    source_status=f"odds={VERIFIED}",
                    provider=str(raw.get("source") or "manual_props_csv").strip(),
                    source_notes=str(raw.get("reason") or raw.get("confidence") or "").strip(),
                )
            )
    return rows


def _best_price_from_manual_row(row: dict[str, str]) -> int | None:
    for key in ("best_price", "over_price", "consensus_price"):
        price = _parse_american_odds(row.get(key))
        if price is not None:
            return price
    return None


def _index_best_hr_odds(odds_rows: list[HROdds]) -> dict[str, dict[str, HROdds]]:
    index: dict[str, dict[str, HROdds]] = {"player_id": {}, "player_team": {}, "player_game": {}}
    for odds in odds_rows:
        keys = {
            "player_id": str(odds.player_id or ""),
            "player_team": f"{_normalize_text(odds.player_name)}|{_normalize_text(odds.team)}",
            "player_game": f"{_normalize_text(odds.player_name)}|{_normalize_game_key(odds.game)}",
        }
        for bucket, key in keys.items():
            if not key.strip("|"):
                continue
            current = index[bucket].get(key)
            if current is None or odds.american_odds > current.american_odds:
                index[bucket][key] = odds
    return index


def _best_odds_for_entry(entry: LineupEntry, odds_index: dict[str, dict[str, HROdds]]) -> HROdds | None:
    lookups = [
        ("player_id", str(entry.player_id or "")),
        ("player_team", f"{_normalize_text(entry.player_name)}|{_normalize_text(entry.team)}"),
        ("player_game", f"{_normalize_text(entry.player_name)}|{_normalize_game_key(entry.game)}"),
    ]
    for bucket, key in lookups:
        if key and key in odds_index.get(bucket, {}):
            return odds_index[bucket][key]
    return None


def _schedule_game(game: MLBGame) -> ScheduleGame:
    away = game.away_team or ""
    home = game.home_team or ""
    return ScheduleGame(
        game_pk=game.game_pk,
        date=game.game_date,
        game=f"{away}@{home}",
        away_team=away,
        home_team=home,
        status=game.status or "",
        field_status={
            "game_pk": VERIFIED,
            "date": VERIFIED,
            "away_team": VERIFIED if away else MISSING,
            "home_team": VERIFIED if home else MISSING,
            "status": VERIFIED if game.status else MISSING,
        },
    )


def _raw_games_from_schedule(
    date: str,
    client: MLBStatsClient,
    schedule: list[ScheduleGame] | None,
) -> list[MLBGame]:
    if schedule is None:
        return client.get_schedule(date)
    raw_by_pk = {game.game_pk: game for game in client.get_schedule(date)}
    return [raw_by_pk[item.game_pk] for item in schedule if item.game_pk in raw_by_pk]


def _get_game_feed(client: MLBStatsClient, game_pk: int) -> dict:
    # The repo client owns request/retry behavior; MLB live feeds are exposed on v1.1.
    return client._get_json(f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live")


def _probable_pitchers_for_game(game: MLBGame) -> list[ProbablePitcher]:
    return [
        ProbablePitcher(
            game_pk=game.game_pk,
            team=game.away_team,
            opponent=game.home_team,
            pitcher_name=game.away_probable_pitcher or "",
            pitcher_id=str(game.away_probable_pitcher_id or ""),
            side="away",
            field_status={
                "team": VERIFIED if game.away_team else MISSING,
                "opponent": VERIFIED if game.home_team else MISSING,
                "pitcher_name": VERIFIED if game.away_probable_pitcher else MISSING,
                "pitcher_id": VERIFIED if game.away_probable_pitcher_id else MISSING,
            },
        ),
        ProbablePitcher(
            game_pk=game.game_pk,
            team=game.home_team,
            opponent=game.away_team,
            pitcher_name=game.home_probable_pitcher or "",
            pitcher_id=str(game.home_probable_pitcher_id or ""),
            side="home",
            field_status={
                "team": VERIFIED if game.home_team else MISSING,
                "opponent": VERIFIED if game.away_team else MISSING,
                "pitcher_name": VERIFIED if game.home_probable_pitcher else MISSING,
                "pitcher_id": VERIFIED if game.home_probable_pitcher_id else MISSING,
            },
        ),
    ]


def _lineups_for_game(game: MLBGame, feed: dict) -> list[LineupEntry]:
    boxscore = ((feed.get("liveData") or {}).get("boxscore") or {}).get("teams") or {}
    game_players = (feed.get("gameData") or {}).get("players") or {}
    away_pitcher_hand = _player_hand(game_players, game.home_probable_pitcher_id, "pitchHand")
    home_pitcher_hand = _player_hand(game_players, game.away_probable_pitcher_id, "pitchHand")
    return (
        _lineup_entries_for_side(
            game,
            boxscore.get("away") or {},
            side="away",
            opposing_pitcher=game.home_probable_pitcher or "",
            opposing_pitcher_id=str(game.home_probable_pitcher_id or ""),
            pitcher_hand=away_pitcher_hand,
            game_players=game_players,
        )
        + _lineup_entries_for_side(
            game,
            boxscore.get("home") or {},
            side="home",
            opposing_pitcher=game.away_probable_pitcher or "",
            opposing_pitcher_id=str(game.away_probable_pitcher_id or ""),
            pitcher_hand=home_pitcher_hand,
            game_players=game_players,
        )
    )


def _lineup_entries_for_side(
    game: MLBGame,
    team_box: dict,
    *,
    side: str,
    opposing_pitcher: str,
    opposing_pitcher_id: str,
    pitcher_hand: str,
    game_players: dict,
) -> list[LineupEntry]:
    batting_order = team_box.get("battingOrder") or []
    players = team_box.get("players") or {}
    if not batting_order:
        return []
    team = game.away_team if side == "away" else game.home_team
    opponent = game.home_team if side == "away" else game.away_team
    entries = []
    for idx, raw_player_id in enumerate(batting_order, start=1):
        key = f"ID{raw_player_id}"
        player = players.get(key) or {}
        person = player.get("person") or {}
        name = str(person.get("fullName") or "")
        player_id = str(person.get("id") or raw_player_id or "")
        bat_side = (
            ((player.get("batSide") or {}).get("code") or "")
            or _player_hand(game_players, _safe_int(player_id), "batSide")
        ).upper()
        entries.append(
            LineupEntry(
                game_pk=game.game_pk,
                game=f"{game.away_team}@{game.home_team}",
                player_name=name,
                player_id=player_id,
                team=team,
                opponent=opponent,
                opposing_pitcher=opposing_pitcher,
                opposing_pitcher_id=opposing_pitcher_id,
                bat_side=bat_side,
                pitcher_hand=pitcher_hand,
                lineup_spot=idx,
                lineup_status="confirmed",
                starter_status="confirmed" if opposing_pitcher else "unconfirmed",
                field_status={
                    "player_name": VERIFIED if name else MISSING,
                    "player_id": VERIFIED if player_id else MISSING,
                    "team": VERIFIED if team else MISSING,
                    "opponent": VERIFIED if opponent else MISSING,
                    "opposing_pitcher": VERIFIED if opposing_pitcher else MISSING,
                    "opposing_pitcher_id": VERIFIED if opposing_pitcher_id else MISSING,
                    "bat_side": VERIFIED if bat_side else MISSING,
                    "pitcher_hand": VERIFIED if pitcher_hand else MISSING,
                    "lineup_status": VERIFIED,
                    "lineup_spot": VERIFIED,
                    "starter_status": VERIFIED if opposing_pitcher else MISSING,
                },
            )
        )
    return entries


def _player_hand(game_players: dict, player_id: int | None, hand_key: str) -> str:
    if not player_id:
        return ""
    player = game_players.get(f"ID{player_id}") or {}
    return str(((player.get(hand_key) or {}).get("code") or "")).upper()


def _safe_int(value: str) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _hybrid_row_from_lineup(entry: LineupEntry, template: HitterInput, date: str, *, odds: HROdds | None) -> HitterInput:
    source_status = _source_status(entry, odds=odds)
    source_notes = (
        "Hybrid v1: MLB Stats API schedule/probables/lineups; fixture contact and pitcher "
        "features; weather/park and live Statcast feature adapters not yet connected."
    )
    if odds is None:
        source_notes += " No verified HR odds were available for this hitter."
    else:
        source_notes += (
            f" HR odds verified from {odds.sportsbook or odds.provider} at {odds.american_odds} "
            f"retrieved_at={odds.retrieved_at}."
        )
    return HitterInput(
        date=date,
        game=entry.game,
        player_name=entry.player_name,
        player_id=entry.player_id,
        team=entry.team,
        opponent=entry.opponent,
        opposing_pitcher=entry.opposing_pitcher or "missing",
        opposing_pitcher_id=entry.opposing_pitcher_id,
        bat_side=entry.bat_side,
        pitcher_hand=entry.pitcher_hand,
        lineup_status=entry.lineup_status,
        lineup_spot=entry.lineup_spot,
        starter_status=entry.starter_status,
        barrel_pct=template.barrel_pct,
        hardhit_pct=template.hardhit_pct,
        iso=template.iso,
        xslg=template.xslg,
        pull_air_pct=template.pull_air_pct,
        last14_barrel_pct=template.last14_barrel_pct,
        last14_hardhit_pct=template.last14_hardhit_pct,
        last14_avg_ev=template.last14_avg_ev,
        last14_sweetspot_pct=template.last14_sweetspot_pct,
        pitcher_hr9=template.pitcher_hr9,
        pitcher_barrel_allowed_pct=template.pitcher_barrel_allowed_pct,
        pitcher_hardhit_allowed_pct=template.pitcher_hardhit_allowed_pct,
        pitcher_fb_pct=template.pitcher_fb_pct,
        platoon_xslg_allowed=template.platoon_xslg_allowed,
        pitch_matchup_score=template.pitch_matchup_score,
        park_weather_hr_boost=None,
        pa_expectation=template.pa_expectation,
        hr_odds=odds.american_odds if odds else None,
        risk_score=template.risk_score,
        source_status=source_status,
        source_notes=source_notes,
    )


def _diagnostic_fixture_rows(date: str, fixture_rows: list[HitterInput], *, schedule_available: bool) -> list[HitterInput]:
    rows = []
    for row in fixture_rows:
        rows.append(
            HitterInput(
                **{
                    **row.__dict__,
                    "date": date,
                    "lineup_status": "unconfirmed",
                    "starter_status": "unconfirmed",
                    "hr_odds": None,
                    "source_status": (
                        f"schedule={VERIFIED if schedule_available else MISSING};"
                        f"player={ESTIMATED};team={ESTIMATED};opponent={ESTIMATED};"
                        f"opposing_pitcher={ESTIMATED};lineup={MISSING};starter={MISSING};"
                        f"stats=fixture_only;odds={MISSING};weather={MISSING};statcast={MISSING}"
                    ),
                    "source_notes": "Hybrid v1 could not load verified lineup rows; fixture diagnostics are non-actionable.",
                }
            )
        )
    return rows


def _source_status(entry: LineupEntry, *, odds: HROdds | None) -> str:
    statuses = {
        "schedule": VERIFIED,
        "player": entry.field_status.get("player_name", MISSING),
        "team": entry.field_status.get("team", MISSING),
        "opponent": entry.field_status.get("opponent", MISSING),
        "opposing_pitcher": entry.field_status.get("opposing_pitcher", MISSING),
        "bat_side": entry.field_status.get("bat_side", MISSING),
        "pitcher_hand": entry.field_status.get("pitcher_hand", MISSING),
        "lineup": entry.field_status.get("lineup_status", MISSING),
        "lineup_spot": entry.field_status.get("lineup_spot", MISSING),
        "starter": entry.field_status.get("starter_status", MISSING),
        "stats": ESTIMATED,
        "odds": VERIFIED if odds else MISSING,
        "weather": MISSING,
        "statcast": MISSING,
    }
    return ";".join(f"{key}={value}" for key, value in statuses.items())


def _parse_american_odds(value: Any) -> int | None:
    raw = str(value or "").strip().replace("+", "")
    if not raw:
        return None
    try:
        price = int(float(raw))
    except (TypeError, ValueError):
        return None
    if price == 0:
        return None
    return price


def _is_yes_side(value: Any) -> bool:
    raw = getattr(value, "value", value)
    return str(raw or "").strip().lower() in {
        "",
        "yes",
        "over",
        "participant",
        "unknown",
        str(MarketSide.YES.value),
        str(MarketSide.OVER.value),
        str(MarketSide.PARTICIPANT.value),
    }


def _market_type_value(value: Any) -> str:
    raw = getattr(value, "value", value)
    return str(raw or "").strip().lower()


def _normalize_game_key(value: str) -> str:
    return _normalize_text(value).replace(" @ ", "@")


def _normalize_text(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()
