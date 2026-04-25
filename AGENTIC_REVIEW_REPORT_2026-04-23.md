# Agentic Review Report — `black-sheep-mlb`
**Date:** 2026-04-23
**Reviewed by:** Claude Sonnet 4.6 (full agentic review)
**Repo revision reviewed:** `main` at `90fda9b`
**Review scope:** Full repository · all tracked files · all visible branches · architecture · artifacts · evaluation methodology

---

## 1. Executive Verdict

| Dimension | Assessment |
|-----------|------------|
| **What this repo is** | A daily MLB pregame modeling and reporting system: live data ingestion → game-side win probability model + HR/2+TB prop model → CSV/HTML/JSON artifacts |
| **What it is trying to become** | A trustworthy, auditable pregame decision engine for real betting or serious analyst workflow — not fabricating confidence it cannot support |
| **Directionally sound?** | **Yes.** Strict failure modes, provider fallback chains, per-run JSON snapshots, separate game/prop models, and recommendation gating are the right architecture |
| **Operationally credible?** | **Mostly.** 62 passing unit tests, clean module separation, honest partial-run handling |
| **Predictively credible?** | **Not yet.** No strict-mode evaluation has ever been run. The headline prop ROI (169.27%) is materially corrupted by data entry errors. The game model has not beaten a naive market-favorite baseline on any clean slate |

---

## 2. Project-Purpose Reconstruction

### Explicit Goals (stated in docs)
- Build dated MLB slate canvases with live-source pregame intel
- Score game sides with win probability vs market implied probability
- Score batter HR and 2+TB props with fair-odds model
- Write reproducible CSV/HTML/JSON artifacts per slate
- Backtest prior slates and track performance over time
- Operate in strict mode: explicit failure on missing inputs, not silent degradation

### Implied Goals (inferred from design)
- Support real betting decisions with auditable, honest outputs
- Reach a state where model-generated signals demonstrably beat naive market
- Build toward closing-line value (CLV) as the north-star evaluation metric
- Achieve systematic edge identification at professional analytical level

### Non-Goals (inferred)
- General baseball research or academic model
- Real-time in-game decisioning
- Fully automated deployment without human oversight

### What "Good" Looks Like
A daily system that consistently demonstrates positive CLV or ROI on recommended props and A+/A game picks across a meaningful rolling sample, with auditable provenance for every prediction and honest acknowledgment when evidence is insufficient.

### What the Owner Wants to Avoid
Publishing confident-looking recommendations based on fabricated evidence, cherry-picked windows, or inflated performance figures that cannot be reproduced.

---

## 3. Repo and Architecture Map

### Functional Areas

| Area | Path | Responsibility |
|------|------|----------------|
| **Model layer** | `models/` | `game_model.py` (win probability), `prop_model.py` (HR/2+TB), per-slate `apr*_inputs.py` config stubs |
| **Pipeline layer** | `canvases/exports/pipeline/` | `fetch.py`, `features.py`, `markets.py`, `slate.py`, `inputs.py`, `canvas_io.py`, `snapshots.py`, `status.py`, `parseutil.py` |
| **Orchestration** | `canvases/exports/apr16_compute.py` | Main compute loop: wires pipeline modules, manages GAME_SPECS state, writes markers + snapshots |
| **Live data adapters** | `canvases/exports/live_mlb_data.py` | Odds API, PropLine, DraftKings, RotoWire, FanGraphs, Open-Meteo weather |
| **Entry points** | `canvases/exports/build_ml_exports.py` | Daily `--compute` and `--export-only` runner |
| **Backtest** | `canvases/exports/backtest_tracker.py`, `prop_backtest_tracker.py` | Game-side accuracy + prop ROI evaluation |
| **Canvas layer** | `canvases/*.canvas.tsx` | Cursor IDE canvas files (React-like display + embedded CSV markers) |
| **Generated artifacts** | `canvases/exports/*.csv`, `*.html`, `snapshots/`, `boxscores/` | Per-slate outputs and JSON provenance snapshots |
| **Tests** | `tests/` | 62 unit tests covering pipeline, models, markets, snapshots |

### System Flow (End-to-End)

```
Schedule slug → bind_slate_inputs() → per-slate config
  ↓
fetch_schedule_lineups()      → MLB Stats API (starters, lineups, venue)
fetch_rotowire/fangraphs()    → secondary lineup verification
fetch_savant_expected_stats() → batter/pitcher Statcast features
fetch_live_game_odds()        → Odds API moneylines + totals
fetch_propline/dk_hr_props()  → HR prop markets (PropLine > DK > RotoWire)
fetch_weather_snapshot()      → Open-Meteo with fallback
  ↓
build_model_lineup()          → per-batter feature vectors
summarize_pitcher/bullpen()   → SP + bullpen feature vectors
  ↓
win_probability_model()       → raw model probabilities
blended_win_probabilities()   → 25% model / 75% market final probs
recalibrate_win_probability() → polynomial compression/expansion
  ↓
batter_hr_two_tb()            → HR prob + 2+TB prob per batter
classify_hr/tb_market_status()→ qualification + integrity gating
choose_recommended_prop()     → final recommendation per batter
  ↓
write_run_snapshot()          → timestamped JSON + latest symlink
replace_marker_region()       → canvas CSV marker update
build_ml_exports              → games.csv, batter-outlooks.csv, report.html
```

### Computed vs. Manual vs. Generated

| Category | Examples |
|----------|---------|
| **Computed at runtime** | Lineup quality, bullpen scores, recent form, weather, all model probabilities, edge calculations, market-integrity status |
| **Hand-maintained** | `GAME_SPECS` defaults, analyst rationale text, per-slate canvas narrative |
| **Generated artifacts** | CSVs, HTML reports, JSON snapshots, boxscore JSONs |
| **Scaffolded placeholders** | `away_xera: 4.15` / `home_xera: 4.15` in all `apr*_inputs.py` (overridden at compute time, but not in export-only mode) |

---

## 4. Branch Assessment

| Branch | Commit | Status | Notes |
|--------|--------|--------|-------|
| `main` | `90fda9b` | **Active** | Production branch. Current reference state |
| `origin/main` | `90fda9b` | Identical to `main` | Same commit |
| `origin/side-model-tightening` | `90fda9b` | Identical to `main` | Stale tracking ref; the tightening work is already in `main` |
| `local-backup-before-pull` | `9eeb494` | **Historical** | Snapshot before Phase 3 was pulled. 11 commits behind `main`. Safe to delete |
| `phase-3-slate-generalization` | `2efd025` | **Effectively merged** | 9 commits integrated via PRs #9 and #10. Stale local ref |
| `origin/phase-3-slate-generalization` | `2efd025` | **Effectively merged** | Same as above |
| `origin/hr-integrity-fix` | `687cdf5` | **Merged** | Multi-source HR coverage logic, merged as PR #10 |
| `origin/mlb-intel-apr16` | `4e85ab6` | **Historical baggage** | Apr 16 manual canvas work. Fully superseded by `main`. Safe to delete |

**Highest-value branch:** `main` — it fully represents the long-term direction.
**Historical baggage:** `origin/mlb-intel-apr16` — nothing in it that is not already in `main`.

---

## 5. Findings (Ordered by Severity)

---

### Finding 1: The 169.27% Prop ROI Figure Is Materially Corrupted by Data Entry Errors
**Severity: CRITICAL**

**Why it matters:** This is the headline performance claim for the prop model. It is wrong by approximately 147 percentage points. Publishing it undermines the stated goal of being a trustworthy system.

**Evidence:**
- `canvases/exports/prop_results_apr18.csv`: Two rows have `market_odds=-2` (presumed typos for -200 or -220)
- `canvases/exports/model_prop_performance_tracker_apr18.csv`: Drew Gilbert 2+TB shows `profit_loss_units=50.000` (a payout of 50:1 from odds interpreted as -2 American)
- `model_prop_performance_summary_apr18.md`: Reports 169.27% ROI without flagging this anomaly
- Corrected ROI on the remaining 31 clean rows: **≈ 22.1%**

**Fix:**
1. Correct the two `-2` entries in `prop_results_apr18.csv`
2. Add validation in `prop_backtest_tracker.py`: reject `market_odds` values where `|value| < 100`
3. Re-run tracker and update the published summary

---

### Finding 2: No Strict Pregame Snapshot Has Ever Been Successfully Produced
**Severity: CRITICAL**

**Why it matters:** The Phase 1 proof gate — at least one run with `allow_partial=false` and `evaluation_eligible=true` — is the foundational requirement before any performance claim can be trusted. It has never been executed.

**Evidence:**
- Every snapshot in `canvases/exports/snapshots/apr*/apr*-latest.json` shows `allow_partial: true`
- `evaluation_eligible` is `false` or absent in all snapshots (apr18 through apr22)
- `canvases/exports/model_performance_tracker_apr18.csv` is empty (0 rows) — schema mismatch prevents loading
- Apr 15 data flagged as "legacy compatibility mode" with unknown pipeline provenance

**Fix:**
Run `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute` (without `--allow-partial`) on the next morning lineups and odds are available. Verify `allow_partial=false` and `evaluation_eligible=true` in the resulting snapshot. Backtest after that slate settles.

---

### Finding 3: Game Model Has Not Beaten the Market-Favorite Baseline on Any Clean Slate
**Severity: HIGH**

**Why it matters:** If the model cannot beat the trivial "always pick the market favorite" rule, it is not adding value.

**Evidence:**

| Slate | Model Record | Market Baseline | Delta |
|-------|-------------|-----------------|-------|
| Apr 15 | 7-5 (58.3%) | 8-4 (66.7%) | −8.3 pp |
| Apr 16 | 5-5 (50.0%) | 5-5 (50.0%) | 0.0 pp |
| Apr 18 | 0 rows | — | Schema incompatibility |
| **Combined** | **12-10 (54.5%)** | **13-9 (59.1%)** | **−4.6 pp** |

Apr 15 uses legacy schema with unknown provenance. Apr 16 had most games flagged `approx_market_ml` (hand-entered moneylines). Apr 18 is permanently orphaned.

**Fix:**
Produce a strict-mode slate (Finding 2). Until then, all game model performance claims are based on improperly provenance-controlled data. After 50+ strict-mode games, compute Brier score and log loss — not just accuracy.

---

### Finding 4: The Market Blend Parameter Is Named Backwards and May Be Too Conservative
**Severity: HIGH**

**Why it matters:** Engineers reading `DEFAULT_MARKET_BLEND_ALPHA = 0.25` will likely infer "25% market weight." The actual math gives the model 25% weight and the market 75% weight — the opposite. This is a naming trap for future maintainers.

More critically: at 75% market weight, the model can only move the final probability ±5-10 percentage points in typical cases. The "edge" calculation then compares this nearly-market-anchored final probability against the same market that dominates it, creating a circularity.

**Evidence:**
`models/game_model.py` `blend_with_market()`: `alpha * model_prob + (1 - alpha) * market_prob` where `alpha=0.25`
Example: model=0.75, market=0.54 → final=0.595 (very close to market, not model)

**Fix:**
1. Rename constant to `DEFAULT_MODEL_WEIGHT_ALPHA` with comment: `# 0.25 = model 25% / market 75%`
2. Consider whether 25% model weight is appropriate before any calibration data exists. A 50/50 starting point would demonstrate whether the model is actually contributing signal

---

### Finding 5: `recalibrate_win_probability` Is Unjustified and May Suppress Valid Edges
**Severity: HIGH**

**Why it matters:** This function, added in the most recent commit, applies a polynomial gain curve with no empirical calibration basis. It compresses probabilities for p < ~0.64 — including probabilities that represent meaningful edges — before they reach the recommendation gating.

**Evidence:**
`models/game_model.py` lines 36-44: Parameters 0.78, 0.72, 0.82 exponent are manually chosen
Verified computationally: p=0.60 → 0.597 (compressed, not expanded), p=0.65 → 0.651 (minimal effect)

**Fix:**
Remove or replace with a simple linear shrinkage: `p_calib = 0.5 + (p - 0.5) * SHRINKAGE_FACTOR` with `SHRINKAGE_FACTOR=1.0` (no change) until calibration data justifies reducing it. If the model is genuinely overconfident, use isotonic regression on real residuals rather than hand-tuned polynomials.

---

### Finding 6: `starter_score` Floors at Zero for xERA ≥ 4.85 — Treats All Below-Average SPs Identically
**Severity: MEDIUM**

**Why it matters:** A 5.0 xERA SP and a 7.0 xERA SP receive the same base score (0), losing all relative differentiation. The only differentiator for these matchups is the `xera_nonlinear_margin` term.

**Evidence:**
`models/game_model.py` line 88-91: `clamp((4.85 - xERA) / 2.85, 0, 1)` — any xERA ≥ 4.85 returns exactly 0

**Fix:**
Extend below the floor: `score = clamp((5.50 - xERA) / 3.50, -0.10, 1.0)` so a 6.0 xERA SP gets a meaningful negative score, preserving relative information for below-average starters.

---

### Finding 7: Prop Model "High" Confidence Is Practically Unreachable on the Rich-Feature Path
**Severity: MEDIUM**

**Why it matters:** The rich-feature path (17 feature slots) requires all 17 present for "High" confidence. In practice, 4-6 pitcher contact-quality features from Savant will frequently be missing. The fallback legacy path (3 feature slots) achieves "High" confidence much more easily. Result: the richer model path triggers lower confidence and more blocked recommendations than the simpler fallback.

**Evidence:**
`models/prop_model.py` lines 238 and 341-347: miss ≥ 5 → "Low", miss < 5 → "Medium", 0 missing → "High"
With 13 of 17 features present: 4 missing < 5 threshold → "Medium" (still blocked at "High" gate)

**Fix:**
Separate confidence thresholds for the 17-slot rich path. Proposed: "High" when batter-tier features (xslg, barrel, hard-hit, recent form) are all present, regardless of pitcher contact-quality fields. Or lower the miss threshold from 5 to 8 for the 17-slot case.

---

### Finding 8: All Slate Input Files Default to `xera: 4.15` — No Warning in Export-Only Mode
**Severity: MEDIUM**

**Why it matters:** In export-only mode (without `--compute`), the placeholder xERA value of 4.15 is used directly in the game model. The model silently produces outputs based on scaffold data while appearing to produce real model outputs. No warning is emitted.

**Evidence:**
`models/apr21_inputs.py` lines 36-234: All 15 games have `away_xera: 4.15, home_xera: 4.15`
Same pattern in apr20, apr19, apr18, apr16 inputs

**Fix:**
In export-only mode, check each game spec: if `away_xera == 4.15 and home_xera == 4.15`, set `scoring_status = "scaffold_unverified"` and omit model scoring output. Emit a prominent warning to stderr.

---

### Finding 9: Prop Results CSV Is Manually Maintained with No Automated Sourcing
**Severity: MEDIUM**

**Why it matters:** The manual transcription process is both error-prone (see Finding 1) and not scalable. Selection bias risk: wins may be more memorable than losses. Any ROI figure derived from manually entered results must be treated with skepticism.

**Evidence:**
`canvases/exports/prop_results_apr18.csv`: 540 rows, all manually populated
`generate_boxscore_backtest_inputs.py` exists but handles game-side backtesting, not prop result population

**Fix:**
Build a result-matching script that takes the batter-outlooks CSV, fetches MLB boxscore data for those players on that date via Stats API, and fills `result` automatically (W/L for HR based on actual home runs, W/L for 2+TB based on total bases). This eliminates manual transcription and makes prop results reproducible.

---

### Finding 10: `apr16_compute.py` Uses Module-Level Globals — Not Reentrant or Directly Testable
**Severity: LOW-MEDIUM**

**Why it matters:** `GAME_SPECS`, `REPORT_DATE`, and `CANVAS` as module-level globals set by `bind_slate_inputs()` make the system non-reentrant and make `run_slate_pipeline()` untestable without side effects. The 62 existing tests avoid exercising `run_slate_pipeline()` for this reason.

**Evidence:**
`canvases/exports/apr16_compute.py` lines 120-122, 282-290

**Fix:**
Convert `run_slate_pipeline()` to derive all slate state from its `slug` parameter rather than relying on `bind_slate_inputs()` having been called first. This is a natural continuation of the modularization already underway.

---

### Finding 11: `datetime.utcnow()` Deprecation Warning in Production Code
**Severity: LOW**

**Evidence:** `canvases/exports/pipeline/snapshots.py` line 138; warning surfaces in test suite output

**Fix:** Replace with `datetime.now(timezone.utc)` — one-line change.

---

### Finding 12: Apr 18 Game Model Predictions Are Permanently Orphaned from Evaluation
**Severity: INFORMATIONAL**

The Apr 18 CSV uses the old `model_away_win_pct` / `model_home_win_pct` schema. The current backtest tracker's non-legacy path requires `raw_model_away_win_pct` / `final_away_win_pct`. Result: 15 games of model predictions cannot be backtested. The performance tracker for Apr 18 is empty.

---

## 6. Goal-Alignment Assessment

### Where the Repo Is Aligned with Its Goals
- **Strict compute mode** with explicit failure is exactly right for a trust-critical system
- **Provider fallback chain** (PropLine → DK → RotoWire → projection-only) is transparent and correctly propagated to recommendation gating
- **Snapshot provenance system** is genuinely good — every run produces an auditable JSON capturing lineup verification levels, weather paths, and HR integrity flags
- **Recommendation gating constants** in `markets.py` (probability floor, edge gate, tier floor, confidence gate) are explicit, testable, and auditable
- **Test suite** (62 passing tests) covers pipeline modules meaningfully — well above average for a system of this maturity

### Where the Repo Is Misaligned with Its Goals
- **No strict-mode evaluation has ever been run** — the Phase 1 proof gate is documented but unexecuted
- **The headline ROI figure is wrong** — 169.27% cannot be cited without correction
- **The game model contributes only ~25% to final probability** — so minimal that it's unclear whether it's adding signal or noise
- **Prop results are manually maintained** — the evaluation bottleneck creates systematic error risk
- **No CLV tracking exists** — the only leakage-resistant performance metric is unimplemented

### What Is Being Over-Optimized
- Pipeline engineering and test coverage have run ahead of the evaluation evidence that would justify using the system
- Feature count in the prop model (17 slots) vs. validation of the simpler 3-slot path
- Documentation thoroughness (REVIEW_PACKET, HANDOFF docs) at the expense of producing one clean backtest run

### What Is Being Under-Protected
- **Prop results data integrity** — no automated sourcing, no validation on market odds inputs
- **Game model calibration** — recalibration and blend parameters are unjustified by data
- **Evaluation discipline** — `--allow-partial` runs as default habit; strict mode is the exception when it should be the norm

---

## 7. Improvement Roadmap

### Immediate (do before any further model work)

1. **Correct the prop ROI figure.** Fix the two `-2` market_odds entries in `prop_results_apr18.csv`. Add validation guard (`|market_odds| < 100` → reject) in `prop_backtest_tracker.py`. Re-run tracker. Update the published summary to show corrected ≈22% ROI.

2. **Run one strict pregame slate.** Execute `python3 canvases/exports/build_ml_exports.py --date YYYY-MM-DD --compute` without `--allow-partial` on the next morning lineups and odds are confirmed available. Verify snapshot shows `allow_partial=false` and `evaluation_eligible=true`. Backtest after the slate settles. This is the single most important action.

3. **Fix `datetime.utcnow()` deprecation.** One-line change in `pipeline/snapshots.py` → `datetime.now(timezone.utc)`.

### Short-term (within 1-2 weeks)

4. **Build automated prop result sourcing.** Extend `generate_boxscore_backtest_inputs.py` to auto-populate `result` in the prop tracker by matching player/date to MLB boxscore API. Eliminates manual transcription bottleneck and its error risk.

5. **Fix blend parameter naming.** Rename `DEFAULT_MARKET_BLEND_ALPHA` → `DEFAULT_MODEL_WEIGHT_ALPHA`. Add comment: `# 0.25 = model gets 25% weight; market gets 75% weight`. Prevents semantic confusion.

6. **Add market_odds timestamp tracking.** Add `market_odds_time` column (open/pregame/closing) to the prop results tracker. Required for CLV tracking.

7. **Add scaffold warning in export-only mode.** When `away_xera == 4.15 and home_xera == 4.15`, emit warning to stderr and mark game as `scoring_status = "scaffold_unverified"` rather than running the model silently.

### Medium-term (1-2 months, contingent on strict-mode validation)

8. **Recalibrate win probability model against actual results.** After 50+ strict-mode pregame games, compute Brier score by tier. Use results to justify or refute the current blend weight and calibration form. Adjust `SHRINKAGE_FACTOR` empirically.

9. **Replace `recalibrate_win_probability` with linear shrinkage.** Remove the hand-tuned polynomial. Use `p_calib = 0.5 + (p - 0.5) * SHRINKAGE_FACTOR` with `SHRINKAGE_FACTOR=1.0` until data justifies change.

10. **Add closing-line value (CLV) tracking.** Source closing odds from Odds API historical endpoint or a late-pregame snapshot. Compare model-implied fair odds to closing lines. Positive CLV = model identified mispriced markets before they corrected.

11. **Fix `starter_score` hard floor.** Replace `clamp((4.85 - xera) / 2.85, 0, 1)` with a formulation that produces nonzero differentiation for xERA > 5.0.

12. **Lower prop model "High" confidence threshold.** Target: 12 of 17 features present for "High" on the rich-features path. Current all-17-required threshold is impractical.

### What to Stop Doing
- **Adding new model features** until one strict-mode slate has been produced and backtested
- **Running `--allow-partial` as default** — it should require explicit decision and justification
- **Publishing performance summaries** with uncorrected data entry errors

### What to Validate Before Claiming Improvement

| Evidence Required | Target |
|------------------|--------|
| Strict-mode snapshots | At least 1 with `evaluation_eligible=true` |
| Game model backtest | 50+ games, Brier score vs. market-favorite baseline |
| Prop results | 200+ auto-sourced results with authentic odds timestamps |
| Corrected prop ROI | After removing the `-2` market_odds entries |
| CLV measurement | At least one slate showing positive CLV |

---

## 8. Open Questions

1. **Is PropLine providing real sportsbook odds or DFS pricing?** PropLine responses have DFS providers filtered out, but if remaining bookmakers use alternate-line prices (+170 for 2+TB vs. typical -120 to -140), the edge calculations are systematically comparing against softer-than-available lines, overstating model edge.

2. **Are the 540 rows in the Apr 18 prop tracker all model-recommended, or the full batter-outlooks CSV?** If every rostered player is being logged regardless of recommendation gate, the system's operating scope is being misrepresented.

3. **What is the intended workflow when lineups post late?** MLB lineups often post 60-90 minutes before first pitch. If strict mode cannot be run on early afternoon games, is `--allow-partial` accepted for those, or are they simply not scored?

4. **Has PropLine/DK HR market ingestion ever succeeded in production?** The Apr 22 snapshot shows `hr_provider_path: "rotowire_only"`. If PropLine and DK routinely fail, HR recommendations will almost always be blocked by the degraded-market gate regardless of model output.

---

## 9. Appendix: Review Coverage

### Branches Reviewed
- `main` / `origin/main` / `origin/side-model-tightening` (all `90fda9b` — identical)
- `local-backup-before-pull` (`9eeb494`)
- `phase-3-slate-generalization` / `origin/phase-3-slate-generalization` (`2efd025`)
- `origin/hr-integrity-fix` (`687cdf5`)
- `origin/mlb-intel-apr16` (`4e85ab6`)

### Major Directories Reviewed
- `models/` — all model files and all inputs files
- `canvases/exports/pipeline/` — all 9 pipeline modules in full
- `canvases/exports/` — `apr16_compute.py`, `live_mlb_data.py`, `backtest_tracker.py`, `prop_backtest_tracker.py`, `build_ml_exports.py`, `bootstrap_live_slate.py`
- `canvases/exports/snapshots/` — latest snapshot for apr18 through apr22
- `canvases/exports/boxscores/apr18/` — manifest reviewed, games spot-checked
- `tests/` — all three test files read in full

### Model Outputs Verified Computationally
- `win_probability_model` across various xERA / bullpen / form inputs
- `recalibrate_win_probability` behavior across full probability range
- `starter_score` across xERA range 2.0 – 7.0
- `blend_with_market` direction confirmed
- `batter_hr_two_tb` with full and minimal feature sets
- Prop confidence thresholds verified against feature count logic

### Root Documentation Reviewed
`README.md`, `WORKFLOW.txt`, `REVIEW_PACKET_2026-04-19.md`, `IMPLEMENTATION_PLAN_2026-04-19.md`, `EXTERNAL_AGENT_HANDOFF_2026-04-19.md`

### Areas with Adequate but Not Exhaustive Coverage
- `live_mlb_data.py` beyond line 150 (provider scraping logic — reviewed by interface, not full implementation)
- `apr16_compute.py` beyond line 200 (reviewed key sections; per-game scoring loop at lines 700-825)
- Individual canvas `.tsx` files (structure and marker pattern reviewed, not full content)

---

*Review generated 2026-04-23 by Claude Sonnet 4.6 — full agentic pass, 76 tool calls, all visible branches and major files inspected.*
