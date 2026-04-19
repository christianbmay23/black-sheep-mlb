# Model Performance Backtest — 2026-04-18

## Headline
- Settled picks: **15** / 15
- Record: **6-9**
- Accuracy: **40.0%**
- Avg model edge on picks: **4.57%**

## Tracker by tier
- A+: 1-4 (20.0%)
- A: 1-1 (50.0%)
- B: 1-1 (50.0%)
- C: 0-1 (0.0%)
- D: 3-2 (60.0%)

## Tracker by confidence
- High: 6-9 (40.0%)

## Where the model performed well
- DET@BOS: picked **DET**, result **DET**, edge 14.17% (A+ / High).
- KC@NYY: picked **NYY**, result **NYY**, edge 5.99% (A / High).
- TOR@ARI: picked **ARI**, result **ARI**, edge 3.19% (B / High).

## Where the model performed poorly
- CWS@ATH: picked **CWS**, actual **ATH**, edge 24.12% (A+ / High), missing-data flags: none.
- CIN@MIN: picked **MIN**, actual **CIN**, edge 11.89% (A+ / High), missing-data flags: none.
- BAL@CLE: picked **BAL**, actual **CLE**, edge 8.95% (A+ / High), missing-data flags: none.

## Miss-pattern diagnostics
- No missing-data flags: 9 misses

## Steps going forward
1. Recalibrate high-edge (A+) thresholds; require agreement between model edge and at least one market/line-movement confirmation before labeling top tier.
2. Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses.
3. Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window.
