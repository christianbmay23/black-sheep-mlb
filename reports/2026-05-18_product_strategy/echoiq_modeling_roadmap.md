# EchoIQ Modeling Roadmap

## Executive Summary

EchoIQ modeling must stay baseball-first: score matchup strength before blending odds. Current code (`models/prop_model.py`, `black_sheep_mlb/hr_intelligence/`, `echoiq_v3/probability_framework_v1.py`) provides conservative scaffolding—not calibrated official prop engines. This roadmap prioritizes candidate discovery, fair probability by market, calibration, and CLV-backed evaluation with human gate promotion.

---

## Baseball-First Candidate Discovery Engine

**Goal:** Per game, auto-generate:

- Starter vulnerability profile  
- Top 3 HR / TB / hit candidates  
- Park/weather boost flags  
- Trap flags  
- Confidence + source gaps  

**Modules to extend:**

- `echoiq_v3/daily_agent/matchup_engine.py`
- `echoiq_v3/daily_agent/player_form.py`
- `black_sheep_mlb/pipelines/enrich_matchups.py`
- `black_sheep_mlb/hr_intelligence/runner.py`

**Output schema:** `game_candidate_summary.json` per gamePk under `slates/YYYY-MM-DD/02_candidates/`.

**Phase 1:** Rule-based screens from Stats API + pybaseball (no fake Savant).  
**Phase 2:** Statcast-enriched ranks when `statcast_enrichment.py` succeeds.

---

## HR Model Improvements

| Now | Next |
|-----|------|
| HR intelligence kill flags + edge from fixtures/hybrid | Live Statcast features per batter-pitcher |
| Canvas `prop_model.py` tiers | Calibrate to 2026 HR rates by handedness |
| Outlier IP as reference only | Independent fair HR from decomposition |

**Features:** barrel%, pull%, FB%, pitcher HR/9 by pitch type, park HR factor, weather multiplier, PA projection.

**Evaluation:** Brier score, calibration bins, ROI only on verified-price rows.

---

## Total Bases Model Improvements

- v1.1 probability framework (`run_probability_framework.py`) — extend with lineup PA weighting.
- Model O1.5 TB as function of hit + XBH rate, not HR alone.
- **Schwarber lesson:** model must output fair *price* sensitivity, not just TB hit rate.

---

## Hits Model Improvements

- Higher baseline rates; platoon and K% vs pitch type.
- Steer-type contact plays: wide price window (LOW sensitivity in framework).
- Separate calibration from HR (lower variance).

---

## Game-Line Model Improvements

- `models/game_model.py` + strict compute snapshots.
- Integrate weather, bullpen, recent form from canvas compute path.
- EchoIQ gate: game BET only with captured ML/total and edge.

---

## Pitch Arsenal vs Batter Model

**Structure:**

```
matchup_score = f(pitcher_usage_vector, batter_performance_vector)
```

**Data:** Savant pitch-type tables (2026 season).  
**Avoid:** Single BvP cell.  
**Store:** `matchup_notes.json` pattern from `slates/2026-05-15/02_next_slate_research/`.

---

## Zone / Hotspot Matching

- Deferred until automated Savant zone pulls exist.
- Until then: tag UNSUPPORTED; no zone claims on official card.

---

## Rolling Statcast Features

- 7/14/30 rolling xwOBA, barrel%, hard-hit% in `statcast_enrichment.py`.
- Join on `daily_agent/id_mapping.py` player IDs.

---

## Park / Weather Factors

- Ingest BPP-style factors via manual CSV → normalized multipliers.
- Open-Meteo for wind/temp; roof flag as binary gate.
- Coors: separate TB vs HR factor (May 18 BPP HR -9, 2B/3B +18).

---

## Lineup / PA Projection

- Lineup spot → expected PA table (config-driven).
- Block model output if lineup unverified (hard gate, not soft weight).

---

## Bullpen Context

- `bullpen_tracker.py` fatigue scores.
- Downgrade HR/TB if bullpen day or opener risk flagged.

---

## Fair Probability Estimation

**Layers:**

1. Empirical base rate × adjustments (documented in `ev_calculation_examples.md`).  
2. `probability_framework_v1.py` CSV-driven params.  
3. HR intelligence scoring output.  
4. Human override with tag `ANALYST_FAIR` (logged).

**Rule:** Model fair prob must be reproducible from stored inputs in snapshot JSON.

---

## Calibration

- Weekly calibration report by market: predicted vs realized (reliability diagram).
- Separate LOTTERY bucket.
- Do not calibrate on EXTERNAL rows.

---

## Backtesting

**Existing:**

- `canvases/exports/backtest_tracker.py` (game lines, strict snapshot gate).
- `prop_backtest_tracker.py` (props; needs market odds for ROI).
- `generate_boxscore_backtest_inputs.py`

**Needed:**

- EchoIQ v3 official-card backtest joining `official_card.csv` + verified prices + results.
- Require `evaluation_eligible` strict snapshots for game-model proof only.

---

## CLV Measurement

- Populate `closing_line` and `clv` in price schema postgame.
- Aggregate CLV by source confidence bucket, EDGE_DEPENDENCE, BET_GRADE.
- Minimum sample before marketing edge.

---

## Feature Store / Data Storage

**Near term:** `slates/YYYY-MM-DD/` CSV + JSON per day (current pattern).  
**Medium term:** `data/echoiq/feature_snapshots/<date>/` parquet or sqlite.  
**Long term:** Versioned feature store keyed by gamePk + playerId + capture_timestamp.

Do not block current ops on database—schema first.

---

## Model Evaluation Metrics

| Market | Primary metrics |
|--------|-----------------|
| HR | Brier, log loss, ROI (priced rows only), CLV |
| TB | Same + line-specific calibration |
| Hits | Hit rate accuracy, ROI |
| Game lines | Log loss on win prob, CLV on ML |

**Process metrics:** % rows blocked by gates, false promotion rate (postgame audit).

---

## Human-in-the-Loop Validation

1. Model proposes candidates → always `WATCHLIST`.  
2. Human captures prices/sources.  
3. Model computes fair prob + edge suggestion.  
4. Human promotes to `BET` only if gates pass.  
5. Postgame learning flags `STALE_ASSUMPTION` / `RIGHT_TEAM_WRONG_PLAYER`.

Automation never auto-`BET` without explicit future policy change and proven calibration.

---

## Priority Order (Modeling)

1. Fair probability + edge for TB/HR with stored inputs.  
2. Baseball-first candidate ranker (game-level JSON).  
3. HR intelligence live Statcast hookup.  
4. Calibration pipeline on historical priced rows.  
5. Zone/arsenal deep match (Savant automation).  
6. CLV database.  
7. Game-line unified with EchoIQ gates.
