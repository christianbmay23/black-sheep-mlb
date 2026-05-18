# EchoIQ Productization Roadmap

## Executive Summary

EchoIQ’s product surface today is folders, CSVs, markdown reports, and a canvas-era Streamlit dashboard—not yet a gate-first EchoIQ operator UI. This roadmap defines what users should eventually see, MVP→beta→production stages, and what must be true before charging for reliability claims.

---

## What the Eventual User Sees

A single **Slate Command Center** for date `YYYY-MM-DD`:

1. **Readiness banner** — “0 BET eligible; 3 HIGH gaps” (lineups, prices).  
2. **Game environment grid** — 14 games, park/weather/roof status, starter lock.  
3. **Candidate board** — sortable by BASEBALL_GRADE, edge, label.  
4. **Gate detail drawer** — per-row checklist, sources, timestamps.  
5. **Final card export** — official / watchlist / conditional PDF or CSV.  
6. **Postgame report** — grades, CLV, lessons.

Tone: professional research terminal, not sportsbook clone.

---

## Slate Dashboard

**Data source:** `slates/YYYY-MM-DD/` (read-only).

**Widgets:**

- Games count, first pitch countdown  
- Source freshness (last capture age)  
- Gap severity heatmap  

**Not in v1:** Live betting, account linking, wager buttons.

---

## Candidate Board

Columns: game, player, market, BASEBALL_GRADE, fair prob, implied, edge, label, risk_flags.

Filters: label, market type, gate failures only.

**Repo today:** `candidate_board.csv`, `prediction_gate_board.csv` (May 18).

---

## Gate Status Board

Traffic-light per gate type across slate:

| Gate | May 18 state |
|------|----------------|
| Lineups | RED (all TBD) |
| Prop prices | YELLOW (partial) |
| Edge | RED (Schwarber negative) |
| Weather lock | YELLOW |
| Savant finalists | YELLOW |

Implement as derived view from gate CSV booleans.

---

## Source Audit Trail

Timeline UI from `source_log.md` / future `source_log.csv`:

- Click source → URL, timestamp, confidence, unresolved note.

Investor demo: show Schwarber capture chain proving negative edge decision.

---

## Player Matchup Page

Per finalist:

- Savant spray + pitch-type table (embedded or link)  
- BPP player factor  
- Outlier matchup card summary  
- Bull / bear / what kills it  

**Static v1:** Render from markdown notes (`savant_candidate_notes.md`).

---

## Game Environment Page

- BPP park factors  
- Weather/roof  
- Starter vulnerability snippet  
- Top candidates for that gamePk  

**Reference:** `slates/2026-05-16/game_environment_report.md` style.

---

## Price / Edge Page

- Multi-book price table (`player_prop_prices.csv`)  
- Fair vs implied chart  
- Playable price threshold line (Schwarber +110)  
- Line movement if captured  

---

## Final Card Page

Official `BET` rows only (may be empty).  
Adjacent tabs: LEAN, CONDITIONAL, WATCHLIST, PASS/AVOID, LOTTERY.

Export matches `04_final_card/*.csv`.

---

## Postgame Report Page

- Bucketed results  
- CLV summary  
- Hidden winners  
- Model lessons with approve/dismiss for next slate rules  

Reads `05_postgame/` and `05_postgame_learning/`.

---

## Alerts (Future)

- Lineup posted for game X  
- Starter changed gamePk Y  
- Price crossed playable threshold (Schwarber TB ≥ +110)  
- Weather/roof change  

Delivery: local notification or webhook—no auto-bet.

---

## Investor / Product Demo Path

1. **2 min:** Product thesis slide—verification-first, dual grade.  
2. **5 min:** May 18 gate board—empty BET, Schwarber CONDITIONAL.  
3. **3 min:** Source log audit trail.  
4. **3 min:** Postgame learning from May 14/15 committed slate.  
5. **2 min:** Roadmap—automation gaps honest.  

**Artifacts:** `reports/2026-05-18_product_strategy/`, redacted exemplar (future), `echoiq_investor_pitch.md`.

---

## MVP → Beta → Production

| Stage | Scope | Must have |
|-------|--------|-----------|
| **MVP** | Read-only Streamlit or static site over one slate folder | Gate board, final card, source log render |
| **Beta** | Multi-date navigation, manual CSV upload, validators in UI | Price/edge display, gap list, export |
| **Production** | Auth, alerts, automated price ingest, CLV | 30+ days verified BET sample, calibration report |

**Current:** Between MVP and Beta for canvas dashboard only (`dashboard/app.py`); EchoIQ v3 UI not started.

---

## Before Charging Users or Claiming Reliability

1. **30+ official BET rows** with verified pregame prices and postgame CLV.  
2. **<5% gate violations** in audits (no BET without lineup).  
3. **Documented calibration** HR/TB/hits.  
4. **Automated lineup/price freshness** or SLA for manual ops.  
5. **Legal/compliance review** (jurisdiction, not pick-selling as guaranteed profit).  
6. **Support playbooks** for stale data disputes.  
7. **Uptime** on data pipelines—not required for research-only tier.  

**Safe to sell earlier:** Research workflow subscription (templates, validators, SOP)—not “winning picks.”

---

## Technical Approach

**Phase 1:** Extend `dashboard/app.py` with EchoIQ slate discovery (`slates/*/04_final_card/`) alongside canvas snapshots.  
**Phase 2:** New `dashboard/echoiq_app.py` or mode flag—gate board first.  
**Phase 3:** API layer read-only over slate folders for mobile.

Keep dashboard **read-only** per `AGENTS.md`—no compute in UI v1.

---

## Relation to Canvas Dashboard

| Canvas dashboard | EchoIQ dashboard |
|------------------|------------------|
| `canvases/exports/snapshots/` | `slates/YYYY-MM-DD/` |
| Model probabilities | Labels + gates + edge |
| Strict compute proof | Verification proof |

Do not merge UIs until label/schema mapping is documented.

---

## Productization Anti-Patterns

- Showing AI confidence without gates.  
- Hiding empty official cards.  
- Mixing EXTERNAL picks into ROI widget.  
- Auto-refreshing odds without timestamp.  
- Promoting May 16 inferred prices as verified.

Product success = users trust the **no** as much as the **bet**.
