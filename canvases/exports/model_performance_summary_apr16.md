# Model Performance Backtest — 2026-04-16

## Headline
- Settled scored picks: **10** / 10
- Model record: **5-5**
- Model accuracy: **50.0%**
- Market-favorite baseline: **5-5** (**50.0%**)
- Delta vs baseline: **+0.0 pts**
- Avg model edge on picks: **7.19%**
- Brier score: **0.252**
- Log loss: **0.700**
- Standard: current model performance must beat the market-favorite baseline before improvement claims are credible.

## Tracker by tier
- A+: 4-2 (66.7%) | Brier 0.226 | Log loss 0.646
- C: 0-1 (0.0%) | Brier 0.257 | Log loss 0.707
- D: 1-2 (33.3%) | Brier 0.304 | Log loss 0.804

## Tracker by confidence
- High: 5-5 (50.0%)

## Where the model performed well
- BAL@CLE: picked **CLE**, result **CLE**, edge 22.11% (A+ / High).
- SF@CIN: picked **SF**, result **SF**, edge 20.66% (A+ / High).
- KC@DET: picked **DET**, result **DET**, edge 18.90% (A+ / High).

## Where the model performed poorly
- WSH@PIT: picked **PIT**, actual **WSH**, edge 17.31% (A+ / High), missing-data flags: approx_market_ml.
- TEX@ATH: picked **ATH**, actual **TEX**, edge 11.99% (A+ / High), missing-data flags: approx_market_ml;oak_coliseum_env.
- TOR@MIL: picked **TOR**, actual **MIL**, edge 1.40% (C / High), missing-data flags: approx_market_ml;corbin_platoons.

## Miss-pattern diagnostics
- approx_market_ml: 5 misses
- corbin_platoons: 1 misses
- oak_coliseum_env: 1 misses
- lineup_not_posted_api: 1 misses

## Steps going forward
1. Do not claim improvement yet: the model failed to beat the simple market-favorite baseline on this sample.
2. Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses.
3. Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window.
