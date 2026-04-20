# Model Performance Backtest — 2026-04-15

## Headline
- Settled scored picks: **12** / 12
- Model record: **7-5**
- Model accuracy: **58.3%**
- Market-favorite baseline: **8-4** (**66.7%**)
- Delta vs baseline: **-8.3 pts**
- Avg model edge on picks: **2.22%**
- Brier score (lower is better): **0.2146**
- Log loss (lower is better): **0.6206**
- Standard: current model performance must beat the market-favorite baseline before improvement claims are credible.

## Tracker by tier
- A+: 2-1 (66.7%) | Brier 0.2182 | Log loss 0.6269
- B: 0-2 (0.0%) | Brier 0.2911 | Log loss 0.7761
- C: 1-0 (100.0%) | Brier 0.1212 | Log loss 0.4279
- D: 4-2 (66.7%) | Brier 0.2030 | Log loss 0.5977

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
1. Do not claim improvement yet: the model failed to beat the simple market-favorite baseline on this sample.
2. Add a post-lineup re-score pass that updates win probabilities using confirmed batting orders and bullpen availability to reduce late-information misses.
3. Track results daily by tier/confidence and pause any segment (tier or confidence bucket) that falls below 45% over a rolling 7-day window.
