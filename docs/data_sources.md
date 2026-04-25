# Data Sources and Optional Odds

The daily provider pipeline uses free MLB/baseball data first and treats odds as an optional market overlay.

## Free Data Backbone

- MLB Stats API supplies schedule, game IDs, teams, probable pitchers, game status, scores, and live game feed data.
- `pybaseball` is wrapped as an optional cached enrichment source under `data/cache/pybaseball/`.
- If pybaseball is unavailable or rate-limited, the pipeline continues and records the free-data status instead of fabricating missing features.

## Optional Odds

The Odds API is used only for market comparison and EV detection. Missing API keys, exhausted credits, rate limits, and provider errors return empty odds with warnings; predictions still write.

Supported settings:

- `ODDS_API_KEY` optional
- `ODDS_API_REGIONS` default `us`
- `ODDS_API_MARKETS` default `h2h,spreads,totals`
- `ODDS_API_BOOKMAKERS` optional
- `ODDS_CACHE_DB` default `data/cache/odds_cache.sqlite`
- `DATA_DIR` default `data`
- `ENABLE_ODDS` default `true`
- `ODDS_STRATEGY` default `selective`
- `ODDS_MAX_GAMES` default `6`
- `ODDS_STALE_MINUTES` default `45`

## Usage

Run with no odds:

```bash
python -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --no-odds
```

Run with The Odds API:

```bash
ODDS_API_KEY=your_key_here python -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider oddsapi
```

Run with manual odds CSV:

```bash
python -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider manual
```

Run with selective odds fetch:

```bash
python -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider oddsapi --odds-max-games 6 --markets h2h,spreads,totals
```

Manual odds CSV path:

```text
data/manual/odds_snapshot.csv
```

Required columns:

```text
date,home_team,away_team,bookmaker,market,outcome_name,price,point
```

Optional column:

```text
commence_time
```

Outputs are written to `data/outputs/YYYY-MM-DD/`:

- `daily_slate.csv`
- `model_predictions.csv`
- `market_overlay.csv` when odds are available
- `final_recommendations.csv`
- `run_summary.json`
