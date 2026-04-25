"""No-odds-first daily prediction pipeline."""
from __future__ import annotations

import argparse
import csv
import json
import logging
from dataclasses import asdict
from pathlib import Path
from typing import Any

from black_sheep_mlb.config.settings import load_settings
from black_sheep_mlb.data_sources.mlb_stats_client import MLBGame, MLBStatsClient
from black_sheep_mlb.data_sources.odds_provider import GameOdds, OddsProvider
from black_sheep_mlb.pipelines.build_daily_slate import build_daily_slate
from black_sheep_mlb.pipelines.enrich_matchups import enrich_matchups
from black_sheep_mlb.pipelines.fetch_market_snapshots import build_odds_provider
from black_sheep_mlb.pipelines.market_overlay import best_h2h_for_team, compute_edge, no_vig_for_h2h

logger = logging.getLogger(__name__)


def _game_key(game: MLBGame) -> str:
    return f"{game.away_team}@{game.home_team}"


def generate_predictions(enriched_games: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Generate odds-independent game predictions.

    The current production-quality game model needs lineups, starter features,
    bullpen, weather, and recent-form inputs. This daily provider path does not
    fabricate those fields, so it emits neutral fair probabilities with explicit
    low-confidence/missing-feature provenance until the richer feature builder is
    wired in.
    """
    rows: list[dict[str, Any]] = []
    for item in enriched_games:
        game: MLBGame = item["game"]
        missing = []
        if not game.away_probable_pitcher:
            missing.append("away_probable_pitcher")
        if not game.home_probable_pitcher:
            missing.append("home_probable_pitcher")
        missing.extend(["lineups", "weather", "bullpen", "recent_form"])
        rows.append(
            {
                "game_pk": game.game_pk,
                "game_date": game.game_date,
                "game_datetime": game.game_datetime,
                "away_team": game.away_team,
                "home_team": game.home_team,
                "away_probable_pitcher": game.away_probable_pitcher,
                "home_probable_pitcher": game.home_probable_pitcher,
                "model_away_win_prob": 0.5,
                "model_home_win_prob": 0.5,
                "confidence": "Low",
                "prediction": "PASS",
                "missing_data_flags": ",".join(missing),
                "free_data_status": item.get("free_data_status", "unknown"),
            }
        )
    return rows


def _rank_for_odds(predictions: list[dict[str, Any]], max_games: int, odds_all: bool) -> list[dict[str, Any]]:
    if odds_all:
        return list(predictions)
    return sorted(
        predictions,
        key=lambda row: max(
            abs(float(row.get("model_away_win_prob") or 0.5) - 0.5),
            abs(float(row.get("model_home_win_prob") or 0.5) - 0.5),
        ),
        reverse=True,
    )[:max_games]


def _match_odds(prediction: dict[str, Any], odds: list[GameOdds]) -> GameOdds | None:
    away = str(prediction["away_team"]).strip().lower()
    home = str(prediction["home_team"]).strip().lower()
    for item in odds:
        if item.away_team.strip().lower() == away and item.home_team.strip().lower() == home:
            return item
    return None


def apply_market_overlay(predictions: list[dict[str, Any]], odds: list[GameOdds]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for pred in predictions:
        matched = _match_odds(pred, odds)
        for side in ("away", "home"):
            team = str(pred[f"{side}_team"])
            model_prob = float(pred[f"model_{side}_win_prob"])
            best_book = best_price = market_prob = no_vig_prob = edge = None
            if matched is not None:
                best_book, best_price, market_prob = best_h2h_for_team(matched, team)
                no_vig_prob = no_vig_for_h2h(matched).get(team.strip().lower())
                edge = compute_edge(model_prob, no_vig_prob if no_vig_prob is not None else market_prob)
            rows.append(
                {
                    "game_pk": pred["game_pk"],
                    "team": team,
                    "opponent": pred["home_team"] if side == "away" else pred["away_team"],
                    "side": side,
                    "odds_available": matched is not None and best_price is not None,
                    "odds_provider": matched.provider if matched else None,
                    "best_book": best_book,
                    "best_price": best_price,
                    "market_prob": market_prob,
                    "no_vig_prob": no_vig_prob,
                    "model_prob": model_prob,
                    "edge": edge,
                    "ev_signal": edge is not None and edge > 0.02,
                }
            )
    return rows


def final_recommendations(predictions: list[dict[str, Any]], overlay: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_game: dict[int, list[dict[str, Any]]] = {}
    for row in overlay:
        by_game.setdefault(int(row["game_pk"]), []).append(row)
    out: list[dict[str, Any]] = []
    for pred in predictions:
        priced_edges = [row for row in by_game.get(int(pred["game_pk"]), []) if row.get("edge") is not None]
        best = max(priced_edges, key=lambda row: float(row["edge"])) if priced_edges else None
        out.append(
            {
                **pred,
                "recommended_team": best["team"] if best and best.get("ev_signal") else "",
                "edge": best["edge"] if best else None,
                "ev_signal": bool(best and best.get("ev_signal")),
                "odds_available": bool(best),
            }
        )
    return out


def _write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = sorted({key for row in rows for key in row})
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def run_daily_predictions(
    *,
    date: str,
    no_odds: bool = False,
    odds_all: bool = False,
    odds_max_games: int | None = None,
    odds_provider_name: str = "oddsapi",
    refresh_odds: bool = False,
    markets: list[str] | None = None,
    mlb_client: MLBStatsClient | None = None,
    odds_provider: OddsProvider | None = None,
) -> dict[str, Any]:
    settings = load_settings()
    markets = markets or settings.odds_api_markets
    output_dir = settings.data_dir / "outputs" / date
    games = build_daily_slate(date, mlb_client)
    slate_rows = [asdict(game) for game in games]
    enriched = enrich_matchups(games, date)
    predictions = generate_predictions(enriched)
    ranked = _rank_for_odds(predictions, odds_max_games or settings.odds_max_games, odds_all)
    odds_enabled = settings.enable_odds and not no_odds and odds_provider_name != "none"
    odds: list[GameOdds] = []
    odds_failures = 0
    cache_hits = 0
    fetched_live = False
    provider_used = "none"
    if odds_enabled:
        provider = odds_provider or build_odds_provider(settings, odds_provider_name, refresh_odds=refresh_odds)
        if provider is not None:
            provider_used = odds_provider_name
            try:
                odds = provider.get_game_odds(
                    date,
                    markets,
                    regions=settings.odds_api_regions,
                    bookmakers=settings.odds_api_bookmakers,
                )
            except Exception as exc:
                odds_failures += 1
                logger.warning("odds fetch failed; predictions continue without odds: %s", exc)
                odds = []
            cache_hits = int(bool(getattr(provider, "last_cache_hit", False)))
            fetched_live = bool(getattr(provider, "last_live_fetch", False))
        wanted = {int(row["game_pk"]) for row in ranked}
        predictions_for_overlay = [row for row in predictions if int(row["game_pk"]) in wanted]
    else:
        predictions_for_overlay = predictions
    overlay = apply_market_overlay(predictions_for_overlay, odds)
    recs = final_recommendations(predictions, overlay)

    paths = {
        "daily_slate": output_dir / "daily_slate.csv",
        "model_predictions": output_dir / "model_predictions.csv",
        "final_recommendations": output_dir / "final_recommendations.csv",
        "run_summary": output_dir / "run_summary.json",
    }
    _write_csv(paths["daily_slate"], slate_rows)
    _write_csv(paths["model_predictions"], predictions)
    if odds:
        paths["market_overlay"] = output_dir / "market_overlay.csv"
        _write_csv(paths["market_overlay"], overlay)
    _write_csv(paths["final_recommendations"], recs)
    summary = {
        "date": date,
        "number_of_games": len(games),
        "odds_enabled": odds_enabled,
        "odds_provider_used": provider_used,
        "odds_fetched_live": fetched_live,
        "odds_cache_hits": cache_hits,
        "odds_failures": odds_failures,
        "number_of_predictions_generated": len(predictions),
        "output_file_paths": {name: str(path) for name, path in paths.items()},
    }
    paths["run_summary"].write_text(json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8")
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run no-odds-first daily MLB predictions.")
    parser.add_argument("--date", required=True)
    parser.add_argument("--no-odds", action="store_true")
    parser.add_argument("--odds-all", action="store_true")
    parser.add_argument("--odds-max-games", type=int, default=None)
    parser.add_argument("--odds-provider", choices=["oddsapi", "manual", "none"], default="oddsapi")
    parser.add_argument("--refresh-odds", action="store_true")
    parser.add_argument("--markets", default=None)
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    summary = run_daily_predictions(
        date=args.date,
        no_odds=args.no_odds,
        odds_all=args.odds_all,
        odds_max_games=args.odds_max_games,
        odds_provider_name=args.odds_provider,
        refresh_odds=args.refresh_odds,
        markets=[part.strip() for part in args.markets.split(",") if part.strip()] if args.markets else None,
    )
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


# Compatibility alias for prompt-named callers.
generatePredictions = generate_predictions
