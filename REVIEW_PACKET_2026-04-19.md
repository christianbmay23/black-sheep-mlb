# External Review Packet — Black Sheep MLB

Date: 2026-04-19  
Repo: `black-sheep-mlb`  
Current pushed revision: `447ca62`  

## Goal of this packet

This packet is meant to orient an outside reviewer quickly and give them a concrete review scope. The system has moved beyond a manual canvas workflow into a real data pipeline with live-source verification, slate snapshots, backtesting artifacts, and a report surface. The current bottleneck is not implementation speed. It is credibility, calibration, and methodology.

The review should answer one central question:

Can this system be trusted as a serious MLB pregame decision engine, and if not, what are the highest-leverage fixes?

## What the system does today

- Builds dated MLB slate canvases and exports for each day.
- Pulls live schedule, probable starters, lineups, weather, odds, and player prop markets.
- Scores game sides with a win-probability model.
- Scores batter HR and 2+ TB props with a separate batter prop model.
- Writes CSV, HTML, and JSON snapshot artifacts for each run.
- Backtests prior slates against actual results.

## Current architecture

Core files:

- `models/game_model.py`
- `models/prop_model.py`
- `canvases/exports/live_mlb_data.py`
- `canvases/exports/apr16_compute.py`
- `canvases/exports/build_ml_exports.py`
- `canvases/exports/backtest_tracker.py`
- `canvases/exports/prop_backtest_tracker.py`
- `canvases/exports/generate_boxscore_backtest_inputs.py`

Per-slate inputs / canvases:

- `models/apr16_inputs.py`
- `models/apr18_inputs.py`
- `models/apr19_inputs.py`
- `canvases/mlb-pregame-intel-apr16.canvas.tsx`
- `canvases/mlb-pregame-intel-apr18.canvas.tsx`
- `canvases/mlb-pregame-intel-apr19.canvas.tsx`

Generated artifacts of note:

- `canvases/exports/mlb-pregame-intel-apr19-report.html`
- `canvases/exports/snapshots/apr19/apr19-latest.json`
- `canvases/exports/boxscores/apr18/`
- `canvases/exports/model_performance_summary_apr15.md`
- `canvases/exports/model_performance_summary_apr16.md`
- `canvases/exports/model_performance_summary_apr18.md`
- `canvases/exports/model_prop_performance_summary_apr15.md`
- `canvases/exports/model_prop_performance_summary_apr18.md`

## Data sources currently wired in

- MLB Stats API
- Baseball Savant
- RotoWire
- Open-Meteo
- Odds API

Provider fallback currently exists for:

- game odds
- HR props
- 2+ TB props
- lineup verification

## What changed recently

This revision is materially different from the original manual canvas flow:

- strict live-data compute mode now fails instead of silently degrading
- repo-local `.env` support for Odds API key loading
- provider fallback chain for odds and prop markets
- lineup verification across MLB API and RotoWire
- bullpen and recent-form features added to game and prop scoring
- batter-vs-pitcher inputs integrated into prop scoring
- run snapshots written for every compute run
- full boxscore fetch + prop result generation added for backtesting
- Apr 19 slate support added
- prop system split into separate HR vs 2+ TB tiers and gates
- HTML report upgraded into a game-by-game dashboard with reasons, lineups, ranked boards, and time sorting

## Modeling surface

### Game model

Primary inputs in `models/game_model.py`:

- starting pitcher xERA
- lineup quality proxy from Savant-derived rows
- bullpen score
- recent-form score
- weather / run-environment factor
- basic variance / missing-data handling
- market comparison via devigged moneylines and edge tiering

Current high-level weighting:

- SP: 33%
- bullpen: 20%
- lineup: 22%
- recent form: 15%
- park/weather: 7%
- variance term: 3%

### Prop model

Primary inputs in `models/prop_model.py`:

- xSLG
- barrel rate
- actual SLG
- hard-hit rate
- average exit velocity
- estimated BA
- handedness / platoon adjustment
- opposing starter xERA and contact-quality signals
- recent hitter form
- weather factor
- opposing bullpen score
- starter recent-form score
- batter-vs-pitcher sample, with stricter floors than earlier versions

Important recent design changes:

- HR and 2+ TB are now treated as distinct products
- HR BvP sample floor is stricter than 2+ TB
- 2+ TB edge is only treated as aligned when the market line is actually `1.5`
- recommendation gating is family-specific and price-aware

## Validation snapshot

### Game-side backtests available

- Apr 15: `7-5`, 58.3%
- Apr 16: `5-5`, 50.0%
- Apr 18: `6-9`, 40.0%

Combined currently tracked game sample:

- 37 settled picks
- 18 wins / 19 losses
- 48.6% accuracy

Combined game accuracy by tier:

- A+: `7-7`, 50.0%
- A: `1-1`, 50.0%
- B: `1-3`, 25.0%
- C: `1-2`, 33.3%
- D: `8-6`, 57.1%

Interpretation:

- The current game model is not yet validated as a clear winner over baseline.
- The top-tier classification looks suspect. A+ is not outperforming the field strongly enough.
- Lower tiers are not behaving the way a well-calibrated decision ladder should.

### Prop backtests available

Small legacy sample:

- Apr 15 priced ROI: `83.11%` on 11 priced props

Main current reference sample:

- Apr 18 priced ROI: `10.70%` on 321 priced props
- Apr 18 ROI by type:
  - 2+ TB: `15.25%`
  - HR: `0.21%`

Apr 18 priced positive-edge subset:

- 40 priced props with positive model edge
- aggregate ROI: `129.53%`
- positive-edge 2+ TB: 36 bets, `155.03%` ROI
- positive-edge HR: 4 bets, `-100.0%` ROI

Interpretation:

- 2+ TB currently looks materially stronger than HR.
- HR remains noisy enough that it should be treated as a separate high-variance bucket, not a coequal prop family.
- The current prop work improved evaluation honesty and gating, but the evidence is still too thin to claim durable alpha.

## Current strengths

- The pipeline is now reproducible enough to audit.
- Runs produce snapshots instead of only presentation outputs.
- Live-source strict mode makes missing inputs visible instead of hidden.
- The codebase now has meaningful backtest artifacts instead of only narratives.
- Prop evaluation is more honest than before because line mismatch and missing price handling were tightened.
- The HTML report is now usable as an analyst-facing dashboard rather than just a CSV dump.

## Known weaknesses and open risks

- Sample size is still small.
- Game-side tier calibration is not convincing.
- A+ game picks are not separating from lower tiers.
- HR props are still much noisier than 2+ TB and may require a more conservative model or stronger gating.
- Backtests are date-limited and not yet a broad rolling validation set.
- Closing-line value is not yet a real evaluation backbone.
- The system still relies on hand-maintained per-slate inputs for some narrative and slate-level fields.
- Some evaluation summaries mix pre- and post-refactor behavior, so not every historical result is apples-to-apples.
- There is still risk of feature leakage, timestamp leakage, or hidden post-lineup information if the review does not inspect the compute path carefully.

## What the reviewer should focus on

Primary review tracks:

- data integrity
- model design
- backtest methodology
- calibration / thresholding
- operational robustness

Questions the reviewer should answer:

1. Is any feature using information that would not have been available at decision time?
2. Are lineups, probables, weather, and market pulls timestamped and handled in a way that avoids leakage?
3. Is the game model structurally over-weighting starting pitching or under-weighting market information?
4. Are A+/A/B/C/D thresholds calibrated in a defensible way?
5. Should the game model be blended with the market, and if so, how should that be calibrated?
6. Should HR and 2+ TB be fully separate products with different priors, thresholds, and validation standards?
7. Is the current BvP usage appropriate, or still too noisy even with stricter floors?
8. Is the backtest methodology faithful to how the slate was actually available pregame?
9. What minimal validation sample would be required before claiming the model is clearly better now?
10. Which metrics should be treated as primary: accuracy, CLV, ROI, calibration, or a weighted combination?

## Suggested reviewer deliverable

Ask the external reviewer to return:

- prioritized findings labeled high / medium / low severity
- explicit opinion on whether the current backtests support production trust
- concrete calibration recommendations
- concrete feature additions or removals
- concrete methodology fixes for backtesting and evaluation
- a go / no-go recommendation on using current A+ and HR outputs as real decision signals

## Recommended review scope by role

If using one reviewer:

- ask for a single end-to-end audit, but explicitly prioritize model validity over UI polish

If using two reviewers:

- Reviewer A: quant / modeling / calibration / backtesting
- Reviewer B: software / data pipeline / reproducibility / source integrity

## What not to optimize for yet

- more UI polish
- more narrative copy
- more feature count for its own sake

The system does not need more complexity until review answers whether the current complexity is valid.

## Best starting points for the reviewer

Read in this order:

- `README.md`
- `models/game_model.py`
- `models/prop_model.py`
- `canvases/exports/live_mlb_data.py`
- `canvases/exports/apr16_compute.py`
- `canvases/exports/build_ml_exports.py`
- `canvases/exports/model_performance_summary_apr15.md`
- `canvases/exports/model_performance_summary_apr16.md`
- `canvases/exports/model_performance_summary_apr18.md`
- `canvases/exports/model_prop_performance_summary_apr18.md`
- `canvases/exports/snapshots/apr19/apr19-latest.json`

## Bottom line

The project has moved from a manual baseball canvas into a real, testable system. That is meaningful progress. But the current evidence does not yet justify saying the model is clearly better now. The right next move is a serious external review aimed at model validity, calibration, and evaluation discipline.
