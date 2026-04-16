# Model Performance Backtest — 2026-04-15

## Headline
- Settled picks: **12** / 12
- Record: **7-5**
- Accuracy: **58.3%**
- Avg model edge on picks: **2.22%**

## Tracker by tier
- A+: 2-1 (66.7%)
- B: 0-2 (0.0%)
- C: 1-0 (100.0%)
- D: 4-2 (66.7%)

## Tracker by confidence
- High: 4-3 (57.1%)
- Medium: 2-0 (100.0%)
- Low: 1-2 (33.3%)

## Where the model performed well
- TEX@ATH: picked **ATH**, result **ATH**, edge 16.16% (A+ / Medium).
- MIA@ATL: picked **ATL**, result **ATL**, edge 10.22% (A+ / High).
- COL@HOU: picked **HOU**, result **HOU**, edge 1.48% (C / Medium).

## Where the model performed poorly
- SEA@SD: picked **SEA**, actual **SD**, edge 17.72% (A+ / High), missing-data flags: none.
- TOR@MIL: picked **TOR**, actual **MIL**, edge 4.94% (B / High), missing-data flags: none.
- KC@DET: picked **KC**, actual **DET**, edge 4.67% (B / Low), missing-data flags: away LU; home LU.

## Miss-pattern diagnostics
- No missing-data flags: 3 misses
- away LU: 2 misses
- home LU: 2 misses

## Steps going forward
1. Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses.
2. Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window.
