# Model Prop Performance Summary — apr15

## Matchup / Target Accuracy
- Overall prop record: **7-4-1**
- Overall target hit rate (W/L only): **63.6%**
- HR record: **1-2-1**
- 2+ TB record: **3-1-0**
- Pitcher K record: **1-0-0**

## Betting ROI (priced props only)
- Priced prop count: **11**
- Betting ROI (all priced props): **83.11%**
- **+EV classification is only valid when market odds exist.**

### ROI by prop type
- 2+ TB: 111.25%
- HIT: -100.00%
- HR: 100.00%
- K: 95.24%
- RUN: 90.91%

### ROI by tier
- A: 143.00%
- B: -100.00%

### ROI by confidence
- High: 102.50%

## Unpriced Watchlist Accuracy
- Unpriced (target-only) count: **1**
- Unpriced record: **1-0-0**
- Unpriced hit rate (W/L only): **100.0%**

## Best hits
- NYM@LAD F. Alvarez 2+ TB: outcome W, edge 3.00%.
- SF@CIN S. Stewart 2+ TB: outcome W, edge -3.69%.
- TOR@MIL G. Sanchez HR: outcome W, edge -7.63%.

## Worst misses
- SEA@SD L. Raley 2+ TB: outcome L, edge -3.68%.
- SF@CIN S. Stewart HR: outcome L, edge -8.31%.
- LAA@NYY M. Trout HR: outcome L, edge -12.14%.

## Failure patterns
- Negative edge at open: 3
- HR variance: 2
- Missing tier/model linkage: 1

## Model improvement recommendations
1. Keep HR in a high-variance evaluation bucket and evaluate 2+ TB/K separately as core stability props.
2. Enforce a price gate: only label +EV when market odds are present and model probability is above market implied probability.
3. Expand PLAYER_ALIASES for recurring name variants (suffixes, accents, sportsbook abbreviations).
4. Track rolling 7-day ROI and hit-rate by prop family, tier, and confidence; auto-downgrade weak buckets.

## Data Quality Warnings
### Unmatched player names
- LAA@NYY A. Judge (NYY) 2+ TB

### Parsing / mapping warnings
- row 5: unmatched model row for LAA@NYY | A. Judge | NYY | 2+ TB

### Validation checks
- unmatched player mappings: 1
