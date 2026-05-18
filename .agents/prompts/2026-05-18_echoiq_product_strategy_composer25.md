ROLE:
You are Cursor Agent acting as EchoIQ’s senior product strategist, MLB research-systems architect, prediction workflow designer, and technical roadmap lead.

REASONING LEVEL:
Maximum / deep. Think like a skeptical investor-grade product architect and an elite MLB betting-research operator. Be honest, rigorous, and specific. Do not flatter the current system. Identify what is real, what is weak, what is missing, and how to improve it.

MODEL / EXECUTION NOTE:
Use Composer 2.5 Fast. This is a long repo-inspection and documentation-generation task. Prioritize careful file reading, strict instruction following, repo-grounded specificity, and safe documentation-only output. Do not make code changes.

WORKING DIRECTORY:
/Users/christianmay/Projects/black-sheep-mlb

MISSION:
Produce a full investor/product/system assessment and improvement roadmap for EchoIQ / black-sheep-mlb.

This is not a normal code review. This is a strategic product and workflow assessment. The goal is to clearly explain what EchoIQ is, why it exists, how it should work, how props/predictions are picked, why price/odds matter, why the system can become trustworthy/actionable, what is currently strong, what is currently weak, and exactly how to improve player/team/matchup research, workflow, modeling, verification, and product readiness.

Do not make betting picks in this task. This task is about the system, product, workflow, and roadmap.

CURRENT REPO CONTEXT:
The source-of-truth repo is:

/Users/christianmay/Projects/black-sheep-mlb

Recent important commits:
- c007157 docs(echoiq): consolidate live verified workflow
- 319fda8 docs(echoiq): add May 18 system assessment

The current system has:
- package-style MLB data/prediction code under black_sheep_mlb/
- EchoIQ v3 verification/research workflow under echoiq_v3/
- daily slate workspace under slates/
- system assessment reports under reports/
- canvas/model-era outputs under canvases/, canvases/exports/, models/
- read-only dashboard under dashboard/
- agent instructions/skills under .agents/

IMPORTANT FILES TO READ FIRST:
Read and ground your assessment in these files before writing anything:

Core orientation:
- README.md
- AGENTS.md
- WORKFLOW.txt
- echoiq_v3/AGENTS.md
- echoiq_v3/README.md
- echoiq_v3/START_HERE.md

Consolidated framework:
- echoiq_v3/docs/framework/verification_taxonomy.md
- echoiq_v3/docs/framework/dual_grade_framework.md
- echoiq_v3/docs/framework/grade_assignment_quick_reference.md
- echoiq_v3/docs/framework/price_ingestion_schema.json
- echoiq_v3/docs/framework/ev_calculation_examples.md
- echoiq_v3/docs/framework/matchup_structures.md
- echoiq_v3/docs/framework/savant_fetch_plan.md
- echoiq_v3/docs/framework/postgame_grading_template.md

Live verified workflow:
- echoiq_v3/prompts/live_verified_workflow/step_1_setup_check.md
- echoiq_v3/prompts/live_verified_workflow/step_2_execution_plan.md
- echoiq_v3/prompts/live_verified_workflow/step_3_pregame_live_verified_run.md
- echoiq_v3/prompts/live_verified_workflow/post_run_feedback_audit.md

May 18 assessment bundle:
- reports/2026-05-18_system_assessment/system_assessment.md
- reports/2026-05-18_system_assessment/today_research_workflow.md
- reports/2026-05-18_system_assessment/codex_findings_summary.md
- reports/2026-05-18_system_assessment/may18_source_capture_template.md
- reports/2026-05-18_system_assessment/may18_prediction_gate_template.csv

May 18 ignored local slate packet, if available on disk:
- slates/2026-05-18/source_log.md
- slates/2026-05-18/unresolved_gaps.md
- slates/2026-05-18/outlier_capture.md
- slates/2026-05-18/ballpark_pal_capture.md
- slates/2026-05-18/savant_candidate_notes.md
- slates/2026-05-18/candidate_watchlist.md
- slates/2026-05-18/prediction_gate_board.csv
- slates/2026-05-18/final_card.md
- slates/2026-05-18/04_final_card/official_card.csv
- slates/2026-05-18/04_final_card/watchlist.csv
- slates/2026-05-18/04_final_card/conditional_card.csv
- slates/2026-05-18/04_final_card/final_card_report.md

Existing code/workflow areas:
- echoiq_v3/daily_agent/
- echoiq_v3/scripts/
- echoiq_v3/templates/
- black_sheep_mlb/
- black_sheep_mlb/pipelines/
- black_sheep_mlb/hr_intelligence/
- scripts/
- models/
- dashboard/
- .agents/

SAFETY / REPO RULES:
- Do not delete files.
- Do not stage, commit, or push.
- Do not modify .env or secrets.
- Do not use paid APIs.
- Do not force-add ignored slate folders.
- Do not place wagers, click betslips, or interact with betting account pages.
- Do not make broad code changes unless explicitly requested later.
- This task should create assessment/roadmap documentation only.
- If you create files, put them under:
  reports/2026-05-18_product_strategy/
- Keep any suggested code changes as roadmap items unless tiny documentation fixes are necessary.

BACKGROUND / PRODUCT PHILOSOPHY TO INCORPORATE:

EchoIQ is not supposed to be “an AI that spits out picks.”

The goal is to build a verification-first MLB intelligence system that turns messy baseball information into structured, auditable, price-aware decisions.

The product’s job is to answer:
1. Which players or teams have real baseball advantages today?
2. Which of those advantages are actually mispriced by the market?
3. Which ideas are strong enough to act on, and which are only watchlist/trap spots?

A major product insight:
Good player ≠ good matchup ≠ good bet.

EchoIQ must separate:
- baseball quality
- matchup quality
- price/value quality
- actionability

The system should use two core layers:

LAYER 1 — BASEBALL INTELLIGENCE:
Question: Is this a good baseball spot?

Research should include:
- player form
- rolling stats
- quality of contact
- barrel rate
- hard-hit rate
- xSLG / xwOBA
- pitch-type performance
- pitcher vulnerability
- pitcher arsenal
- pitcher handedness
- batter handedness
- pitch arsenal vs batter strengths
- batter hot zones
- pitcher location tendencies
- BvP history, but not over-weighted
- lineup position
- projected plate appearances
- park factors
- weather
- roof status
- team context
- stack context
- bullpen context
- game environment
- late scratch/injury context

This layer produces a BASEBALL_GRADE or BASEBALL_SCORE.

LAYER 2 — MARKET INTELLIGENCE:
Question: Is the good baseball spot actually worth the price?

Research should include:
- current odds
- exact book
- best available price
- line movement
- implied probability
- fair probability
- fair odds
- market edge
- book-to-book differences
- Outlier fair price or projection where available
- CLV later
- whether the price threshold is met

This layer produces a BET_GRADE or EDGE_SCORE.

Core principle:
EchoIQ does not just predict “will this happen?”
It predicts “is the market wrong enough to justify action?”

Example principle:
A 49% probability can be excellent at +150 and terrible at -150.

ACTIONABILITY / LABEL SYSTEM:
EchoIQ should produce decision states, not just “top picks.”

Use labels:
- BET: every gate clears; price is current; edge exists; risk flags documented.
- LEAN: strong verified baseball case, but not enough price/edge proof for BET.
- CONDITIONAL: actionable only if listed condition happens, such as lineup confirmation or price threshold.
- WATCHLIST: good research target, but too many gates missing.
- LOTTERY: long-shot HR concept only, not core value.
- PASS: insufficient edge or missing critical information.
- AVOID: bad price, bad matchup, adverse environment, scratch risk, or misleading narrative.

STRICT BET GATES:
A BET requires:
- game is pregame/actionable
- starter verified
- lineup verified
- player confirmed starting for player props
- current exact price captured
- book label captured
- implied probability calculated
- fair probability or fair-price rationale documented
- edge/value rationale documented
- weather/roof verified
- Ballpark Pal captured where relevant
- Outlier or market context captured where relevant
- Statcast/Savant checked for finalists where relevant
- risk flags documented
- source timestamps present

If any gate is missing, do not use BET.

TRUSTWORTHINESS:
Do not pitch EchoIQ as trustworthy because “the AI is smart.”
Pitch it as trustworthy because it is:
- auditable
- skeptical
- source-grounded
- timestamped
- gate-based
- price-aware
- no-fabrication by design
- willing to say no
- postgame-graded
- explicit about missing data
- explicit about what kills a play

EchoIQ should log:
- source used
- URL/source name
- timestamp
- what was captured
- what is missing
- lineups
- starters
- weather/roof
- Ballpark Pal factors
- Outlier prices/projections
- book/odds
- fair probability
- implied probability
- edge
- risk flags
- what kills the play

CURRENT REALITY / HONEST STATUS:
Current EchoIQ is not yet a finished betting engine. It is a strong prototype of a research and verification operating system.

Currently strong:
- source logging
- verification gates
- auditability
- no-fabrication rules
- postgame/no-hindsight discipline
- separating baseball signal from betting value
- MLB.com / MLB Stats API as official backbone
- repeatable slate folders
- validation scripts
- conservative official-card behavior
- preserving BET as a high bar
- dual-grade concept: BASEBALL_GRADE vs BET_GRADE

Currently weak:
- full baseball-first slate discovery is incomplete
- matchup/player analysis is too manual and too narrow
- too much prompt-driven workflow, not enough automated runner
- Outlier capture is manual/authenticated
- Ballpark Pal capture is manual
- player-prop price ingestion is weak
- lineup/weather/roof checks are not fully automated
- Savant pitch/zone checks are not operationalized across candidates
- fair-probability model for HR/TB/hits is not mature enough
- no robust CLV tracking yet
- dashboard is not yet an EchoIQ v3 gate/status dashboard
- product is not yet investor/UI ready
- betting readiness is still limited until live data, price, and gate automation improve

IMPORTANT MAY 18 EXAMPLE:
Use the Schwarber case as a key demonstration of why the system matters.

The system found a strong baseball case for Kyle Schwarber O1.5 TB:
- favorable park/run/HR environment
- strong Schwarber Statcast profile
- weak opposing pitcher damage profile
- good recent/Outlier trend data

But Outlier fair price was +105 while the best market was -110, creating negative edge. Therefore EchoIQ correctly downgraded it to CONDITIONAL instead of forcing a BET.

This is the product philosophy in action:
Strong baseball case does not automatically mean good bet.

HOW PLAYER AND MATCHUP RESEARCH SHOULD IMPROVE:
Design a better baseball-first research engine.

For every game, EchoIQ should eventually generate:
- starter vulnerability profile
- opposing team handedness matchup
- top 3 HR candidates
- top 3 total bases candidates
- top 2 hit candidates
- park/weather boost/suppression
- lineup cluster strength
- bullpen risk
- trap flags
- confidence level
- source gaps

For every batter candidate, EchoIQ should score:
- recent contact quality
- season baseline
- rolling 7/14/30-day form
- pitch-type fit
- zone fit
- handedness fit
- park fit
- weather fit
- lineup spot
- projected plate appearances
- opposing starter weakness
- bullpen follow-through
- price sensitivity
- risk penalty

Potential scoring framework:
- Batter Quality: 0–100
- Pitcher Vulnerability: 0–100
- Pitch-Type Match: 0–100
- Zone/Hotspot Match: 0–100
- Park/Weather Boost: 0–100
- Lineup/PA Strength: 0–100
- Recent Form: 0–100
- Bullpen Context: 0–100
- Market Price/Edge: separate score, not blended too early
- Risk Penalty: 0–100

Possible formula:
BASEBALL_SCORE = weighted matchup strength before odds
EDGE_SCORE = fair probability - implied probability after odds
FINAL_DECISION = baseball score + edge score + gate status

HOW WORKFLOW SHOULD IMPROVE:
The ideal daily workflow:

MORNING:
- Create slate.
- Verify schedule/starters.
- Generate preliminary game environments.
- Identify early baseball candidates.
- Mark all as WATCHLIST only.

MIDDAY:
- Pull Ballpark Pal.
- Pull weather/roof.
- Pull Statcast/Savant for top candidates.
- Pull Outlier boards.
- Start price capture.
- Produce LEAN/CONDITIONAL candidates.

PREGAME:
- Confirm lineups.
- Confirm starters.
- Confirm exact prices.
- Calculate fair probability and edge.
- Run gates.
- Promote only eligible rows to BET.
- Keep everything else WATCHLIST/CONDITIONAL/PASS/AVOID.

POSTGAME:
- Grade results.
- Grade CLV.
- Grade process quality.
- Identify hidden winners.
- Identify false positives.
- Update model lessons.
- Improve next-slate rules.

HOW PREDICTIONS SHOULD BECOME MORE INTELLIGENT:
Every candidate should include:
- bull case
- bear case
- fair price
- playable price
- pass price
- what kills it
- confidence tier
- source confidence
- baseball grade
- bet grade
- edge
- source gaps
- postgame learning tag

The model should stop answering:
“Who do you like?”

And start answering:
- What evidence would make this true?
- What evidence would make this false?
- What price would make this playable?
- What would kill the play?
- What is missing?
- What needs to be rechecked at lock?

INVESTOR-PITCH LANGUAGE TO INCORPORATE:
EchoIQ is a verification-first sports intelligence platform for MLB props and game markets. It does not simply generate picks. It builds an auditable decision pipeline that separates baseball matchup quality from betting value. The system researches schedules, starters, lineups, pitcher-batter matchups, rolling Statcast trends, pitch arsenals, park/weather factors, market prices, fair probabilities, and risk flags. Each candidate receives a baseball grade and a market grade. A play only becomes actionable when the matchup is strong, the player is confirmed, the price is current, the fair probability beats the implied probability, and all verification gates clear. The result is not a list of guesses; it is a structured research product that tells users what is actionable, what is conditional, what is only a watchlist, and what should be avoided.

NORTH STAR:
Research wide.
Verify hard.
Bet narrow.
Grade everything.
Improve daily.

TASKS:

TASK 1 — INSPECT CURRENT SYSTEM:
Run/review:
- pwd
- git status --short
- git log -5 --oneline
- find echoiq_v3 -maxdepth 4 -type f | sort
- find black_sheep_mlb -maxdepth 4 -type f | sort
- find reports -maxdepth 3 -type f | sort
- find slates -maxdepth 3 -type f | sort
- find .agents -maxdepth 4 -type f | sort

Then read the required files listed above.

TASK 2 — CREATE PRODUCT STRATEGY REPORT FOLDER:
Create:

reports/2026-05-18_product_strategy/

Inside it, create the following files:

1. echoiq_product_thesis.md
2. echoiq_investor_pitch.md
3. echoiq_system_assessment_v2.md
4. echoiq_research_methodology.md
5. echoiq_prediction_and_pricing_framework.md
6. echoiq_trust_and_auditability.md
7. echoiq_workflow_roadmap.md
8. echoiq_modeling_roadmap.md
9. echoiq_productization_roadmap.md
10. echoiq_next_build_plan.md

TASK 3 — WRITE echoiq_product_thesis.md:
Include:
- What EchoIQ is.
- What EchoIQ is not.
- The product’s job.
- The core problem it solves.
- Why “good player / good matchup / good bet” must be separated.
- Why verification-first matters.
- Why price-awareness matters.
- Why the output should be labels/states, not simple picks.
- North Star principles.

TASK 4 — WRITE echoiq_investor_pitch.md:
Write this as if explaining to a potential investor.

Include:
- One-paragraph pitch.
- Deeper product explanation.
- User problem.
- Market/product opportunity.
- Why existing “AI pick” tools are insufficient.
- EchoIQ’s differentiation.
- Workflow moat.
- Data/verification moat.
- Trustworthiness moat.
- Product vision.
- Current stage and honest limitations.
- Near-term roadmap.
- Long-term vision.

Be persuasive but honest. Do not overclaim current betting accuracy.

TASK 5 — WRITE echoiq_system_assessment_v2.md:
This should synthesize and extend the prior May 18 system assessment.

Include:
- Current architecture.
- What black_sheep_mlb does.
- What echoiq_v3 does.
- What slates does.
- What reports does.
- What models/canvases/dashboard do.
- What is strong.
- What is weak.
- What is too manual.
- What is duplicated/confusing.
- What is missing.
- Product maturity grade.
- Research maturity grade.
- Prediction maturity grade.
- Betting-readiness grade.
- Investor-readiness grade.
- Technical-readiness grade.
- Honest current verdict.

TASK 6 — WRITE echoiq_research_methodology.md:
This should define how EchoIQ should research players, teams, games, and matchups.

Include:
- Game-level research.
- Team-level research.
- Pitcher-level research.
- Batter-level research.
- Pitch arsenal vs batter skill matching.
- Hot zone/location analysis.
- Rolling stats.
- Statcast quality-of-contact.
- BvP use and limitations.
- Park/weather/Ballpark Pal.
- Lineup/PA context.
- Bullpen context.
- Injury/scratch context.
- HR-specific research.
- Total-bases-specific research.
- Hits-specific research.
- Game-line research.
- What should be automated.
- What remains manual for now.
- How to avoid fake precision.

TASK 7 — WRITE echoiq_prediction_and_pricing_framework.md:
This should explain how predictions become actionable.

Include:
- Difference between BASEBALL_GRADE and BET_GRADE.
- How fair probability should be estimated.
- How implied probability is calculated.
- Why price matters.
- How a great baseball case can still be a pass.
- Playable price thresholds.
- Pass thresholds.
- Edge thresholds.
- How to handle Outlier fair price.
- How to handle missing book labels.
- How to handle stale prices.
- How to handle line movement.
- How to classify BET/LEAN/CONDITIONAL/WATCHLIST/LOTTERY/PASS/AVOID.
- Use the Schwarber TB example as a case study.

TASK 8 — WRITE echoiq_trust_and_auditability.md:
Include:
- Why trust comes from process, not AI confidence.
- Source hierarchy.
- Timestamp requirements.
- No-fabrication rules.
- Gate requirements.
- Unresolved gap logs.
- Source logs.
- Risk flags.
- What-kills-it notes.
- Postgame grading.
- CLV tracking.
- How to show users why a pick was or was not promoted.
- How to explain uncertainty.
- How to prevent hindsight bias.
- How to make investor/user trust stronger.

TASK 9 — WRITE echoiq_workflow_roadmap.md:
Create a practical operational roadmap.

Include:
- Ideal daily workflow: morning / midday / pregame / postgame.
- Current workflow.
- Gaps.
- Immediate fixes.
- This-week fixes.
- This-month fixes.
- Longer-term operational design.
- Standard source-capture packet.
- Automated lineup/starter recheck.
- Outlier capture workflow.
- Ballpark Pal capture workflow.
- Savant finalist workflow.
- Price ingestion workflow.
- Final-card workflow.
- Postgame learning workflow.

TASK 10 — WRITE echoiq_modeling_roadmap.md:
Design a smarter modeling roadmap.

Include:
- Baseball-first candidate discovery engine.
- HR model improvements.
- Total bases model improvements.
- Hits model improvements.
- Game-line model improvements.
- Pitch arsenal vs batter model.
- Zone/hotspot matching.
- Rolling Statcast features.
- Park/weather factors.
- Lineup/PA projection.
- Bullpen context.
- Fair probability estimation.
- Calibration.
- Backtesting.
- CLV measurement.
- Feature store/data storage.
- Model evaluation metrics.
- Human-in-the-loop validation.

TASK 11 — WRITE echoiq_productization_roadmap.md:
Design the product roadmap.

Include:
- What the eventual user sees.
- Slate dashboard.
- Candidate board.
- Gate status board.
- Source audit trail.
- Player matchup page.
- Game environment page.
- Price/edge page.
- Final card page.
- Postgame report page.
- Alerts for lineup/price changes.
- Investor/product demo path.
- MVP → beta → production stages.
- What must be true before charging users or calling it reliable.

TASK 12 — WRITE echoiq_next_build_plan.md:
Give a concrete next implementation plan.

Include:
- Top 10 immediate priorities.
- Exact files/modules likely involved.
- Proposed new files/templates/schemas.
- Proposed scripts or commands.
- Proposed data schemas for:
  - source_log
  - unresolved_gaps
  - player_prop_prices
  - Ballpark Pal capture
  - Outlier capture
  - lineup recheck
  - candidate scoring
  - final gate board
  - postgame CLV
- Which tasks should be done by Cursor/Opus.
- Which tasks should be done by Codex later.
- Which tasks require manual/browser capture.
- Which tasks should not be automated yet.
- Definition of done for the next build cycle.

TASK 13 — ADD EXECUTIVE SUMMARY:
At the top of each document, include a concise executive summary.

TASK 14 — BE SPECIFIC:
Avoid generic advice. Tie recommendations to this repo, these folders, these workflows, and the current May 18 findings.

TASK 15 — DO NOT OVERCLAIM:
Be honest that EchoIQ is currently better described as:
- a research/verification operating system
- a strong prototype
- not yet an autonomous betting engine
- not yet fully betting/product ready

TASK 16 — FINAL RESPONSE:
When finished, return:
1. Current git status.
2. Files created.
3. Short summary of the product thesis.
4. Top 10 current strengths.
5. Top 10 current weaknesses.
6. Top 10 product improvements.
7. Top 10 research/modeling improvements.
8. Top 10 workflow improvements.
9. Recommended next implementation step.
10. Whether anything should be committed now or reviewed first.

VALIDATION:
No code validation required unless you touch executable code, which you should not. If you only create markdown strategy docs, do not run tests unless you want to confirm repo cleanliness with git status.