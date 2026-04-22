# Black Sheep — MLB pregame intel

Research canvas + probability engine for MLB slates: implied vs model win probability, batter HR / 2+ TB fair odds, tier ladder (A+ through D). Sources of record: **MLB Stats API**, **Baseball Savant**, **RotoWire**, **Open-Meteo**, **Odds API** (moneylines + props). No FanGraphs requirement.

## Repository layout

| Path | Purpose |
|------|---------|
| `canvases/mlb-pregame-intel-apr15.canvas.tsx` | Cursor canvas (React) for that slate; **dated** file pattern is the norm. |
| `canvases/mlb-pregame-intel-apr16.canvas.tsx` | Apr 16 slate: full dashboard UI + CSV marker blocks for export. |
| `canvases/mlb-pregame-intel-apr18.canvas.tsx` | Apr 18, 2026 slate: same pattern as Apr 16; use `--date 2026-04-18 --compute` to refresh. |
| `canvases/exports/build_ml_exports.py` | Regenerates CSV + standalone HTML from marker blocks inside a dated canvas. |
| `models/game_model.py`, `models/prop_model.py`, `models/apr16_inputs.py`, `models/apr18_inputs.py` | **Win probability** and **HR / 2+ TB** logic; per-slate moneylines, weather, and analyst copy. |
| `canvases/exports/apr16_compute.py` | Wires API lineups + models into marker CSV + SLATE for any slate with a `models/<slug>_inputs.py` module (for example apr16, apr18, apr19). |
| `canvases/exports/_gen_apr16_canvas.py` | Thin wrapper: `build_ml_exports.py --date 2026-04-16 --compute`. |
| `canvases/exports/_gen_apr18_canvas.py` | Thin wrapper: `build_ml_exports.py --date 2026-04-18 --compute`. |
| `canvases/canvas-types.d.ts` | Ambient typings for `cursor/canvas` (IDE / `tsc` without bundling Cursor). |
| `tsconfig.json`, `package.json` | Local TypeScript check for `*.canvas.tsx` (`npx tsc --noEmit`). |
| `canvases/exports/*.csv` | Game summaries + batter outlook exports (regenerate after slate updates). |
| `canvases/exports/mlb-pregame-intel-apr15-report.html` | Example printable HTML snapshot (per-slug `*-report.html` exists). |
| `WORKFLOW.txt` | Short daily checklist (duplicate pointers; this README is canonical). |

## Cursor IDE and the live canvas

Cursor only auto-loads canvases from its managed folder. A **symlink** connects the IDE to this repo (one-time per machine):

`~/.cursor/projects/black-sheep-mlb/canvases/mlb-pregame-intel-apr15.canvas.tsx` → `canvases/mlb-pregame-intel-apr15.canvas.tsx`

Edit the file **inside this repo**; the symlink keeps the side panel in sync. On a new computer: clone the repo, open it in Cursor, then recreate that symlink or copy the `.canvas.tsx` into the `canvases` folder under `~/.cursor/projects/<your-workspace>/canvases/`.

## Daily workflow

1. Open the repo in Cursor.
2. Edit the **dated** canvas for that day (e.g. `canvases/mlb-pregame-intel-apr16.canvas.tsx`): adjust `SLATE` / UI as needed, or refresh API-backed CSV markers (see below).
3. Regenerate exports:
   `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD`
   (or `--date apr16` style slug; omit `--date` only if you still use the default `apr15` canvas).
4. For a full live-data recompute, use:
   `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute`
   Strict mode is the default. The run fails if required live inputs are missing or unverified.
5. If you intentionally want fallbacks, opt in:
   `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute --allow-partial`
6. Commit when the slate is stable:
   `git add -A && git commit -m "Slate update YYYY-MM-DD"`


## Date-Driven Export Workflow

1. Create or update a daily canvas using this naming pattern:
   - `canvases/mlb-pregame-intel-<slug>.canvas.tsx`
   - Example slugs: `apr15`, `apr16`
2. Add or update the two marker blocks inside that canvas:
   - `<!-- games-csv:start --> ... <!-- games-csv:end -->`
   - `<!-- batter-outlooks-csv:start --> ... <!-- batter-outlooks-csv:end -->`
3. Run one of the export commands:
   - `python canvases/exports/build_ml_exports.py --date 2026-04-16`
   - `python canvases/exports/build_ml_exports.py --date apr16`
4. Generated files are written automatically to `canvases/exports/` with the same slug:
   - `mlb-pregame-intel-<slug>-games.csv`
   - `mlb-pregame-intel-<slug>-batter-outlooks.csv`
   - `mlb-pregame-intel-<slug>-report.html`

If `--date` is omitted, exports default to slug `apr15` for backward compatibility.

## Strict live-data requirements

Strict `--compute` requires all of the following before it writes the canvas:

- MLB schedule + probable starters for every game on the slate
- MLB posted lineups for both teams in every game
- RotoWire confirmation without pitcher or lineup mismatches
- Open-Meteo weather for every venue
- Odds API moneylines and totals for every game
- Odds API prop markets for every modeled batter row
- Recent-form and bullpen features resolvable from MLB Stats API / Savant inputs

Provider chain:

- Game odds: Odds API first, then RotoWire MLB odds tables
- HR props: Odds API first, then RotoWire lineup HR odds feed
- TB props: Odds API first, then RotoWire MLB player props tables
- Lineup verification: MLB Stats API plus RotoWire confirmation

Required environment:

- `ODDS_API_KEY` or `THE_ODDS_API_KEY` for live moneylines, totals, and batter prop markets

The compute scripts auto-load repo-local `.env` and `.env.local` files if present, so this is sufficient in the repo root:

```bash
printf 'ODDS_API_KEY=%s\n' 'YOUR_REAL_KEY_HERE' > .env
```

If any of those requirements are not met, `--compute` exits with an error instead of quietly writing partial outputs. Use `--allow-partial` only for early slates, manual scaffolding, or debugging.

In `--allow-partial` mode, weather resolution now degrades to a conservative neutral fallback (`run_factor = 1.0`) instead of throwing, but strict pregame runs still fail on weather-provider issues. Snapshot provenance records the weather provider path plus lineup/starter verification levels without changing the existing CSV contracts.

Every `--compute` run also writes a dated snapshot under:

- `canvases/exports/snapshots/<slug>/<slug>-<timestamp>.json`
- `canvases/exports/snapshots/<slug>/<slug>-latest.json`

Snapshots capture the exported rows plus the game-side and prop-side feature inputs that produced them.

### Apr 16: model-driven refresh (strict by default)

For [`mlb-pregame-intel-apr16.canvas.tsx`](canvases/mlb-pregame-intel-apr16.canvas.tsx) only:

- **Hand-edit** narrative copy, `bestBets` / pass list, notes, and **inputs** in [`models/apr16_inputs.py`](models/apr16_inputs.py) (moneylines, xERA stubs, prop feature rows, rationale text).
- **Regenerate** games + props from the shared model and sync markers + SLATE numbers:  
  `python3 canvases/exports/build_ml_exports.py --date 2026-04-16 --compute`  
  or `python3 canvases/exports/_gen_apr16_canvas.py` (same command).  
  This pulls **probables / lineups** from MLB Stats API, verifies against **RotoWire**, adds **Open-Meteo weather**, **recent form**, **bullpen scoring**, and **live odds / prop markets**, runs **`win_probability_model`** and **`batter_hr_two_tb`**, then updates the marker CSV blocks and **numeric** fields inside `SLATE` (same values as the CSV). It does **not** replace layout or `GameCard` structure.
  Export-only (no recompute): `python3 canvases/exports/build_ml_exports.py --date 2026-04-16`.

### Apr 18, 2026: same pipeline

For [`mlb-pregame-intel-apr18.canvas.tsx`](canvases/mlb-pregame-intel-apr18.canvas.tsx):

- Edit game metadata and analyst copy in [`models/apr18_inputs.py`](models/apr18_inputs.py).
- Refresh models + exports:  
  `python3 canvases/exports/build_ml_exports.py --date 2026-04-18 --compute`  
  or `python3 canvases/exports/_gen_apr18_canvas.py`.  
  If the slate is not fully posted yet and you want a best-effort refresh anyway, add `--allow-partial`.
  To regenerate the canvas shell from the Apr 16 UI template (rare): `python3 canvases/exports/gen_apr18_canvas.py`.

## Backtesting + model performance tracker

Use the backtest script to score yesterday's picks and generate a running tracker + summary notes:

```bash
python3 canvases/exports/backtest_tracker.py
# or
python3 canvases/exports/backtest_tracker.py --date 2026-04-15
# or
python3 canvases/exports/backtest_tracker.py --date apr15
```

Current Phase 1 behavior:

- Normal mode requires the current game CSV schema with:
  - `raw_model_away_win_pct`
  - `raw_model_home_win_pct`
  - `final_away_win_pct`
  - `final_home_win_pct`
- Legacy pre-Phase-1 CSVs that only have `model_away_win_pct` / `model_home_win_pct` are rejected by default.
- To score a historical legacy CSV intentionally, opt in:

```bash
python3 canvases/exports/backtest_tracker.py --date apr15 --allow-legacy-game-probs
```

Legacy mode marks the output as historical compatibility only and not valid Phase 1 proof.

Outputs:
- `canvases/exports/model_performance_tracker_apr15.csv`
- `canvases/exports/model_performance_summary_apr15.md`

The script will try MLB Stats API first. If the environment blocks outbound calls, it falls back to a locally maintained result map for supported dates.

### Phase 1 proof gate

Before Phase 2, require one fresh strict pregame slate from the current compute path:

1. Run `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute` with no `--allow-partial`.
2. Confirm the generated snapshot shows:
   - `allow_partial = false`
   - `evaluation_eligible = true`
   - `scored_games > 0`
3. Confirm the generated game CSV includes both `raw_model_*` and `final_*`.
4. After that slate settles, run `python3 canvases/exports/backtest_tracker.py --date YYYY-MM-DD` without `--allow-legacy-game-probs`.

Only that fresh strict slate should be used as the Phase 1 proof surface. Older legacy backtests are historical context only.

## Prop Backtesting Workflow

Use `prop_backtest_tracker.py` to evaluate batter/pitcher prop calls while separating **target accuracy** from true **betting ROI**.

### 1) Create/fill the prop results file

Run:

```bash
python3 canvases/exports/prop_backtest_tracker.py
# or
python3 canvases/exports/prop_backtest_tracker.py --date 2026-04-15
# or
python3 canvases/exports/prop_backtest_tracker.py --date apr15
```

If `canvases/exports/prop_results_apr15.csv` does not exist, the script creates a template with required headers:

- `date`
- `game`
- `player`
- `team`
- `prop_type` (`HR`, `2+ TB`, `K`, `OUTS`, `HIT`, `RBI`, `RUN`)
- `line`
- `market_odds`
- `closing_odds`
- `result`
- `notes`

Populate one row per tracked prop result, then rerun the same command.

Date-driven paths are derived from `--date`:
- Outlook: `mlb-pregame-intel-<slug>-batter-outlooks.csv`
- Results: `prop_results_<slug>.csv`
- Tracker: `model_prop_performance_tracker_<slug>.csv`
- Summary: `model_prop_performance_summary_<slug>.md`

(`<slug>` can be a short slug like `apr15` or generated from `YYYY-MM-DD`.)

### 2) Run the prop backtest

```bash
python3 canvases/exports/prop_backtest_tracker.py
```

Outputs:
- `canvases/exports/model_prop_performance_tracker_apr15.csv`
- `canvases/exports/model_prop_performance_summary_apr15.md`

### 3) Interpret target accuracy vs betting ROI

- **Target accuracy**: use when market odds are missing; this answers “did the target hit?” only.
- **Betting ROI**: only computed when market odds exist; this answers “was it profitable at that price?”
- Do **not** label props +EV unless market odds are available.
- A prop can be a good matchup target but still a bad bet if market price is worse than model fair odds.
- HR props should be monitored as higher-variance; 2+ TB and pitcher K should be treated as more stable core categories.

## Git: do you need to push?

| Goal | What to do |
|------|------------|
| **Work only on this Mac** | **No.** Local `git commit` is enough; history stays on disk. |
| **Backup / second machine / phone view** | **Yes.** Add a **private** remote and push. |
| **Collaborate** | Push + invite collaborators on the host (GitHub, GitLab, etc.). |

Nothing is required beyond commits until you want off-box backup or sync.

### First push to GitHub (example)

```bash
cd ~/Projects/black-sheep-mlb
# Create an empty private repo on GitHub, then:
git remote add origin https://github.com/<you>/black-sheep-mlb.git
git push -u origin main
```

## Current status

- **Default branch:** `main` (date-driven exports, backtest/prop tools, dated canvases).
- **Feature slates:** use a branch per slate if you prefer (e.g. `mlb-intel-apr16`). Merge via PR when ready.
- **Working tree:** should stay **clean** after each commit; run `git status` before ending a session.

## Optional cleanup

- If regenerated CSV/HTML noise in diffs is annoying, you can gitignore `canvases/exports/*.csv` and `*.html` and only commit the Python script + canvas — trade-off: exports are no longer in the repo snapshot.
