---
name: mlb-postgame-backtester
description: Use when grading completed games or props, generating boxscore-backed prop results, updating performance trackers, or reviewing strict-current backtest summaries. Do not use for pregame slate generation, live provider refreshes, or dashboard-only display work.
---

# MLB Postgame Backtester

## Inputs

- Completed slate date or slug.
- Whether game-side, prop-side, or aggregate backtesting is requested.
- Whether cached boxscores are sufficient or live boxscore refresh is intended.

## Example Prompts

- "After the slate settles, grade apr25 game picks."
- "Generate prop results from cached boxscores and update the prop tracker."
- "Aggregate strict-current game backtests and summarize calibration."

## Do Not Use When

- Games are in progress or final results are not available.
- The user only wants to read existing tracker/summary artifacts; inspect files and do not generate new results.
- The task is a pregame card, provider health audit, or dashboard display change.

## Modes

- Artifact review mode: inspect existing tracker CSVs and summary markdown without writing new files.
- Generation mode: run backtest or boxscore generation only when the user wants updated postgame artifacts.

## Workflow

1. Confirm the slate has settled. Do not score in-progress games as final.
2. For game-side backtests:

```bash
python3 canvases/exports/backtest_tracker.py --date YYYY-MM-DD
```

3. Use legacy mode only for explicitly historical compatibility checks:

```bash
python3 canvases/exports/backtest_tracker.py --date apr15 --allow-legacy-game-probs
```

4. For prop results, prefer generated boxscore inputs over manual entry:

```bash
python3 canvases/exports/generate_boxscore_backtest_inputs.py --date YYYY-MM-DD
python3 canvases/exports/prop_backtest_tracker.py --date YYYY-MM-DD
```

5. For rolling game review:

```bash
python3 canvases/exports/aggregate_game_backtests.py
```

## Expected Output

- Game tracker and summary files named `model_performance_tracker_<slug>.csv` and `model_performance_summary_<slug>.md`.
- Prop tracker and summary files named `model_prop_performance_tracker_<slug>.csv` and `model_prop_performance_summary_<slug>.md`.
- Honest separation between target accuracy and betting ROI. Do not compute or state ROI from missing or invalid market odds.

## Validation

- Game backtest logic: `python3 -m unittest tests.test_game_backtest_metrics`
- Prop tracker logic: `python3 -m unittest tests.test_prop_backtest_tracker`
- Boxscore input generation: `python3 -m unittest tests.test_boxscore_prop_results`

## Caveats

- Fresh strict-current rows may aggregate to zero before games settle; report this as settlement timing when applicable, not as proof of failure.
- Invalid American odds such as values with absolute value below 100 should be treated as audit issues, not normalized into ROI.
