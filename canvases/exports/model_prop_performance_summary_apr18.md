# Model Prop Performance Summary — apr18

## Matchup / Target Accuracy
- Overall prop record: **129-411-0**
- Overall target hit rate (W/L only): **23.9%**
- HR record: **33-237-0**
- 2+ TB record: **96-174-0**
- Pitcher K record: **0-0-0**

## Recommendation-Rule ROI
- Recommended priced prop count: **31**
- Recommended ROI: **22.13%**
- Recommended HR ROI: **N/A**
- Recommended 2+ TB ROI: **22.13%**
- HR is tracked as a separate high-variance family and should not be blended into 2+ TB stability claims.
- **Primary ROI should be judged on this recommendation-gated subset, not the full priced universe.**

### Recommended ROI by prop type
- 2+ TB: 22.13%

### Recommended ROI by tier
- A+: 21.76%
- A: 85.50%
- B: -100.00%

### Recommended ROI by confidence

## Diagnostic ROI (all priced props)
- All priced prop count: **314**
- All priced ROI: **-3.07%**
- All priced HR ROI: **0.21%**
- All priced 2+ TB ROI: **-4.54%**
- Use this section as a market-coverage diagnostic, not as the lead performance claim.

## Closing-Line Value
- Recommended rows with closing odds: **0**
- Recommended average CLV: **N/A**
- Recommended beat-close rate: **N/A**

## Unpriced Watchlist Accuracy
- Unpriced (target-only) count: **219**
- Unpriced record: **38-181-0**
- Unpriced hit rate (W/L only): **17.4%**

## Best hits
- STL@HOU Yordan Alvarez 2+ TB: outcome W, edge 15.78%.
- SF@WSH James Wood 2+ TB: outcome W, edge 15.00%.
- LAD@COL Freddie Freeman 2+ TB: outcome W, edge 15.00%.
- LAD@COL Dalton Rushing 2+ TB: outcome W, edge 15.00%.
- KC@NYY Ben Rice 2+ TB: outcome W, edge 14.18%.

## Worst misses
- BAL@CLE Daniel Schneemann 2+ TB: outcome L, edge 22.69%.
- STL@HOU Jordan Walker 2+ TB: outcome L, edge 19.29%.
- SF@WSH CJ Abrams 2+ TB: outcome L, edge 18.65%.
- STL@HOU Christian Vázquez 2+ TB: outcome L, edge 12.72%.
- SD@LAA Adam Frazier 2+ TB: outcome L, edge 9.75%.

## Failure patterns
- Negative edge at open: 201
- HR variance: 86

## Model improvement recommendations
1. Keep HR in a high-variance evaluation bucket and evaluate 2+ TB/K separately as core stability props.
2. Enforce a price gate: only label +EV when market odds are present and model probability is above market implied probability.
3. Expand PLAYER_ALIASES for recurring name variants (suffixes, accents, sportsbook abbreviations).
4. Track rolling 7-day ROI and hit-rate by prop family, tier, and confidence; auto-downgrade weak buckets.

## Data Quality Warnings
### Parsing / mapping warnings
- row 85: invalid market_odds '50' for NYM@CHC | Francisco Alvarez | NYM | 2+ TB
- row 119: invalid market_odds '50' for TB@PIT | Jake Fraley | TB | 2+ TB
- row 161: invalid market_odds '-2' for SF@WSH | Drew Gilbert | SF | 2+ TB
- row 201: invalid market_odds '50' for CWS@ATH | Jeff McNeil | ATH | 2+ TB
- row 311: invalid market_odds '50' for BAL@CLE | Chase DeLauter | CLE | 2+ TB
- row 511: invalid market_odds '-2' for SD@LAA | Jackson Merrill | SD | 2+ TB
- row 535: invalid market_odds '50' for SD@LAA | Oswald Peraza | LAA | 2+ TB
