---
name: mlb-free-data-refactor
description: Use when changing the no-odds-first package pipeline, optional odds fallback, cached/manual odds providers, or free-data behavior under black_sheep_mlb/. Do not use for canvas strict compute, dated slate artifacts, dashboard display, or postgame backtesting.
---

# MLB Free Data Refactor

## Inputs

- Requested package-pipeline change under `black_sheep_mlb/`.
- Desired odds mode: no odds, manual CSV, cached Odds API, or provider disabled.
- Date for local command validation.

## Example Prompts

- "Make the package daily pipeline continue cleanly when odds are missing."
- "Refactor manual odds loading without changing canvas exports."
- "Validate the no-odds daily prediction path for 2026-04-24."

## Do Not Use When

- The user is asking for the canvas/export strict slate flow; use `black-sheep-daily-slate`.
- The task needs live Odds API usage but the user asked to avoid credits; run no-odds or manual-odds validation only.
- The change would silently promote neutral placeholder predictions as actionable bets.

## Modes

- No-odds safe mode: validate the package pipeline without market data.
- Manual odds mode: validate with `data/manual/odds_snapshot.csv` when provided.
- Live odds mode: use Odds API only when explicitly intended and env-only key handling is acceptable.

## Workflow

1. Inspect current package seams:
   - `black_sheep_mlb/pipelines/run_daily_predictions.py`
   - `black_sheep_mlb/pipelines/build_daily_slate.py`
   - `black_sheep_mlb/pipelines/enrich_matchups.py`
   - `black_sheep_mlb/pipelines/fetch_market_snapshots.py`
   - `black_sheep_mlb/pipelines/market_overlay.py`
   - `black_sheep_mlb/data_sources/`
   - `docs/data_sources.md`
2. Preserve the no-odds-first contract. Missing odds must not block prediction file generation.
3. Do not replace missing lineup/weather/bullpen/recent-form inputs with fake features. Keep explicit missing-data flags or low-confidence status.
4. Keep cache/manual/provider behavior auditable through `run_summary.json`.

## Commands

No-odds run:

```bash
python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --no-odds
```

Manual odds run:

```bash
python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider manual
```

Selective Odds API run, only when API use is intended:

```bash
ODDS_API_KEY=... python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider oddsapi --odds-max-games 6 --markets h2h,spreads,totals
```

## Expected Output

- Files under `data/outputs/YYYY-MM-DD/`:
  - `daily_slate.csv`
  - `model_predictions.csv`
  - `market_overlay.csv` when odds are available
  - `final_recommendations.csv`
  - `run_summary.json`

## Validation

- Optional odds and package pipeline tests:

```bash
python3 -m unittest tests.test_free_data_optional_odds
```

- Run full tests when shared provider contracts change:

```bash
python3 -m unittest discover -s tests
```
