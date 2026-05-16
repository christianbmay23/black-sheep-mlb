"""First-pass matchup notes and preliminary watchlist generation."""

from __future__ import annotations

from collections import defaultdict

from .schemas import BullpenFatigue, MatchupNote, PlayerPerformance, SlateGame, WatchlistEntry


def build_matchup_notes_and_watchlists(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    previous_players: list[PlayerPerformance],
    bullpen_fatigue: list[BullpenFatigue],
    retrieved_at: str,
) -> tuple[list[MatchupNote], dict[str, list[WatchlistEntry]]]:
    team_to_game: dict[str, SlateGame] = {}
    for game in slate_games:
        team_to_game[game.away_team] = game
        team_to_game[game.home_team] = game

    fatigue_by_team = {row.team: row for row in bullpen_fatigue}
    players_by_team: dict[str, list[PlayerPerformance]] = defaultdict(list)
    for row in previous_players:
        players_by_team[row.team].append(row)

    notes: list[MatchupNote] = []
    for game in slate_games:
        away_fatigue = fatigue_by_team.get(game.away_team)
        home_fatigue = fatigue_by_team.get(game.home_team)
        team_context = [
            "Team recent-form context uses previous-day boxscore plus Statcast carryover when available.",
        ]
        for team in (game.away_team, game.home_team):
            candidates = players_by_team.get(team, [])
            if candidates:
                team_context.append(f"{team}: {len(candidates)} previous-day hitter rows available.")
                statcast_hits = [row for row in candidates if _has_any(row, {"LOUD_CONTACT_BAD_BOX", "LOUD_CONTACT_CONFIRMED_RESULT", "HR_QUALITY_SIGNAL", "TB_QUALITY_SIGNAL"})]
                if statcast_hits:
                    team_context.append(f"{team}: {len(statcast_hits)} previous-day Statcast contact-quality signal rows.")
        bullpen_context = []
        for label, fatigue in ((game.away_team, away_fatigue), (game.home_team, home_fatigue)):
            if fatigue is None:
                bullpen_context.append(f"{label}: no previous-day bullpen row found.")
            else:
                bullpen_context.append(f"{label}: {fatigue.fatigue_level} fatigue proxy ({fatigue.notes})")
        unresolved = [
            "Lineups are not final unless MLB schedule includes posted lineup players.",
            "Weather/roof context is placeholder-only in v2.",
            "Pitch-type vulnerabilities are limited to pitcher pitch-mix notes in v2; batter-vs-pitcher history is not loaded.",
            "Odds and player-prop prices are not loaded in Night Shift MVP.",
        ]
        notes.append(
            MatchupNote(
                game_id=game.game_id,
                game=f"{game.away_team}@{game.home_team}",
                team_context=team_context,
                sp_context=[
                    f"{game.away_team} probable SP: {game.away_probable_sp or 'TBD'}",
                    f"{game.home_team} probable SP: {game.home_probable_sp or 'TBD'}",
                ],
                hitter_matchup_context=[
                    "Preliminary hitter notes use previous-day boxscore form only; do not over-weight one game."
                ],
                pitch_type_context=["Limited in v2 to pitcher pitch-mix notes; batter pitch-type performance is pending."],
                bullpen_context=bullpen_context,
                weather_park_context=["Weather and park run/HR environment are unverified placeholders in v2."],
                historical_matchup_context=[
                    "Batter-vs-pitcher history is not loaded; when added, treat tiny samples as context only."
                ],
                statcast_context=_statcast_context_for_game(game, players_by_team),
                market_context={
                    "game_markets_available": False,
                    "player_props_available": False,
                    "notable_price_context": [],
                    "unavailable_markets": ["moneyline", "run_line", "total", "player_props"],
                    "odds_data_status": "ODDS_NOT_VERIFIED",
                    "market_gaps": ["ODDS_NOT_VERIFIED", "PROP_NOT_AVAILABLE"],
                },
                news_context={
                    "team_news": [],
                    "player_news": [],
                    "injury_flags": [],
                    "lineup_risk": "NEWS_NOT_VERIFIED",
                    "news_data_status": "NEWS_NOT_VERIFIED",
                    "news_gaps": ["NEWS_NOT_VERIFIED", "INJURY_STATUS_UNCLEAR"],
                },
                watchlist_rationale=[
                    "Generated candidates are research lanes only and require later lineup, starter, weather, odds, and prop verification.",
                    "Statcast-backed tags can bump a row into watchlist review, but they are not betting edge.",
                ],
                unresolved_gaps=unresolved,
            )
        )

    watchlists = {
        "hr": _build_player_watchlist(
            slate_date=slate_date,
            market="HR",
            signal_type="previous_day_power_boxscore",
            team_to_game=team_to_game,
            previous_players=previous_players,
            retrieved_at=retrieved_at,
            predicate=lambda row: int(row.home_runs or 0) > 0 or int(row.total_bases or 0) >= 4,
            statcast_tags={"LOUD_CONTACT_BAD_BOX", "LOUD_CONTACT_CONFIRMED_RESULT", "HR_QUALITY_SIGNAL"},
        ),
        "total_bases": _build_player_watchlist(
            slate_date=slate_date,
            market="2+ TB",
            signal_type="previous_day_total_bases_boxscore",
            team_to_game=team_to_game,
            previous_players=previous_players,
            retrieved_at=retrieved_at,
            predicate=lambda row: int(row.total_bases or 0) >= 2 or int(row.hits or 0) >= 2,
            statcast_tags={"LOUD_CONTACT_BAD_BOX", "LOUD_CONTACT_CONFIRMED_RESULT", "TB_QUALITY_SIGNAL", "HR_QUALITY_SIGNAL"},
        ),
        "hits": _build_player_watchlist(
            slate_date=slate_date,
            market="Hit",
            signal_type="previous_day_contact_boxscore",
            team_to_game=team_to_game,
            previous_players=previous_players,
            retrieved_at=retrieved_at,
            predicate=lambda row: int(row.hits or 0) >= 2 and int(row.strikeouts or 0) <= 1,
            statcast_tags={"LOUD_CONTACT_BAD_BOX", "CONTACT_QUALITY_SIGNAL"},
        ),
        "game_line": _build_game_line_leans(
            slate_date=slate_date,
            slate_games=slate_games,
            fatigue_by_team=fatigue_by_team,
            retrieved_at=retrieved_at,
        ),
    }
    return notes, watchlists


def _build_player_watchlist(
    *,
    slate_date: str,
    market: str,
    signal_type: str,
    team_to_game: dict[str, SlateGame],
    previous_players: list[PlayerPerformance],
    retrieved_at: str,
    predicate,
    statcast_tags: set[str],
) -> list[WatchlistEntry]:
    rows: list[WatchlistEntry] = []
    seen: set[tuple[str, str]] = set()
    for player in previous_players:
        game = team_to_game.get(player.team)
        matched_statcast = _has_any(player, statcast_tags) and not _has_any(player, {"WEAK_CONTACT_GOOD_BOX", "LOW_QUALITY_CONTACT"})
        if game is None or not (predicate(player) or matched_statcast):
            continue
        opponent = game.home_team if player.team == game.away_team else game.away_team
        key = (player.player_name, market)
        if key in seen:
            continue
        seen.add(key)
        hits = int(player.hits or 0)
        tb = int(player.total_bases or 0)
        hr = int(player.home_runs or 0)
        source_summary = "MLB Stats API previous-day boxscore"
        supporting = ["previous_day_boxscore", "team_on_next_slate"]
        data_gaps = ["pitch_type_missing", "player_prop_price_missing"]
        if player.statcast_data_status == "enriched":
            source_summary += "; Baseball Savant Statcast"
            supporting.append(f"statcast_tags={player.statcast_signal_tags}")
        else:
            data_gaps.append("statcast_missing")
        rows.append(
            WatchlistEntry(
                slate_date=slate_date,
                game_id=game.game_id,
                player_name=player.player_name,
                team=player.team,
                opponent=opponent,
                market=market,
                signal_type=f"{signal_type}+statcast" if matched_statcast else signal_type,
                confidence="LOW_TO_MEDIUM" if matched_statcast and market != "HR" else "LOW",
                label="WATCHLIST",
                reason=(
                    f"Previous-day boxscore signal: {hits} H, {tb} TB, {hr} HR. "
                    f"{player.statcast_signal_note} Use as a research lane only."
                ),
                supporting_factors="; ".join(supporting),
                risk_flags="lineup_unverified; odds_unverified; weather_unverified; one_game_sample",
                data_gaps="; ".join(data_gaps),
                source_summary=source_summary,
                retrieved_at=retrieved_at,
            )
        )
    return rows


def _build_game_line_leans(
    *,
    slate_date: str,
    slate_games: list[SlateGame],
    fatigue_by_team: dict[str, BullpenFatigue],
    retrieved_at: str,
) -> list[WatchlistEntry]:
    rows: list[WatchlistEntry] = []
    for game in slate_games:
        away = fatigue_by_team.get(game.away_team)
        home = fatigue_by_team.get(game.home_team)
        away_level = away.fatigue_level if away is not None else "UNKNOWN"
        home_level = home.fatigue_level if home is not None else "UNKNOWN"
        if away_level in {"HIGH", "EXTREME"} and home_level not in {"HIGH", "EXTREME"}:
            rows.append(_game_line_entry(slate_date, game, game.home_team, game.away_team, away_level, retrieved_at))
        elif home_level in {"HIGH", "EXTREME"} and away_level not in {"HIGH", "EXTREME"}:
            rows.append(_game_line_entry(slate_date, game, game.away_team, game.home_team, home_level, retrieved_at))
    return rows


def _game_line_entry(
    slate_date: str,
    game: SlateGame,
    team: str,
    opponent: str,
    opponent_fatigue_level: str,
    retrieved_at: str,
) -> WatchlistEntry:
    return WatchlistEntry(
        slate_date=slate_date,
        game_id=game.game_id,
        player_name="",
        team=team,
        opponent=opponent,
        market="Game line",
        signal_type="opponent_bullpen_fatigue_proxy",
        confidence="LOW",
        label="WATCHLIST",
        reason=f"{opponent} shows {opponent_fatigue_level} previous-day bullpen fatigue proxy.",
        supporting_factors="previous_day_bullpen_usage",
        risk_flags="moneyline_unverified; lineup_unverified; starter_status_unverified; fatigue_proxy_only",
        data_gaps="odds_missing; back_to_back_usage_missing; leverage_index_missing",
        source_summary="MLB Stats API boxscore bullpen proxy",
        retrieved_at=retrieved_at,
    )


def _statcast_context_for_game(game: SlateGame, players_by_team: dict[str, list[PlayerPerformance]]) -> list[str]:
    out: list[str] = []
    for team in (game.away_team, game.home_team):
        rows = players_by_team.get(team, [])
        for row in rows:
            if _has_any(row, {"LOUD_CONTACT_BAD_BOX", "LOUD_CONTACT_CONFIRMED_RESULT", "HR_QUALITY_SIGNAL", "TB_QUALITY_SIGNAL"}):
                out.append(f"{row.player_name} ({team}): {row.statcast_signal_tags} - {row.statcast_signal_note}")
    if not out:
        out.append("No prior-day Statcast contact-quality bump found for this matchup, or Statcast unavailable.")
    return out[:12]


def _has_any(player: PlayerPerformance, tags: set[str]) -> bool:
    player_tags = {part.strip() for part in str(player.statcast_signal_tags or "").split(";") if part.strip()}
    return bool(player_tags & tags)
