# External Agent Handoff — 2026-04-19

Repo: `black-sheep-mlb`  
Current pushed revision: `447ca62`  
Primary orientation doc: `REVIEW_PACKET_2026-04-19.md`

## What this is

This file is a paste-ready handoff bundle for an external agent or reviewer. It includes:

- a full end-to-end review prompt
- a quant/model-specific review prompt
- a software/data-pipeline-specific review prompt
- a post-review implementation prompt
- a required deliverable format

The goal is to get a serious outside review of whether this system is actually valid, calibrated, and operationally sound, not just whether the code "looks good."

## Reviewer context

This repo is an MLB pregame modeling and reporting system. It:

- builds dated slate canvases and exports
- ingests live schedule, starters, lineups, weather, odds, and prop markets
- scores game sides with a win-probability model
- scores batter HR and 2+ TB props with a prop model
- writes HTML, CSV, and JSON snapshot artifacts
- backtests prior slates

Current concern:

The system is materially better operationally than it was originally, but we do **not** yet have enough evidence to honestly claim the model is clearly better now. The outside review should focus on:

- predictive validity
- calibration
- data integrity
- leakage risk
- backtest quality
- operational robustness

## Files the reviewer should read first

- `REVIEW_PACKET_2026-04-19.md`
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

Optional but useful:

- `canvases/exports/generate_boxscore_backtest_inputs.py`
- `canvases/exports/prop_backtest_tracker.py`
- `canvases/exports/backtest_tracker.py`
- `canvases/exports/boxscores/apr18/`

## Prompt 1: Full End-to-End External Review

Paste this into the external agent as-is:

```text
You are performing an external review of an MLB pregame modeling and reporting system in the repository `black-sheep-mlb` at revision `447ca62`.

Your task is not to praise the project or summarize it casually. Your task is to determine whether this system is actually trustworthy as a serious MLB pregame decision engine, and if not, what the highest-leverage fixes are.

Read these files first:
- REVIEW_PACKET_2026-04-19.md
- README.md
- models/game_model.py
- models/prop_model.py
- canvases/exports/live_mlb_data.py
- canvases/exports/apr16_compute.py
- canvases/exports/build_ml_exports.py
- canvases/exports/model_performance_summary_apr15.md
- canvases/exports/model_performance_summary_apr16.md
- canvases/exports/model_performance_summary_apr18.md
- canvases/exports/model_prop_performance_summary_apr18.md
- canvases/exports/snapshots/apr19/apr19-latest.json

Then audit the system across these dimensions:

1. Data integrity
- Are schedule, lineup, starter, weather, and market inputs being collected and verified in a sound way?
- Is there any likely source mismatch or silent degradation risk?
- Are fallback providers used safely, or do they create consistency / comparability problems?

2. Leakage / decision-time correctness
- Is any feature or data path likely using information that would not have been available at true decision time?
- Are lineups, markets, and recent-form features timestamp-safe enough for fair backtesting?
- Is there any hidden lookahead risk in snapshots, backtests, or model inputs?

3. Game model validity
- Is the structure of the win-probability model coherent?
- Are feature weights defensible?
- Is the model over-weighting starter quality or under-weighting market information?
- Are A+/A/B/C/D thresholds calibrated in a meaningful way?

4. Prop model validity
- Is the separation of HR vs 2+ TB sufficient and logically consistent?
- Is BvP used responsibly, or still too aggressively?
- Are handedness, recent form, weather, bullpen, and Statcast features used sensibly?
- Is the recommendation gating appropriate for high-variance HR markets?

5. Backtest methodology
- Are the current backtests representative of what the system would really have known pregame?
- Are ROI and target-hit summaries being interpreted correctly?
- Are there obvious methodology flaws or missing baselines?
- What is missing before one could honestly claim the model is "clearly better now"?

6. Operational robustness
- Is the compute pipeline reproducible?
- Are strict-mode failures appropriately enforced?
- Is the system sufficiently debuggable and auditable?
- Are snapshots, exports, and boxscore artifacts enough to support long-term review?

Important constraints for your review:
- Findings first, not overview first.
- Be blunt and specific.
- Cite exact file paths and line references whenever possible.
- Separate "operationally improved" from "predictively proven."
- If something is unknown because the sample is too small, say that directly.
- Do not propose random extra features unless you can justify them against the current evidence.
- Do not optimize for UI polish; that is secondary.

Required output format:

1. Findings
- Ordered by severity.
- Each finding should include:
  - title
  - why it matters
  - evidence with file references
  - recommended fix

2. Questions / uncertainties
- Only include things that materially affect confidence in the system.

3. Verdict
- Is the system operationally credible?
- Is the system predictively credible?
- Can the owners honestly claim it is clearly better now?

4. Priority roadmap
- Top 3 next actions
- What to stop doing
- What to validate before changing anything else

Do not be polite at the expense of clarity.
```

## Prompt 2: Quant / Model Review

Use this if you want a specialist review focused on modeling, calibration, and backtesting:

```text
You are acting as an external quant reviewer for an MLB pregame modeling system in the repository `black-sheep-mlb` at revision `447ca62`.

Your review should focus on model logic, calibration, and evaluation discipline, not software ergonomics.

Read these files first:
- REVIEW_PACKET_2026-04-19.md
- models/game_model.py
- models/prop_model.py
- canvases/exports/apr16_compute.py
- canvases/exports/model_performance_summary_apr15.md
- canvases/exports/model_performance_summary_apr16.md
- canvases/exports/model_performance_summary_apr18.md
- canvases/exports/model_prop_performance_summary_apr15.md
- canvases/exports/model_prop_performance_summary_apr18.md
- canvases/exports/snapshots/apr19/apr19-latest.json

Audit the following:

1. Game model structure
- Are the features coherent?
- Are the weights defensible?
- Does the current structure create systematic overconfidence?
- Is the edge-to-tier ladder justified?
- Should the game model be anchored more heavily to the market?

2. Prop model structure
- Are HR and 2+ TB modeled as sufficiently distinct products?
- Is BvP still too noisy to trust?
- Are the current thresholds and price gates sensible?
- Is there evidence that 2+ TB is a real signal while HR remains mostly noise?

3. Backtesting quality
- Are the existing summaries enough to support any predictive claim?
- What baseline comparisons are missing?
- What sample size would you require before accepting any strong claim of improvement?
- Which metric should be primary: hit rate, ROI, calibration, or CLV?

4. Calibration review
- Which buckets are currently misleading?
- What immediate recalibrations would you recommend?
- What should be paused or de-emphasized until validated?

Required output:

1. Findings, ordered by severity
2. Calibration verdict on game tiers
3. Calibration verdict on HR vs 2+ TB
4. Minimum viable validation plan
5. Go / no-go opinion on current A+ game picks and HR props

Be explicit about what is not yet proven.
```

## Prompt 3: Software / Data Pipeline Review

Use this if you want a specialist review focused on ingestion, reproducibility, and source integrity:

```text
You are acting as an external software and data-pipeline reviewer for an MLB pregame modeling system in the repository `black-sheep-mlb` at revision `447ca62`.

Your job is to review whether the system is operationally trustworthy, reproducible, and safe from silent data-quality failures.

Read these files first:
- REVIEW_PACKET_2026-04-19.md
- README.md
- canvases/exports/live_mlb_data.py
- canvases/exports/apr16_compute.py
- canvases/exports/build_ml_exports.py
- canvases/exports/generate_boxscore_backtest_inputs.py
- canvases/exports/backtest_tracker.py
- canvases/exports/prop_backtest_tracker.py
- canvases/exports/snapshots/apr19/apr19-latest.json

Audit the following:

1. Live ingestion correctness
- Are the source adapters robust?
- Are provider fallbacks implemented safely?
- Are there silent mismatch, aliasing, or stale-data risks?

2. Strict-mode integrity
- Does strict mode actually protect against partial or misleading runs?
- Are there places where incomplete data could still leak through?

3. Snapshot and artifact quality
- Are snapshots rich enough to support reproducibility and postmortem review?
- Are exports, backtests, and boxscore artifacts sufficient for auditability?

4. Failure handling
- Are missing lineups, markets, or weather handled transparently?
- Are the current error surfaces good enough for operators?

5. Maintainability
- Is the pipeline structured well enough for continued iteration without creating hidden regressions?
- Where are the main technical debt or coupling risks?

Required output:

1. Findings, ordered by severity
2. Data integrity verdict
3. Reproducibility verdict
4. Top operational risks
5. Top engineering fixes before additional model complexity

Focus on integrity and reliability, not aesthetic preferences.
```

## Prompt 4: Post-Review Implementation Prompt

Use this only after an external reviewer has already produced findings and you want another agent to implement them:

```text
You are taking over the repository `black-sheep-mlb` after an external review.

Your task is to implement only the high-confidence, high-leverage recommendations from the review. Do not add unrelated features. Do not redesign the system speculatively.

Inputs you should use:
- REVIEW_PACKET_2026-04-19.md
- EXTERNAL_AGENT_HANDOFF_2026-04-19.md
- the external review findings pasted below

Your workflow:

1. Extract the top findings that are:
- high severity
- well-supported by evidence
- implementable without inventing new requirements

2. Group them into:
- code changes
- data / validation changes
- backtest / evaluation changes

3. Implement the highest-value items first.

4. Verify each change with the most relevant local checks, exports, or backtests.

5. Summarize:
- what changed
- what improved
- what remains unproven

Important constraints:
- Do not silently change model behavior without documenting the reasoning.
- Do not claim predictive improvement without new evidence.
- Preserve strict-mode integrity.
- If a finding is correct but not yet implementable, say so clearly.

External review findings:

[PASTE REVIEW HERE]
```

## Required deliverable format for the external reviewer

Tell the reviewer to structure their response like this:

```text
Findings
1. [severity] Title
   - Why it matters
   - Evidence
   - Recommended fix

2. [severity] Title
   - Why it matters
   - Evidence
   - Recommended fix

Questions / uncertainties
- ...

Verdict
- Operational credibility:
- Predictive credibility:
- Can the owners honestly claim the model is clearly better now:

Priority roadmap
1. ...
2. ...
3. ...
```

## Recommended use

If you only use one external agent:

- use Prompt 1

If you use two:

- give Prompt 2 to a quant/model reviewer
- give Prompt 3 to a software/data reviewer

If the review is strong and concrete:

- use Prompt 4 to turn findings into implementation work

## Bottom line

Do not ask the external reviewer for vague impressions. Ask for a hard audit of validity, calibration, leakage risk, and operational trustworthiness.
