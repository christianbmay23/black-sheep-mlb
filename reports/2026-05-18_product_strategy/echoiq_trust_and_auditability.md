# EchoIQ Trust and Auditability

## Executive Summary

EchoIQ earns trust through auditable process—source logs, timestamps, gates, explicit gaps, and postgame discipline—not through AI confidence scores. Users and investors should see why a row was promoted or blocked, what was unknown at decision time, and how results were graded without hindsight. May 18’s empty `BET` card with documented Schwarber negative edge is trust-building behavior.

---

## Trust From Process, Not AI Confidence

**Do not pitch:** “Our model is 70% accurate.”  
**Do pitch:** “Every official bet row has verified odds, fair probability, edge, lineup confirmation, and a source timestamp—or it does not ship.”

Validators enforce row shape; culture enforces honesty (`PASS` is success).

---

## Source Hierarchy

From `echoiq_v3/docs/03_SOURCE_HIERARCHY.md` and May 18 practice:

| Tier | Sources | Use |
|------|---------|-----|
| A | MLB.com, MLB Stats API, Savant pulls this session | Schedule, gamePk, starters, Statcast finalists |
| B | Outlier, Ballpark Pal (captured + timestamped) | Props, fair prices, park factors |
| C | Open-Meteo preliminary, inferred profiles | Screen only; lock-time upgrade required |
| D | Conflicting sources | Max label WATCHLIST/PASS |
| F | Unverifiable | Must PASS |

---

## Timestamp Requirements

Every capture needs:

- ISO or explicit local time with timezone (May 18 uses CDT).
- URL or screen identifier.
- “Captured” vs “not captured” boolean in source log.

**Failure mode:** Reusing May 16 narrative on May 18 without recapture—blocked by SOP.

---

## No-Fabrication Rules

From `AGENTS.md` / `echoiq_v3/AGENTS.md`:

- No invented lineups, odds, weather, results, prop markets.
- Missing → `MISSING`, `UNVERIFIED`, `NOT_CHECKED` in templates.
- Estimated odds flagged; excluded from exact ROI.
- Player prop HIT only if **that player** achieved result.

---

## Gate Requirements for BET

Pregame actionable `BET` requires (consolidated from live workflow + checklists):

1. Game pregame / not started  
2. Starter verified near lock  
3. Lineup verified (player in lineup for props)  
4. Current exact price + book + timestamp  
5. Implied and fair probability documented  
6. Edge rationale documented  
7. Weather/roof verified where material  
8. Ballpark Pal captured where relevant  
9. Outlier/market context where relevant  
10. Savant checked for finalists where relevant  
11. Risk flags + kill switch documented  
12. Source confidence A or B  

May 18: **all BET blocked**—lineups TBD + negative Schwarber TB edge.

---

## Unresolved Gap Logs

`slates/2026-05-18/unresolved_gaps.md` pattern:

| Gap | Severity | Impact |
|-----|----------|--------|
| LINEUPS_NOT_POSTED | HIGH | Blocks all prop BET |
| OUTLIER_FAIR_PRICE_VS_MARKET | HIGH | Schwarber TB not BET at -110 |

Gaps must persist until resolved—never deleted to clean the card.

---

## Source Logs

`source_log.md` table: Source, URL, Timestamp, Captured, Confidence, Unresolved issue.

May 18 shows 20+ rows including partial Outlier and full Schwarber detail view—auditors can replay the research path.

**Upgrade:** CSV template `source_log.csv` for machine validation (next build).

---

## Risk Flags

Gate CSV `risk_flags` column (semicolon-separated):

- `lineup_missing`, `negative_edge_at_current_price`, `book_label_missing`, `starter_lock_recheck`, etc.

Displayed on final card “What kills it” column.

---

## What-Kills-It Notes

Every candidate row should state failure modes upfront:

- Schwarber TB: “market never reaches +110; lineup absence; Lodolo change.”
- Coors screen: “cold/wet suppresses; bad prices.”

Prevents post-hoc rationalization.

---

## Postgame Grading

**Artifacts:** `05_postgame/postgame_grade.csv`, `error_ledger.csv`, `model_lessons.csv`, Night Shift `05_postgame_learning/`.

**Rules** (`docs/06_POSTGAME_GRADING_RULES.md`, framework template):

- Grade by bucket: official, conditional, watchlist, lottery, external.
- Process labels: `RIGHT_TEAM_WRONG_PLAYER`, `STALE_ASSUMPTION`, etc.
- No upgrading WATCHLIST to BET after result.
- VOID for inactive player, failed gate, void market.

---

## CLV Tracking

**Definition:** `CLV = no_vig_prob_at_bet - no_vig_prob_at_close` (positive = beat close).

**Status:** Schema in `price_ingestion_schema.json`; not operational in May 18 artifacts.

**Requirement before ROI marketing:** Closing line captured per official BET row.

---

## Explaining Promotion Decisions to Users

**UI pattern (future dashboard):**

1. Row summary (player, market, label).  
2. Gate checklist with red/green per gate.  
3. Baseball grade + 3-bullet bull case.  
4. Market panel: fair vs implied, edge, playable price.  
5. Source trail links/timestamps.  
6. Unresolved gaps list.

**Today:** Read `prediction_gate_board.csv` + `final_card.md` + `unresolved_gaps.md`.

---

## Explaining Uncertainty

- Use verification tags in prose: `[HIGH_CONF_INFERENCE]`.
- Show missing gates explicitly.
- Prefer `CONDITIONAL` with named trigger over false `BET`.

---

## Preventing Hindsight Bias

1. Timestamp all pregame captures before first pitch.  
2. Freeze started-game rows as no-action.  
3. Postgame prompt forbids relabeling pregame intent.  
4. May 14 dry-run postgame report cited in system assessment as good exemplar.  
5. Separate `EXTERNAL` picks from EchoIQ official ROI.

---

## Strengthening Investor / User Trust

| Action | Effect |
|--------|--------|
| Publish redacted exemplar slates in `reports/` | Proof of discipline |
| Never hide empty official cards | Credibility |
| Fix schema inconsistencies (no-vig) | Technical seriousness |
| Ship gate status dashboard | Transparency at scale |
| Report CLV when sample exists | Market-edge proof |

Trust compounds when EchoIQ is right to say **no bet today**—May 18 demonstrated that.
