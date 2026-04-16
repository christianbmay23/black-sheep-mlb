# Model Prop Performance Summary — 2026-04-15

## Core separation: target accuracy vs betting ROI
- **Target accuracy** = whether the prop target hit, regardless of market price.
- **Betting ROI** = unit profitability, only when market odds exist.
- Props without market odds are tracked as target accuracy only (never labeled +EV).

## Record snapshot
- Overall prop record: **7-4-1**
- HR record: **1-2-1**
- 2+ TB record: **3-1-0**
- Pitcher K record: **1-0-0**
- Betting ROI (all priced props): **83.11%**
- Target-only tracked props (no odds): **1**

## ROI by prop type
- 2+ TB: 111.25%
- HIT: -100.00%
- HR: 100.00%
- K: 95.24%
- RBI: N/A
- RUN: 90.91%

## ROI by tier
- A: 143.00%
- B: -100.00%

## ROI by confidence
- High: 102.50%

## Best hits
- NYM@LAD F. Alvarez 2+ TB: outcome W, edge 3.00%, mode betting_roi.
- SF@CIN S. Stewart 2+ TB: outcome W, edge -3.69%, mode betting_roi.
- TOR@MIL G. Sanchez HR: outcome W, edge -7.63%, mode betting_roi.

## Worst misses
- SEA@SD L. Raley 2+ TB: outcome L, edge -3.68%, mode betting_roi.
- SF@CIN S. Stewart HR: outcome L, edge -8.31%, mode betting_roi.
- LAA@NYY M. Trout HR: outcome L, edge -12.14%, mode betting_roi.

## Failure patterns
- Negative edge at open: 3
- HR variance: 2
- Missing tier/model linkage: 1

## Model improvement recommendations
1. Split evaluation dashboards by prop family: keep HR in a high-variance bucket and treat 2+ TB and K props as core stability buckets.
2. Enforce a price gate: no +EV label unless market odds are present and model probability exceeds market implied probability by a configured threshold.
3. Re-run player name normalization checks each slate and maintain alias mapping for recurring mismatches to reduce unlinked rows.
4. Add rolling 7-day ROI and hit-rate control limits per tier/confidence, and auto-downgrade buckets that underperform.

## Data-quality warnings
- row 5: could not match model row for LAA@NYY A. Judge NYY 2+ TB
