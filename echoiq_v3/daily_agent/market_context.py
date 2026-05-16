"""Market/news context overlays for Night Shift v3 research artifacts."""

from __future__ import annotations

from collections import defaultdict

from .odds_client import MARKET_NOTE_NO_FAIR_PROB
from .schemas import InjuryNewsRow, MarketSnapshotRow, MatchupNote, SlateGame, WatchlistEntry


BASE_V3_GATES = [
    "LINEUP_NOT_CONFIRMED",
    "STARTER_NOT_CONFIRMED",
    "WEATHER_NOT_VERIFIED",
    "ODDS_NOT_VERIFIED",
    "NEWS_NOT_VERIFIED",
]


def apply_v3_market_context(
    *,
    slate_games: list[SlateGame],
    matchup_notes: list[MatchupNote],
    watchlists: dict[str, list[WatchlistEntry]],
    market_rows: list[MarketSnapshotRow],
    injury_news: list[InjuryNewsRow],
) -> None:
    markets_by_game: dict[str, list[MarketSnapshotRow]] = defaultdict(list)
    for row in market_rows:
        markets_by_game[row.game_id].append(row)

    news_by_team: dict[str, list[InjuryNewsRow]] = defaultdict(list)
    news_by_player: dict[str, list[InjuryNewsRow]] = defaultdict(list)
    for row in injury_news:
        if row.team:
            news_by_team[row.team].append(row)
        if row.player_name:
            news_by_player[_norm(row.player_name)].append(row)

    games_by_id = {game.game_id: game for game in slate_games}
    for rows in watchlists.values():
        for row in rows:
            game = games_by_id.get(row.game_id)
            _enrich_watchlist_row(row, game, markets_by_game.get(row.game_id, []), news_by_player, news_by_team)

    for note in matchup_notes:
        game = games_by_id.get(note.game_id)
        game_markets = markets_by_game.get(note.game_id, [])
        team_news = []
        if game is not None:
            team_news.extend(news_by_team.get(game.away_team, []))
            team_news.extend(news_by_team.get(game.home_team, []))
        note.market_context = _market_context(game_markets)
        note.news_context = _news_context(team_news, bool(injury_news))
        note.unresolved_gaps = [*note.unresolved_gaps, *_context_gaps(note.market_context, note.news_context)]


def update_slate_odds_status(slate_games: list[SlateGame], market_rows: list[MarketSnapshotRow]) -> None:
    games_with_markets = {row.game_id for row in market_rows if row.status == "available"}
    for game in slate_games:
        if game.game_id in games_with_markets:
            game.odds_status = "GAME_MARKETS_AVAILABLE_RESEARCH_ONLY"
        else:
            game.odds_status = "UNVERIFIED"


def verification_gates_for_game(
    *,
    game: SlateGame | None,
    has_game_odds: bool,
    has_player_prop: bool,
    news_checked: bool,
    statcast_available: bool,
) -> list[str]:
    gates: list[str] = []
    if game is None or game.lineup_status != "CONFIRMED":
        gates.append("LINEUP_NOT_CONFIRMED")
    if game is None or not (game.away_probable_sp and game.home_probable_sp):
        gates.append("STARTER_NOT_CONFIRMED")
    if game is None or game.weather_status != "VERIFIED":
        gates.append("WEATHER_NOT_VERIFIED")
    if not has_game_odds:
        gates.append("ODDS_NOT_VERIFIED")
    if not news_checked:
        gates.append("NEWS_NOT_VERIFIED")
    if not has_player_prop:
        gates.append("PROP_NOT_AVAILABLE")
    if not statcast_available:
        gates.append("STATCAST_UNAVAILABLE")
    return gates


def _enrich_watchlist_row(
    row: WatchlistEntry,
    game: SlateGame | None,
    game_markets: list[MarketSnapshotRow],
    news_by_player: dict[str, list[InjuryNewsRow]],
    news_by_team: dict[str, list[InjuryNewsRow]],
) -> None:
    matching_markets = _matching_markets(row, game_markets)
    best = _best_price(matching_markets)
    row.odds_available = best is not None
    row.best_price = best.price if best is not None else None
    row.best_price_source = best.sportsbook if best is not None else ""
    row.implied_probability = best.implied_probability if best is not None else None
    row.market_last_updated = best.last_updated if best is not None else ""
    row.fair_probability = None
    row.edge = None
    row.playable_price_note = MARKET_NOTE_NO_FAIR_PROB if best is not None else _price_needed_note(row)
    row.market_status = "MARKET_AVAILABLE_RESEARCH_ONLY" if best is not None else _missing_market_status(row)

    player_news = news_by_player.get(_norm(row.player_name), []) if row.player_name else []
    team_news = news_by_team.get(row.team, [])
    row.injury_news_status = _injury_news_status(player_news, team_news)
    row.lineup_verification_status = game.lineup_status if game is not None else "UNVERIFIED"
    row.official_bet_eligible = False
    gates = verification_gates_for_game(
        game=game,
        has_game_odds=bool([market for market in game_markets if market.market_type in {"moneyline", "spread", "total"}]),
        has_player_prop=bool(matching_markets) and row.market != "Game line",
        news_checked=bool(player_news or team_news),
        statcast_available="statcast_missing" not in row.data_gaps,
    )
    if player_news or team_news:
        gates = [gate for gate in gates if gate != "NEWS_NOT_VERIFIED"]
    if row.market != "Game line" and not matching_markets and "PROP_NOT_AVAILABLE" not in gates:
        gates.append("PROP_NOT_AVAILABLE")
    row.verification_gates_missing = "; ".join(gates)
    row.risk_flags = _append_unique(row.risk_flags, "official_bet_eligible_false_v3")
    row.data_gaps = _append_unique(row.data_gaps, *gates)


def _matching_markets(row: WatchlistEntry, game_markets: list[MarketSnapshotRow]) -> list[MarketSnapshotRow]:
    if row.market == "Game line":
        return [market for market in game_markets if market.market_type == "moneyline" and market.team == row.team]
    if row.market == "HR":
        return [
            market
            for market in game_markets
            if market.player_name and _norm(market.player_name) == _norm(row.player_name) and "home" in market.market
        ]
    if row.market == "2+ TB":
        return [
            market
            for market in game_markets
            if market.player_name and _norm(market.player_name) == _norm(row.player_name) and "total_base" in market.market
        ]
    if row.market == "Hit":
        return [
            market
            for market in game_markets
            if market.player_name and _norm(market.player_name) == _norm(row.player_name) and "hit" in market.market
        ]
    return []


def _best_price(rows: list[MarketSnapshotRow]) -> MarketSnapshotRow | None:
    priced = [row for row in rows if row.price not in (None, "") and row.implied_probability is not None]
    if not priced:
        return None
    return sorted(priced, key=lambda row: float(row.price), reverse=True)[0]


def _missing_market_status(row: WatchlistEntry) -> str:
    if row.market == "Game line":
        return "ODDS_NOT_VERIFIED"
    return "PROP_NOT_AVAILABLE"


def _price_needed_note(row: WatchlistEntry) -> str:
    if row.market == "Game line":
        return "No verified game-market price in v3; do not play unless moneyline/spread/total is verified later."
    return "No verified player-prop price in v3; do not play unless the exact prop market is verified later."


def _injury_news_status(player_news: list[InjuryNewsRow], team_news: list[InjuryNewsRow]) -> str:
    if player_news:
        statuses = sorted({item.status or "UNVERIFIED" for item in player_news})
        return "PLAYER_NEWS_CHECKED:" + ",".join(statuses)
    if team_news:
        return "TEAM_NEWS_CHECKED"
    return "NEWS_NOT_VERIFIED"


def _market_context(rows: list[MarketSnapshotRow]) -> dict[str, object]:
    game_markets = [row for row in rows if not row.player_name and row.status == "available"]
    props = [row for row in rows if row.player_name and row.status == "available"]
    unavailable = []
    present_markets = {row.market for row in game_markets}
    for market in ["moneyline", "run_line", "total_over", "total_under", "first_five_moneyline", "first_five_spread", "first_five_total", "team_total"]:
        if market not in present_markets:
            unavailable.append(market)
    return {
        "game_markets_available": bool(game_markets),
        "player_props_available": bool(props),
        "notable_price_context": [_price_line(row) for row in game_markets[:6]],
        "unavailable_markets": unavailable,
        "odds_data_status": "ODDS_AVAILABLE" if game_markets else "ODDS_NOT_VERIFIED",
        "market_gaps": [] if game_markets else ["ODDS_NOT_VERIFIED", "PROP_NOT_AVAILABLE"],
    }


def _news_context(rows: list[InjuryNewsRow], any_news_checked: bool) -> dict[str, object]:
    return {
        "team_news": [_news_line(row) for row in rows[:12]],
        "player_news": [_news_line(row) for row in rows if row.player_name][:12],
        "injury_flags": [_news_line(row) for row in rows if row.injury_or_news_type][:12],
        "lineup_risk": "INJURY_STATUS_UNCLEAR" if rows else "NEWS_NOT_VERIFIED",
        "news_data_status": "NEWS_AVAILABLE" if rows else "NEWS_EMPTY" if any_news_checked else "NEWS_NOT_VERIFIED",
        "news_gaps": [] if rows else ["NEWS_NOT_VERIFIED", "INJURY_STATUS_UNCLEAR"],
    }


def _context_gaps(market_context: dict[str, object], news_context: dict[str, object]) -> list[str]:
    gaps: list[str] = []
    gaps.extend(str(item) for item in market_context.get("market_gaps", []) if item)
    gaps.extend(str(item) for item in news_context.get("news_gaps", []) if item)
    return gaps


def _price_line(row: MarketSnapshotRow) -> str:
    return f"{row.market} {row.team or row.player_name}: {row.price} at {row.sportsbook} (imp {row.implied_probability})"


def _news_line(row: InjuryNewsRow) -> str:
    subject = row.player_name or row.team or "Unknown"
    return f"{subject}: {row.status or 'UNVERIFIED'} {row.injury_or_news_type or ''}".strip()


def _append_unique(value: str, *items: str) -> str:
    parts = [part.strip() for part in str(value or "").split(";") if part.strip()]
    for item in items:
        if item and item not in parts:
            parts.append(item)
    return "; ".join(parts)


def _norm(value: str) -> str:
    return " ".join(str(value or "").lower().split())
