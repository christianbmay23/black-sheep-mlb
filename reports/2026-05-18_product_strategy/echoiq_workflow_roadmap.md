# EchoIQ Workflow Roadmap

## Executive Summary

EchoIQ’s ideal day moves from morning environment screens (WATCHLIST-only) through midday price/stat capture to pregame gate promotion and postgame learning. Today’s workflow is prompt- and browser-heavy with strong artifacts but no single runner. This roadmap aligns current May 18 practice with automation targets, using repo paths and commands.

---

## Ideal Daily Workflow

### Morning (T-8h to T-4h)

| Step | Action | Output |
|------|--------|--------|
| 1 | `python3 echoiq_v3/scripts/create_slate.py YYYY-MM-DD` | `slates/YYYY-MM-DD/` scaffold |
| 2 | Stats API + MLB.com schedule/probables | `mlb_schedule_status.md`, gamePk table |
| 3 | Preliminary weather (Open-Meteo) | `weather_roof_status.md` |
| 4 | Environment screens (BPP when available) | `01_raw_research/weather_park_board.csv` |
| 5 | Candidate watchlist only | `02_candidates/candidate_board.csv`, all `WATCHLIST` |

### Midday (T-4h to T-2h)

| Step | Action | Output |
|------|--------|--------|
| 6 | Ballpark Pal park + player factors | `ballpark_pal_capture.md` |
| 7 | Outlier HR/TB/Hits boards | `outlier_capture.md` |
| 8 | Savant for emerging finalists | `savant_candidate_notes.md` |
| 9 | Start price rows | `sportsbook_prices_capture.csv` / gate board odds columns |
| 10 | LEAN / CONDITIONAL promotion | Updated `prediction_gate_board.csv` |

### Pregame (T-90min to lock)

| Step | Action | Output |
|------|--------|--------|
| 11 | MLB.com lineups + live feed recheck | `lineups_status.md` |
| 12 | Starter lock recheck | Update gaps |
| 13 | Exact prices + book labels | Gate board filled |
| 14 | Fair prob + edge calc | `implied_probability`, `edge` columns |
| 15 | Run gates → promote BET only if clear | `04_final_card/official_card.csv` |
| 16 | `validate_prediction_rows.py` + `validate_slate.py` | Pass/fail |

### Postgame

| Step | Action | Output |
|------|--------|--------|
| 17 | Box scores / Stats API results | `05_postgame/postgame_grade.csv` |
| 18 | CLV if closing lines captured | Price schema `closing_line`, `clv` |
| 19 | `run_daily_agent --mode postgame-learning` | `05_postgame_learning/*` |
| 20 | `model_lessons.csv`, prompt rules | Next-slate improvements |

---

## Current Workflow (May 18 Actual)

Documented in `reports/2026-05-18_system_assessment/today_research_workflow.md` and `slates/2026-05-18/`:

- Morning: schedule + probables verified (14 games).
- Midday continuation: Outlier Schwarber detail, HR board, BPP, Savant Schwarber/Lodolo.
- Lineups: still TBD at 12:45 CDT.
- Final card: 0 BET, conservative LEAN/WATCHLIST/CONDITIONAL.
- Artifacts: `source_log.md`, `unresolved_gaps.md`, `prediction_gate_board.csv`, `final_card.md` plus v3 folder `04_final_card/*.csv`.

**Parallel paths used:**

- Manual capture files at slate root (May 18 style).
- v3 subfolders from earlier `create_slate.py` (partially populated).

---

## Gaps

| Gap | Impact |
|-----|--------|
| No unified runbook command | Operator must remember 10+ steps |
| Dual folder conventions (May 15 vs v3) | Confusion where files live |
| Prompt path drift (`~/EchoIQ`) | Agent errors |
| No lineup polling | Manual recheck |
| No price staleness alerts | Stale odds risk |
| Ignored git slates | Lessons not in repo history |

---

## Immediate Fixes (This Week)

1. Add `echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md` index pointing to `prompts/live_verified_workflow/` and `docs/framework/`.
2. Copy May 18 `source_log.md` / `unresolved_gaps.md` patterns into `echoiq_v3/templates/`.
3. Standardize May slates on v3 folder + optional root capture files (document in START_HERE).
4. Fix no-vig formula in `price_ingestion_schema.json` to match EV doc.
5. Add `action_status` column to `may18_prediction_gate_template.csv` successor template.
6. Document single operator command chain in `echoiq_next_build_plan.md`.

---

## This-Week Fixes

1. `starter_lineup_recheck.py` — diff morning vs current Stats API lineups.
2. `validate_gate_board.py` — BET rows must have all boolean gates true.
3. Promote Schwarber case to `echoiq_v3/examples/` as teaching CSV row.
4. Align live prompt workspace path to repo root.
5. Runbook section in README linking EchoIQ vs canvas paths.

---

## This-Month Fixes

1. Manual CSV → gate board merge for `data/manual/player_props.csv`.
2. Outlier capture validator (required fields present).
3. Ballpark Pal snapshot schema + template CSV.
4. Pregame refresh as default after manual preflight.
5. Postgame CLV backfill script (read closing from manual capture).
6. Curated `reports/exemplar_slate_2026-05-18_redacted/` for demos.

---

## Longer-Term Operational Design

**Target:** `python3 -m echoiq_v3.daily_agent.run_daily_agent --date D --mode full-day` with phases:

- `setup` → `morning` → `midday` → `pregame-lock` → `postgame`

Each phase writes phase timestamped artifacts and refuses phase skip if prior gaps HIGH severity.

---

## Standard Source-Capture Packet

Per `may18_source_capture_template.md`, one section per game:

- MLB schedule/starter/lineup block  
- Outlier block  
- Ballpark Pal block  
- Weather/roof block  
- Savant block (finalists)  
- Sportsbook prices block  
- Gate summary  

Store as `slates/YYYY-MM-DD/00_inputs/source_capture.md` or split CSVs.

---

## Sub-Workflows

### Automated Lineup/Starter Recheck

- **Now:** Manual MLB.com + `statsapi .../feed/live` batting order count.
- **Target:** Script in `echoiq_v3/scripts/` calling `daily_agent/mlb_stats_client.py`, output `lineup_recheck.json` with deltas.

### Outlier Capture

- Authenticated read-only browser.
- Players filter for priority names missed on slate board (Marsh, Bregman, etc.—May 18 gap).
- Require matchup card for any CONDITIONAL→BET promotion.

### Ballpark Pal Capture

- Park factors page once per slate day.
- Player pages only for finalists after price screen.

### Savant Finalist Workflow

- Follow `savant_fetch_plan.md`.
- Only after lineups/prices narrow list; tag `statcast_checked` on gate row.

### Price Ingestion

- One row per player-market-book in `player_prop_prices.csv`.
- Join to gate board on date+game+player+market.

### Final-Card Workflow

1. All research rows in gate board.  
2. Filter `label=BET` only if gates pass.  
3. Write `04_final_card/official_card.csv`.  
4. `final_card_report.md` narrative.  
5. Validate.

### Postgame Learning

```bash
python3 -m echoiq_v3.daily_agent.run_daily_agent --date YYYY-MM-DD --mode postgame-learning
```

Feed lessons into `echoiq_v3/prompts/` updates and `config/scoring_weights.yaml`—human approved.

---

## Success Metric

A successful slate day is not “how many BETs.” It is:

- 100% of candidates have source timestamps or explicit gaps.  
- Zero silent fabrications.  
- Official card empty if gates fail—documented why (May 18 standard).
