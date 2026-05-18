# EchoIQ Next Build Plan

## Executive Summary

The next build cycle should close the gap between strong verification philosophy and operational automation—starting with schemas, gate validation, and a single operator runbook, not a new model. Top priority: price/lineup capture templates, gate board validator, starter/lineup recheck script, and path normalization. Defer autonomous BET promotion until calibrated fair-probability and CLV samples exist.

---

## Top 10 Immediate Priorities

1. **Normalize live workflow paths** — Fix `step_3_pregame_live_verified_run.md` to use `/Users/christianmay/Projects/black-sheep-mlb` and `echoiq_v3/docs/framework/`.
2. **Add `echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md`** — Canonical index for steps 1–3 + post-run audit.
3. **Ship capture templates** — `source_log.csv`, `unresolved_gaps.csv`, `player_prop_prices.csv`, `ballpark_pal_capture.csv`, `outlier_capture.csv` under `echoiq_v3/templates/`.
4. **`validate_gate_board.py`** — BET rows require all gate booleans true; negative edge blocks BET.
5. **`starter_lineup_recheck.py`** — Diff probables/lineups vs morning snapshot; write `lineup_recheck.md`.
6. **Fix no-vig in `price_ingestion_schema.json`** — Align with `ev_calculation_examples.md` (`/1.06`).
7. **Add `action_status` to gate template** — Separate from canonical `label` in `reports/2026-05-18_system_assessment/may18_prediction_gate_template.csv` successor.
8. **Document one operator runbook** — Update `echoiq_v3/START_HERE.md` with create_slate → capture → preflight → pregame → validate → final card.
9. **Promote Schwarber exemplar row** — `echoiq_v3/examples/may18_schwarber_tb_conditional.csv`.
10. **Dashboard EchoIQ mode (read-only)** — `dashboard/app.py` discovers `slates/*/prediction_gate_board.csv` or `04_final_card/`.

---

## Files / Modules Likely Involved

| Task | Paths |
|------|-------|
| Gate validator | `echoiq_v3/scripts/validate_gate_board.py` (new) |
| Lineup recheck | `echoiq_v3/scripts/starter_lineup_recheck.py` (new), `echoiq_v3/daily_agent/mlb_stats_client.py` |
| Templates | `echoiq_v3/templates/*.csv` |
| Framework fix | `echoiq_v3/docs/framework/price_ingestion_schema.json` |
| Workflow index | `echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md` (new) |
| Prompt fix | `echoiq_v3/prompts/live_verified_workflow/step_3_pregame_live_verified_run.md` |
| Dashboard | `dashboard/app.py` |
| Runbook | `echoiq_v3/START_HERE.md`, `echoiq_v3/docs/01_DAILY_WORKFLOW_SOP.md` |
| Tests | `tests/test_validate_gate_board.py` (new) |

---

## Proposed New Files / Templates / Schemas

```
echoiq_v3/templates/source_log.csv
echoiq_v3/templates/unresolved_gaps.csv
echoiq_v3/templates/player_prop_prices.csv
echoiq_v3/templates/ballpark_pal_capture.csv
echoiq_v3/templates/outlier_capture.csv
echoiq_v3/templates/lineup_recheck.csv
echoiq_v3/templates/candidate_scoring.csv
echoiq_v3/templates/prediction_gate_board.csv
echoiq_v3/templates/postgame_clv.csv
echoiq_v3/schemas/gate_board_schema.json
echoiq_v3/examples/may18_schwarber_tb_conditional.csv
echoiq_v3/docs/08_LIVE_VERIFIED_WORKFLOW.md
echoiq_v3/scripts/validate_gate_board.py
echoiq_v3/scripts/starter_lineup_recheck.py
reports/exemplar_slate_2026-05-18_redacted/   (optional curated commit)
```

---

## Proposed Scripts / Commands

```bash
# Slate scaffold
python3 echoiq_v3/scripts/create_slate.py 2026-05-19

# Lineup/starter delta
python3 echoiq_v3/scripts/starter_lineup_recheck.py --date 2026-05-19

# Gate board validation (after manual fill)
python3 echoiq_v3/scripts/validate_gate_board.py slates/2026-05-19/prediction_gate_board.csv

# Row schema validation
python3 echoiq_v3/scripts/validate_prediction_rows.py slates/2026-05-19/04_final_card/official_card.csv

# Manual preflight (when CSVs used)
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-19 --preflight-manual-inputs

# Pregame refresh
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-19 --mode pregame-refresh

# Postgame
python3 -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-19 --mode postgame-learning
```

---

## Data Schemas (Field Summary)

### `source_log.csv`
`capture_id`, `source_name`, `url`, `timestamp_utc`, `operator`, `games_scope`, `fields_captured`, `confidence`, `unresolved_issue`

### `unresolved_gaps.csv`
`gap_code`, `severity`, `affected_scope`, `impact`, `required_fix`, `resolved`, `resolved_timestamp`

### `player_prop_prices.csv`
Per `price_ingestion_schema.json`: `player`, `team`, `market`, `sportsbook`, `odds_american`, `timestamp_pulled`, `implied_probability`, `no_vig_probability`, `best_available_flag`, `closing_line`, `clv`

### `ballpark_pal_capture.csv`
`game_pk`, `venue`, `hr_factor`, `tb_factor`, `run_factor`, `weather_note`, `roof_status`, `capture_timestamp`, `source_url`

### `outlier_capture.csv`
`player`, `market`, `line`, `odds`, `book`, `outlier_ip`, `outlier_fair_price`, `ev_tag`, `capture_timestamp`, `screen_ref`

### `lineup_recheck.csv`
`game_pk`, `check_timestamp`, `away_lineup_status`, `home_lineup_status`, `starter_away`, `starter_home`, `delta_from_prior`

### `candidate_scoring.csv`
`player`, `game`, `baseball_score`, `batter_quality`, `pitcher_vulnerability`, `park_weather`, `recent_form`, `risk_penalty`, `baseball_grade`

### `prediction_gate_board.csv`
Existing May 18 columns + `action_status`, `baseball_grade`, `bet_grade`, `playable_price`, `edge_pp`

### `postgame_clv.csv`
`bet_id`, `player`, `market`, `odds_at_bet`, `closing_odds`, `clv`, `result`, `label_at_bet`

---

## Agent Assignment

| Task | Agent |
|------|-------|
| Path/prompt/doc fixes, template CSVs, validators, tests | **Codex** (repo implementation prompt `04_CODEX_IMPLEMENTATION_PROMPT.md`) |
| Product/strategy docs, runbook prose, investor pack | **Cursor / Composer** (this bundle) |
| Live Outlier/BPP/browser capture, lineup lock checks | **Manual / Christian** |
| Deep research verification, postgame narrative | **GPT** (`02_GPT_DEEP_RESEARCH_VERIFICATION_PROMPT.md`) |
| Critique/narrative review only | **Claude** (`03_CLAUDE_CRITIQUE_AND_NARRATIVE_PROMPT.md`) |
| Large architecture refactors, model formula changes | **Opus-level Codex** only when explicitly scoped |

---

## Do Not Automate Yet

- Authenticated Outlier scraping (ToS, auth fragility).  
- Auto-`BET` promotion from model edge.  
- Paid Odds API bulk prop pulls without budget approval.  
- Zone heat maps without Savant pull proof.  
- Parlay / correlation builder.  
- Force-add ignored `slates/*` to git without curation.

---

## Definition of Done (Next Build Cycle)

- [ ] `08_LIVE_VERIFIED_WORKFLOW.md` exists and links all live prompts + framework docs.  
- [ ] All new templates exist under `echoiq_v3/templates/` with header row documented in `00_FOLDER_MAP.md`.  
- [ ] `validate_gate_board.py` passes on May 18 `prediction_gate_board.csv` (0 invalid BET rows).  
- [ ] `starter_lineup_recheck.py` runs against Stats API without paid keys.  
- [ ] `price_ingestion_schema.json` no-vig matches EV doc.  
- [ ] `unittest` for gate validator green.  
- [ ] `START_HERE.md` lists single operator command sequence.  
- [ ] Schwarber exemplar in `echoiq_v3/examples/`.  
- [ ] Optional: dashboard reads one May 18 gate board field set read-only.  
- [ ] No code changes to model thresholds or BET label rules without separate review.

**Timeline suggestion:** 1–2 weeks implementation (Codex), parallel daily slates using templates immediately.

---

## Recommended Next Implementation Step

**Start here:** Create `echoiq_v3/templates/prediction_gate_board.csv` + `validate_gate_board.py` using May 18 `slates/2026-05-18/prediction_gate_board.csv` as the golden negative case (Schwarber row must fail BET validation).

That encodes the product philosophy in executable form before any new modeling work.
