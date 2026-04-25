# Full Agentic Repo Review Prompt — 2026-04-23

Repo: `black-sheep-mlb`
Primary branch today: `main`
Current `main` revision: `90fda9b`
Review scope: full repository, full branch set, full project-purpose assessment, and concrete improvement roadmap

## What this prompt is for

Use this prompt when handing the repository to another coding agent and you want a real end-to-end assessment, not a shallow code skim.

This prompt is designed to force the reviewing agent to:

- understand what the system is trying to become
- inspect the implemented architecture, not just the README
- review all tracked files, not just a curated subset
- review all local and remote branches visible in git
- compare branch intent and branch deltas
- identify the highest-leverage fixes
- explain how the system can better achieve its actual goals

## Paste-Ready Prompt

```text
You are performing a full agentic review of the repository `black-sheep-mlb`.

This is not a lightweight code review. Your job is to understand the entire project, determine what it is trying to achieve, assess whether the current codebase is aligned with those goals, review all files and all visible branches, and produce a concrete roadmap for how the system should improve to better achieve its purpose.

You must treat this as a serious engineering and product review of a live MLB pregame modeling and reporting system. Do not optimize for politeness. Optimize for accuracy, completeness, and decision usefulness.

## Core review objective

Determine:

1. What this repository actually is today
2. What it is trying to become
3. Which goals are explicit vs implied
4. Whether the current architecture, modeling choices, evaluation logic, and repo structure support those goals
5. Where the biggest risks, gaps, contradictions, and wasted effort are
6. What should be improved next if the goal is a trustworthy MLB pregame decision engine

## Non-negotiable review requirements

You must:

- review the full repository, not only the main model files
- review all tracked files currently present in the working tree
- review all visible branches in git, local and remote-tracking
- inspect branch history and compare branch intent
- identify which branches are historical, which are merged, which are partial, and which contain ideas not fully reflected in `main`
- understand the project both as code and as an operating workflow
- separate operational maturity from predictive validity
- distinguish implemented behavior from aspirational documentation
- identify where the system is honest and where it still risks overstating confidence

You must not:

- stop after reviewing only the README and a few core files
- give a generic summary with no hard conclusions
- focus on UI polish ahead of modeling, integrity, evaluation, and reproducibility
- recommend random feature additions without tying them to the project’s actual goals
- assume that a branch name or document means the code truly reflects that state; verify in code

## Known repository purpose and context

This repo is an MLB pregame modeling and reporting system. It appears to be evolving from a dated-canvas workflow into a more general pregame decision pipeline that:

- ingests schedule, probable starters, lineups, weather, odds, and player prop markets
- scores game sides with a win-probability model
- scores batter HR and 2+ TB props with a separate prop model
- writes CSV, HTML, and JSON snapshot artifacts
- backtests prior slates
- tries to enforce stricter live-data integrity and evaluation honesty over time

The likely end goal is not “interesting baseball research.” The likely end goal is a trustworthy, auditable MLB pregame decision engine that can support real betting or serious analyst workflow without fabricating certainty.

Your review must test whether that reading is correct and refine it with evidence.

## Branches that must be reviewed

At minimum, review these visible branches and refs:

- `main` at `90fda9b`
- `local-backup-before-pull` at `9eeb494`
- `phase-3-slate-generalization` at `2efd025`
- `origin/hr-integrity-fix` at `687cdf5`
- `origin/main` at `90fda9b`
- `origin/mlb-intel-apr16` at `4e85ab6`
- `origin/phase-3-slate-generalization` at `2efd025`
- `origin/side-model-tightening` at `90fda9b`

For branches that point to the same commit, say so clearly. For branches that are historical or effectively superseded, say so clearly. For branches that contain meaningful design history, explain what they contributed and whether their ideas are now fully integrated.

## Files and directories that must be understood

You must inspect the full tracked tree, but pay special attention to these areas:

- `README.md`
- `WORKFLOW.txt`
- `REVIEW_PACKET_2026-04-19.md`
- `EXTERNAL_AGENT_HANDOFF_2026-04-19.md`
- `IMPLEMENTATION_PLAN_2026-04-19.md`
- `models/`
- `canvases/`
- `canvases/exports/`
- `canvases/exports/pipeline/`
- `tests/`
- generated reports, trackers, CSV outputs, snapshots, and boxscore artifacts

Do not ignore generated artifacts just because they are outputs. They help reveal what the system actually claims, measures, and preserves.

## Required review workflow

Follow this process explicitly:

### Phase 1: Repo inventory

1. List the full file tree or full tracked file list.
2. Group the repo into functional areas.
3. Explain what each area is responsible for.
4. Identify what appears to be hand-maintained versus computed versus generated.

### Phase 2: Project-purpose reconstruction

From docs, code, artifacts, tests, and branch history, determine:

1. What the project says it is
2. What it actually does
3. What success seems to mean for the owner
4. What constraints or values are central

You must explicitly answer:

- Is this mainly a research repo, a reporting repo, a betting engine, a daily operations tool, or a transitional hybrid?
- What does “good” look like for this system?
- What outcomes is the owner probably trying to avoid?

### Phase 3: Architecture review

Review the architecture end to end:

- data ingestion
- provider verification
- feature building
- game model logic
- prop model logic
- market alignment
- recommendation gating
- canvas/update flow
- export generation
- snapshot generation
- backtesting
- reporting
- tests

For each layer, state:

- what it does
- whether the separation of concerns is good enough
- where coupling is too high
- where integrity is strong
- where hidden fragility remains

### Phase 4: Branch review

For every visible branch:

1. Summarize its apparent purpose.
2. Explain whether it is historical, active, merged, superseded, or only partially reflected in `main`.
3. Identify the meaningful commits or themes in that branch.
4. Compare it against `main`.
5. Call out any valuable ideas, improvements, or risks that may have been lost, only partially integrated, or overtaken.

Do not just list branches. Assess them.

### Phase 5: Full code and artifact review

Review all files, including:

- core Python model files
- pipeline modules
- canvas files
- backtest scripts
- export scripts
- tests
- markdown plans and handoff docs
- snapshots, generated summaries, and trackers where useful

You do not need to quote every file, but you must assess whether the repo as a whole is coherent and whether any area is unreviewed enough that your conclusions would be weak.

### Phase 6: Goal-alignment analysis

Assess whether the current implementation is actually aligned with the project’s likely goals:

- trustworthy pregame decision support
- auditable runs
- honest evaluation
- real-world usability
- calibration discipline
- non-fabricated outputs
- operational reproducibility

Be explicit about mismatches, for example:

- the repo says one thing but the artifacts prove another
- the architecture supports operations but not credibility
- the model structure claims confidence the backtests do not justify
- the branch history shows improvement energy but not enough proof

### Phase 7: Improvement roadmap

Produce a prioritized roadmap that answers:

- What should be fixed immediately?
- What should be validated before additional feature work?
- What should be paused or de-emphasized?
- What should be simplified?
- What should be hardened operationally?
- What should be recalibrated or split further on the modeling side?
- What evidence would be required before the owner should trust this system more strongly?

Roadmap items must be concrete and tied to code seams or workflow seams.

## Review dimensions you must cover

Your findings must cover at least these dimensions:

1. Project identity and product direction
2. Repo structure and maintainability
3. Data integrity and provider handling
4. Decision-time correctness and leakage risk
5. Game model validity
6. Prop model validity
7. HR versus 2+ TB separation quality
8. Recommendation and market-gating honesty
9. Backtest quality and evaluation methodology
10. Snapshot and artifact auditability
11. Branch hygiene and branch evolution
12. Testing quality and coverage gaps
13. Operational robustness
14. Highest-leverage path to better achieve the repo’s goals

## Special questions you must answer

You must answer all of these directly:

1. What is this system trying to build toward?
2. What parts of that target already exist in real code?
3. What parts are still mostly scaffolding, manual process, or aspiration?
4. Is `main` the right architectural direction?
5. Which branch most clearly represents the repo’s long-term direction?
6. Which branch is mostly historical baggage?
7. Where is the system strongest today?
8. Where is it weakest today?
9. What is the single biggest threat to trust in this system?
10. What is the single biggest opportunity to improve it quickly without a broad rewrite?
11. If the owner wants a real production-grade MLB pregame engine, what should they do next?

## Required output format

Return your answer in this exact structure:

### 1. Executive verdict

- What this repo is
- What it is trying to become
- Whether the current codebase is directionally sound
- Whether it is operationally credible
- Whether it is predictively credible

### 2. Project-purpose reconstruction

- Explicit goals
- Implied goals
- Non-goals
- Success criteria you infer from the repo

### 3. Repo and architecture map

- Functional areas of the repo
- How the system flows end to end
- Which parts are computed, generated, manual, or transitional

### 4. Branch assessment

For each branch/ref reviewed:

- purpose
- status
- relation to `main`
- notable contributions or concerns

### 5. Findings

Ordered by severity.

Each finding must include:

- title
- severity
- why it matters
- evidence with file references and branch context where relevant
- recommended fix

### 6. Goal-alignment assessment

- Where the repo is aligned with its goals
- Where it is misaligned
- What is being over-optimized
- What is being under-protected

### 7. Improvement roadmap

- immediate next actions
- short-term roadmap
- medium-term roadmap
- what to stop doing
- what to validate before claiming improvement

### 8. Open questions

Only include questions that materially affect confidence or prioritization.

### 9. Appendix: review coverage

Include:

- branches reviewed
- major directories reviewed
- any files or areas you could not assess well enough

## Review quality bar

This review is only acceptable if:

- it is obvious you inspected the real repo rather than inferring from one or two docs
- it is obvious you looked at all visible branches
- it distinguishes purpose, implementation, evidence, and aspiration
- it gives the owner a sharper understanding of what this project really is and what it should do next

If evidence is thin, say so plainly. If the system is promising but unproven, say so plainly. If the project is directionally right but still vulnerable to self-deception, say so plainly.
```

## Notes for the human handing this off

This prompt is intentionally broader and stricter than the older `EXTERNAL_AGENT_HANDOFF_2026-04-19.md`.

Use this one when you want:

- full branch review, not just current-branch audit
- full repo understanding, not only model validation
- project-purpose reconstruction, not just bug-finding
- explicit roadmap tied to the repo’s real goals

The older handoff is still useful for narrower quant or pipeline review. This prompt is better when you want one agent to understand the whole system and tell you what it actually is, where it stands, and what to do next.
