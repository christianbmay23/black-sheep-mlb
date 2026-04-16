# Black Sheep — MLB pregame intel

Research canvas + probability engine for MLB slates: implied vs model win probability, batter HR / 2+ TB fair odds, tier ladder (A+ through D). Sources of record: **MLB Stats API**, **Baseball Savant**, **RotoWire**, **Odds API** (moneylines). No FanGraphs requirement.

## Repository layout

| Path | Purpose |
|------|---------|
| `canvases/mlb-pregame-intel-apr15.canvas.tsx` | Cursor canvas (React) for that slate; **dated** file pattern is the norm. |
| `canvases/mlb-pregame-intel-apr16.canvas.tsx` | Apr 16 slate: full dashboard UI + CSV marker blocks for export. |
| `canvases/exports/build_ml_exports.py` | Regenerates CSV + standalone HTML from marker blocks inside a dated canvas. |
| `canvases/exports/_gen_apr16_canvas.py` | Optional: refreshes **only** the `games-csv` / `batter-outlooks-csv` markers from MLB Stats API + model rows (does **not** replace the React UI). Then runs `build_ml_exports.py --date 2026-04-16`. |
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
4. Commit when the slate is stable:  
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

### Apr 16: optional API refresh of CSV markers

For [`mlb-pregame-intel-apr16.canvas.tsx`](canvases/mlb-pregame-intel-apr16.canvas.tsx) only:

- **Hand-edit** the dashboard: change the `SLATE` array, matchup text, lineups, etc., in the `.tsx` file as usual.
- **Refresh marker CSV from the API + generator** (`probables`, batter rows from schedule/rosters, games table from `GAME_SPECS`):  
  `python3 canvases/exports/_gen_apr16_canvas.py`  
  This **splices** new CSV between `<!-- games-csv:start/end -->` and `<!-- batter-outlooks-csv:start/end -->` inside the trailing block comment and **does not** overwrite the React component. It then runs `build_ml_exports.py --date 2026-04-16`.  
  If you change moneylines, tiers, or narrative in code only, re-run exports after editing:  
  `python3 canvases/exports/build_ml_exports.py --date 2026-04-16`.

## Backtesting + model performance tracker

Use the backtest script to score yesterday's picks and generate a running tracker + summary notes:

```bash
python3 canvases/exports/backtest_tracker.py
# or
python3 canvases/exports/backtest_tracker.py --date 2026-04-15
# or
python3 canvases/exports/backtest_tracker.py --date apr15
```

Outputs:
- `canvases/exports/model_performance_tracker_apr15.csv`
- `canvases/exports/model_performance_summary_apr15.md`

The script will try MLB Stats API first. If the environment blocks outbound calls, it falls back to a locally maintained result map for supported dates.

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
