# Agent Guidance

This repository is `black-sheep-mlb`, an MLB prediction, research, export, dashboard, and backtesting project. Treat sports data, odds, lineups, model outputs, and results as auditable records. Do not fabricate missing data.

## Current Structure

- `black_sheep_mlb/`: package-style daily prediction pipeline and data-source adapters.
- `canvases/`: dated Cursor canvas files named `mlb-pregame-intel-<slug>.canvas.tsx`.
- `canvases/exports/`: export, strict compute, provider diagnostics, snapshot validation, and backtesting scripts.
- `canvases/exports/pipeline/`: extracted helpers for canvas IO, feature summaries, market classification, snapshots, slate/date handling, and status logic.
- `models/`: shared model code plus dated `models/<slug>_inputs.py` slate inputs.
- `dashboard/`: read-only Streamlit artifact dashboard when present.
- `docs/`: repo documentation.
- `tests/`: unittest-based coverage for models, pipeline helpers, optional odds, strict snapshot validation, backtesting, and dashboard artifact loading.

## Safety Rules

- Do not invent or silently fill lineups, odds, weather, results, prop markets, model outputs, or backtest outcomes.
- If a provider field is unavailable, preserve an explicit missing/projected/unverified/partial status.
- Use strict compute outputs as proof only when the snapshot validates as strict-current and evaluation eligible.
- Use `--allow-partial` only for diagnosis, early scaffolding, or clearly labeled non-proof runs.
- Keep secrets in the environment or ignored `.env` files. Do not commit API keys or print them in logs.
- Prefer minimal, targeted edits. Keep refactors separate from threshold, scoring, model, or export-structure changes.
- Before changing prediction logic, identify the output surface it affects: canvas `SLATE`, games CSV, batter outlook CSV, HTML report, snapshots, dashboard, or backtest summaries.
- Do not run live provider, API-credit, model recompute, or backtest-generation commands unless the user asks for that run or the task clearly requires it.

## Operating Modes

- Safe artifact-only mode: inspect existing committed/uncommitted artifacts, snapshots, CSVs, reports, and docs. Do not run bootstrap, strict compute, provider probes, Odds API commands, or backtest-generation scripts.
- Strict compute mode: run `build_ml_exports.py --compute` only when an official slate refresh is intended, then validate the resulting snapshot before citing it as proof.
- Diagnostic live mode: use `provider_health_check.py`, `bootstrap_live_slate.py`, or `--allow-partial` only when explicitly diagnosing provider/data blockers or creating a labeled scaffold.

## Verified Commands

Use `python3` unless a local virtual environment exists and is activated by the user.

Package daily predictions:

```bash
python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --no-odds
python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider manual
ODDS_API_KEY=... python3 -m black_sheep_mlb.pipelines.run_daily_predictions --date YYYY-MM-DD --odds-provider oddsapi --odds-max-games 6 --markets h2h,spreads,totals
```

Canvas/export workflow:

```bash
python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD
python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute
python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute --allow-partial
python3 canvases/exports/bootstrap_live_slate.py --date YYYY-MM-DD
python3 canvases/exports/validate_strict_snapshot.py --slug <slug>
python3 canvases/exports/provider_health_check.py --date YYYY-MM-DD
```

Backtesting and audit:

```bash
python3 canvases/exports/backtest_tracker.py --date YYYY-MM-DD
python3 canvases/exports/backtest_tracker.py --date apr15 --allow-legacy-game-probs
python3 canvases/exports/generate_boxscore_backtest_inputs.py --date YYYY-MM-DD
python3 canvases/exports/prop_backtest_tracker.py --date YYYY-MM-DD
python3 canvases/exports/aggregate_game_backtests.py
```

Validation:

```bash
python3 -m unittest discover -s tests
npx tsc --noEmit
streamlit run dashboard/app.py
```

Only run `streamlit` for interactive dashboard work. Only run `--compute`, `bootstrap_live_slate.py`, `provider_health_check.py`, or Odds API commands when live provider access is intended.

## Daily Slate Guidance

1. Inspect the dated inputs, canvas, latest exports, and latest snapshot for the requested date/slug before editing.
2. If the game list must be refreshed, use `bootstrap_live_slate.py` sparingly. It writes `models/<slug>_inputs.py` and `canvases/mlb-pregame-intel-<slug>.canvas.tsx`.
3. For official pregame cards, prefer strict compute:
   `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute`
4. After strict compute, validate:
   `python3 canvases/exports/validate_strict_snapshot.py --slug <slug>`
5. If strict compute fails, report the exact blocker category: lineup/starter, weather, moneyline/total odds, prop market coverage, API/auth, schema, or code error.
6. For no-credit card extraction, read committed artifacts under `canvases/exports/` and do not rerun providers.

## Output-Changing Surfaces

- Game probabilities: `models/game_model.py`, `models/<slug>_inputs.py`, and `canvases/exports/apr16_compute.py`.
- Prop probabilities and tiering: `models/prop_model.py` and `canvases/exports/pipeline/markets.py`.
- Live/provider ingestion: `canvases/exports/live_mlb_data.py`, `black_sheep_mlb/data_sources/`, and `black_sheep_mlb/pipelines/fetch_market_snapshots.py`.
- Export contracts: `canvases/exports/build_ml_exports.py`, canvas marker blocks, and `canvases/exports/pipeline/snapshots.py`.
- Dashboard display only: `dashboard/app.py`. It should remain read-only over generated artifacts.
- Backtest proof surfaces: `canvases/exports/backtest_tracker.py`, `prop_backtest_tracker.py`, `aggregate_game_backtests.py`, and generated tracker/summary files.

## Validation Expectations

- For pure Python/model/pipeline edits, run the narrowest relevant unittest module first. Run full `python3 -m unittest discover -s tests` when shared helpers, model logic, export contracts, or backtesting are affected.
- For canvas or TypeScript edits, run `npx tsc --noEmit`.
- For markdown-only Codex guidance edits, at minimum verify changed files exist and run a non-mutating markdown scan such as `find AGENTS.md docs .agents/skills -name '*.md' -print`.
- For strict slate claims, cite the validated snapshot status, not just the existence of CSV/report files.

## Reporting

Final updates should include:

- What existed before.
- What changed.
- Commands run and results.
- Whether outputs may differ.
- Remaining risks, blocked inputs, or follow-ups.

## Commit Checklist

- Confirm `git status --short` and separate guidance-only changes from unrelated dirty files.
- Stage only intended files, using explicit paths.
- For guidance-only changes, do not include generated slate artifacts, model outputs, snapshots, dashboards, `.env`, or provider cache files.
- Use a focused docs commit message, for example `docs(codex): refine agent guidance`.
