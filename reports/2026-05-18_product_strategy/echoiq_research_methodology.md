# EchoIQ Research Methodology

## Executive Summary

EchoIQ research is baseball-first, source-tagged, and gate-aware. Every game gets an environment screen; every batter candidate gets matchup structure before any odds are blended. This document defines how to research games, teams, pitchers, and batters using repo artifacts (`raw_research_board.csv`, `pitcher_vulnerability_board.csv`, `weather_park_board.csv`, framework docs) and what must remain manual until automation ships.

---

## Game-Level Research

**Inputs:** MLB Stats API schedule (`statsapi.mlb.com`), MLB.com schedule/probables/lineups.

**Capture per game:**

| Field | Source |
|-------|--------|
| gamePk, status, first pitch | Stats API |
| Venue, roof type | MLB + Ballpark Pal |
| Probable/confirmed starters | MLB.com + recheck near lock |
| Game environment (run/HR lean) | BPP park factors + weather |
| Trap flags | Totals already extreme, doubleheader, bullpen day |

**Outputs:** `01_raw_research/weather_park_board.csv`, game rows in `prediction_gate_board.csv`, narrative in `final_card.md`.

**May 18 example:** 14 scheduled games verified; Coors, Wrigley, Citizens Bank prioritized for environment screens (`today_research_workflow.md`).

---

## Team-Level Research

- Offensive cluster strength (top of order, L/R balance).
- Bullpen fatigue from prior day (`echoiq_v3/daily_agent/bullpen_tracker.py` when Night Shift run).
- Stack context for HR/TB correlation (watchlist only until priced).
- Home/road splits—not primary driver; use as supporting context only.

**Automation:** Partial via `lineup_cluster_board.csv` template.  
**Manual:** Beat/team injury narratives, rest days.

---

## Pitcher-Level Research

**Verified pulls (finalists):** Baseball Savant pitcher page—usage %, xERA, xwOBA allowed, barrel/hard-hit allowed (`savant_fetch_plan.md`).

**Structure (`matchup_structures.md`):**

- Handedness vs opposing lineup skew.
- HR/9, FB%, whiff, CSW by pitch type.
- Recent form (last 3 starts) with sample-size caution.
- Bullpen follow-through if starter is short.

**May 18:** Lodolo Savant pulled for Schwarber matchup; starter conflict flagged (Outlier showed Painter vs API Lodolo)—blocks promotion until lock.

---

## Batter-Level Research

For each candidate, document:

| Dimension | Metrics / sources |
|-----------|-------------------|
| Recent form | Rolling 7/14/30 game lines; BPP L10 |
| Season baseline | wOBA, ISO, K%, BB% |
| Quality of contact | Barrel%, hard-hit%, xwOBA, xSLG (Savant) |
| Handedness | vs LHP/RHP splits |
| Lineup spot | Projected PA (~3.5–4.5 for top half) |
| Player factor | BPP individual park adjustment |

**Scoring dimensions (target framework from product prompt):**

- Batter Quality 0–100
- Recent Form 0–100
- Lineup/PA Strength 0–100
- Risk Penalty 0–100

Store qualitative grades in `BASEBALL_GRADE` (A–F) until numeric rubric is codified in `echoiq_v3/config/scoring_weights.yaml`.

---

## Pitch Arsenal vs Batter Skill Matching

1. Pull pitcher pitch-type usage and whiff/xwOBA allowed by type.
2. Pull batter performance vs pitch types (Savant custom splits).
3. Identify convergence: e.g., high whiff on sweeper vs batter whiff-prone on breaking balls.
4. Tag claims: `[VERIFIED]` only if 2026 Savant pulled this session.

**Limitation:** Zone-level fit requires Savant heat maps—often `UNSUPPORTED` without pull. Do not fake zone maps.

---

## Hot Zone / Location Analysis

- Use only when Savant spray/pull data retrieved.
- Pitcher location tendencies: HIGH_CONF_INFERENCE at best without pitch-level plot.
- **Rule:** No “hot zone” language in official card without `statcast_checked=true` on gate row.

---

## Rolling Stats

- BPP L5/L10, streak flags (Lucky/Unlucky).
- Statcast rolling windows via Savant or pybaseball in package pipeline.
- Distinguish **streak** (EDGE_DEPENDENCE: STREAK) from **matchup** (EDGE_DEPENDENCE: MATCHUP).

---

## Statcast Quality-of-Contact

Primary verified layer for finalists. May 18 Schwarber: elite 2026 profile documented in `savant_candidate_notes.md`—supports baseball case, not bet grade.

---

## BvP Use and Limitations

- Canvas compute disables BvP by default (not point-in-time safe for backtests per root README).
- Use BvP as weak prior only; never sole basis for `BET`.
- Small samples and roster churn make BvP `LOW_CONF_INFERENCE` at best.

---

## Park / Weather / Ballpark Pal

**Ballpark Pal (`ballpark_pal_capture.md` template):**

- Game HR, 2B/3B, 1B, run factors.
- Player factors for finalists.
- Lucky/Unlucky, Risers/Fallers where visible.

**Weather/roof (`weather_roof_status.md`):**

- Open-Meteo for preliminary; lock-time recheck required.
- Roof: Chase “scheduled open” noted May 18—recheck before AZ props.

**Kill rules:** Wind in for HR overs; rain delay; roof unknown at retractable parks.

---

## Lineup / PA Context

- **Hard gate:** Player confirmed in lineup for player props (`hr_bet_gate_checklist.md`).
- May 18: all 28 lineup slots `TBD` at 12:45 CDT—blocks all prop `BET`.
- Projected PA from lineup slot (leadoff ~4.5, #8 ~3.2).

---

## Bullpen Context

- Frame as follow-through risk for HR/TB after early starter exit.
- Night Shift `bullpen_tracker.py` when agent run; else manual notes.
- Do not claim bullpen edge without usage data.

---

## Injury / Scratch Context

- `data/manual/news_scratch.csv` for Night Shift.
- Team official + beat verification before lock.
- May 18 gap: `INJURY_SCRATCH_NEWS_NOT_CHECKED`.

---

## HR-Specific Research

1. Environment screen (park HR factor, weather, roof).
2. Pitcher HR/9 vs batter handedness.
3. Batter barrel%, pull%, fly-ball rate.
4. Outlier HR board: IP, L5, EV+ tags (verify independently).
5. Fair HR probability before `BET`—not Outlier EV+ alone.

**LOTTERY label:** Long-shot HR with high variance; separate ROI bucket.

---

## Total-Bases-Specific Research

1. Contact skill + extra-base hit rate (Schwarber L10 TB 80% on Outlier card).
2. Pitcher extra-base damage allowed.
3. **Price layer:** Outlier fair price vs market (Schwarber O1.5 TB case study).
4. `tb_hit_gate_checklist.md` for gates.

---

## Hits-Specific Research

- Higher base rates; price sensitivity often LOW (`grade_assignment_quick_reference.md`).
- Platoon and contact approach vs pitch types.
- May 18: Vargas 1+ hit row secondary watchlist only.

---

## Game-Line Research

- Starter quality differential (May 18 LEAN rows: TB, CHC, SEA).
- Requires moneyline/total capture before any game `BET`.
- Weather/total interaction for Unders (LAD@SD lean).

---

## Automation vs Manual

| Automated / semi-auto | Manual for now |
|----------------------|----------------|
| Stats API schedule, gamePk, status | Outlier authenticated capture |
| Probable pitchers (API) | Ballpark Pal full pull |
| `create_slate.py` folder scaffold | Book label on Outlier board rows |
| `validate_prediction_rows.py` | Savant for all non-finalists |
| Night Shift pregame refresh (if CSVs filled) | Lock-time lineup recheck |
| Open-Meteo (preliminary) | Roof status confirmation |
| HR intelligence fixtures/hybrid | Fair prob model tuning |

---

## Avoiding Fake Precision

1. Tag every claim with verification taxonomy.
2. Cap `BASEBALL_GRADE` at B if primary claim is LOW_CONF_INFERENCE.
3. Never state unsupported zone/arsenal facts in present tense.
4. Use ranges for fair probability when model not run (“~25–27% HR” in framework examples).
5. Prefer `WATCHLIST` over false specificity.
6. May 16 post-audit lesson: narrative confidence ≠ verified data.

Research output should make an auditor say “I see exactly what was known at decision time”—not “the model felt strong.”
