# Implementation Plan — Post-Review

Date: 2026-04-19  
Base revision reviewed: `447ca62`

## Objective

Turn the external review findings into a concrete engineering sequence that improves:

- evaluation integrity
- game-side calibration
- prop-evaluation honesty
- reproducibility

This plan deliberately prioritizes **measurement and trustworthiness** over additional feature expansion.

## Guiding rule

Do not add new predictive features until the system is:

- evaluating only valid pregame states
- benchmarking itself against a real baseline
- reporting game and prop outputs in a way that matches the actual recommendation rule

## Phase 0 — Immediate integrity fixes

### 0.1 Pregame-only scoring

Change:

- Do not score games or props for rows where `game_status_bucket != "pregame"`.
- Live/final games can still appear in reports, but must be labeled `not scored`.

Files:

- `canvases/exports/apr16_compute.py`
- `canvases/exports/build_ml_exports.py`

Success criteria:

- live and final games never receive fresh model edge labels
- snapshots clearly distinguish scored pregame rows from display-only live/final rows

### 0.2 Strict-evaluable snapshot tagging

Change:

- Add an explicit snapshot field indicating whether the run is valid for pregame evaluation.
- Any snapshot with `allow_partial: true` or with non-pregame scored games should be treated as non-evaluable.

Files:

- `canvases/exports/apr16_compute.py`
- `canvases/exports/build_ml_exports.py`

Success criteria:

- each snapshot has a clear `evaluation_eligible` style field
- partial runs are prominently labeled in HTML and snapshot metadata

### 0.3 Baseline reporting

Change:

- Add market-favorite baseline to game backtests.
- Add a note in summaries that current model performance must beat baseline before claims of improvement are made.

Files:

- `canvases/exports/backtest_tracker.py`
- summary markdown outputs

Success criteria:

- every game backtest summary shows model accuracy and market-favorite accuracy side by side

## Phase 1 — Game-side calibration repair

### 1.1 Market-blended final probability

Change:

- Keep raw model probability for diagnostics.
- Introduce `final_win_prob = alpha * raw_model + (1 - alpha) * market_prob`.
- Start with a conservative alpha range like `0.20` to `0.35`.

Files:

- `models/game_model.py`
- `canvases/exports/apr16_compute.py`

Success criteria:

- reports show both raw model probability and blended final probability
- edge is computed from blended probability, not raw disagreement

### 1.2 Tier reset / temporary downgrade

Change:

- Rebuild A+/A/B/C/D thresholds off blended edge.
- Until enough data exists, either:
  - tighten thresholds materially, or
  - temporarily suppress A+ as an actionable label

Files:

- `models/game_model.py`
- `canvases/exports/build_ml_exports.py`

Success criteria:

- no more absurd “A+” labels on extreme market disagreements
- tier ladder behaves more conservatively on favorites and dogs

### 1.3 Add calibration metrics

Change:

- Add Brier score and log loss to game backtests.
- Track by date and by tier.

Files:

- `canvases/exports/backtest_tracker.py`

Success criteria:

- backtests evaluate more than hit rate
- calibration degradation becomes visible early

## Phase 2 — Prop evaluation cleanup

### 2.1 Recommendation-rule ROI only

Change:

- Primary ROI should be computed only on rows that match the actual recommendation gate.
- Keep “all priced props” as a secondary diagnostic, not the lead number.

Files:

- `canvases/exports/prop_backtest_tracker.py`
- prop summary outputs

Success criteria:

- prop summaries clearly separate:
  - recommended ROI
  - all priced rows ROI
  - unpriced target accuracy

### 2.2 HR and 2+ TB separation

Change:

- Keep HR and 2+ TB fully separate in evaluation, summary tables, and headline reporting.
- Do not summarize combined prop performance without also showing family splits.

Files:

- `canvases/exports/prop_backtest_tracker.py`
- `canvases/exports/build_ml_exports.py`

Success criteria:

- HR is clearly labeled high-variance
- 2+ TB can be judged on its own stability

### 2.3 CLV scaffolding

Change:

- Preserve closing odds when available and report closing-line value as a secondary sanity check.

Files:

- `canvases/exports/prop_results_*.csv`
- `canvases/exports/prop_backtest_tracker.py`

Success criteria:

- prop summaries can show whether positive-edge selections beat closing prices when data exists

## Phase 3 — BvP and time-safety

### 3.1 Reduce or disable BvP in backtests

Change:

- For historical backtests, either:
  - zero out BvP inputs, or
  - build an as-of-safe BvP path

Files:

- `models/prop_model.py`
- `canvases/exports/apr16_compute.py`
- backtest scripts

Success criteria:

- historical validation no longer depends on a potentially lookahead-contaminated BvP pull

### 3.2 Raise BvP sample conservatism

Change:

- Increase BvP floors and reduce contribution weight, especially for HR.

Files:

- `models/prop_model.py`

Success criteria:

- small-sample matchup history no longer meaningfully moves prop outputs

## Phase 4 — Reproducibility and operations

### 4.1 Provider source visibility

Change:

- Persist source and timestamp more clearly for odds and props.
- Make mixed-provider rows obvious in reports and snapshots.

Files:

- `canvases/exports/live_mlb_data.py`
- `canvases/exports/build_ml_exports.py`

Success criteria:

- operator can immediately see whether a row is Odds API, RotoWire, or mixed

### 4.2 Snapshot drift checks

Change:

- Add a simple drift check for reruns of the same slate.
- Detect when a rerun changes materially because source data moved.

Files:

- `canvases/exports/apr16_compute.py`
- optional helper script

Success criteria:

- rerun drift is measurable instead of anecdotal

## Execution order

Recommended order:

1. Pregame-only scoring
2. Strict-evaluable snapshot tagging
3. Baseline reporting
4. Market-blended game probability
5. Tier reset
6. Recommendation-only prop ROI
7. BvP backtest decontamination
8. CLV and source-visibility improvements

## What to avoid while this plan is underway

- no new advanced features
- no major UI redesign
- no claims that the model is “clearly better now”

## Exit criteria for claiming improvement

Do not claim the system is clearly better until all of the following are true:

- game-side model beats market-favorite baseline over a meaningful sample
- A/A+ or whatever replaces them shows real separation
- recommended prop ROI is positive over a non-trivial sample
- live / partial / post-start contamination is excluded from evaluation
- the team can reproduce why a given slate was scored the way it was
