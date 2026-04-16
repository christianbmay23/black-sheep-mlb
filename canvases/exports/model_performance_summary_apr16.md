# Model Performance Backtest — 2026-04-16

## Headline
- Settled picks: **3** / 10
- Record: **1-2**
- Accuracy: **33.3%**
- Avg model edge on picks: **2.38%**

## Tracker by tier
- A: 0-1 (0.0%)
- C: 1-1 (50.0%)

## Tracker by confidence
- High: 1-2 (33.3%)

## Where the model performed well
- TOR@MIL: picked **MIL**, result **MIL**, edge 0.58% (C / High).

## Where the model performed poorly
- SF@CIN: picked **CIN**, actual **SF**, edge 6.31% (A / High), missing-data flags: approx_market_ml.
- WSH@PIT: picked **PIT**, actual **WSH**, edge 0.24% (C / High), missing-data flags: approx_market_ml.

## Miss-pattern diagnostics
- approx_market_ml: 2 misses

## Steps going forward
1. Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses.
2. Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window.
