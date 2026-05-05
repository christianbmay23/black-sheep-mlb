# EchoIQ v3 Daily Workflow SOP

## Core principle

Research wide → verify hard → bet narrow → grade clean.

## Phase 1 — Morning slate build

Goal: identify every potentially interesting angle without making bets.

Create:

- `raw_research_board.csv`
- `external_public_predictions.csv`
- `weather_park_board.csv`
- `pitcher_vulnerability_board.csv`

Allowed labels:

- EXTERNAL
- WATCHLIST
- LEAN
- PASS
- AVOID

No official bets in this phase.

## Phase 2 — Candidate shortlist

Goal: reduce the board to the most relevant candidate plays.

Create:

- `candidate_board.csv`
- initial `lineup_cluster_board.csv`

Candidate caps:

| Market | Cap |
|---|---:|
| HR | 15–25 |
| TB | 15–25 |
| Hits | 10–20 |
| Game sides/totals | All games, but only 3–6 serious leans |
| Pitcher props | 5–12 |

## Phase 3 — Model scoring

Each candidate receives:

- Projection Score
- Matchup Score
- Environment Score
- Market Edge Score
- Source Confidence Score
- Volatility Risk
- Kill-Switch Risk

## Phase 4 — Verification pass

Create:

- `verification_board.csv`

Required checks:

- Player active
- Batting slot
- Starting pitcher/opener/bulk role
- Weather/park
- Current odds
- Injuries/scratches
- Bullpen context where relevant
- Fair probability
- Edge
- Kill switch

## Phase 5 — Gatekeeper

Only rows that pass all required gates can become `BET`.

If one exact condition remains, use `CONDITIONAL`.
If multiple important items are missing, use `WATCHLIST`.
If data conflicts, use `WATCHLIST` or `PASS`.

## Phase 6 — Final card

Create:

- `official_card.csv`
- `watchlist.csv`
- `pass_avoid.csv`

Recommended limits:

| Category | Max |
|---|---:|
| HR BETs | 1–5 |
| HR LOTTERY | 0–3 |
| TB/hit props | 0–8 |
| Game sides/totals | 0–5 |
| Pitcher props | 0–4 |

## Phase 7 — Postgame grade

Create:

- `postgame_grade.csv`
- `source_compliance.csv`
- `error_ledger.csv`
- `model_lessons.csv`

Grade by bucket:

- Official BET ROI
- Conditional plays that cleared
- Lottery ROI
- Watchlist process grade
- External source accuracy
- Pass/avoid validation
