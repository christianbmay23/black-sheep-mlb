# EchoIQ Night Shift

EchoIQ Night Shift is an automated daily MLB intelligence agent for the EchoIQ v3 operating system. It turns yesterday's results into tomorrow's context by auditing completed games, grading prior EchoIQ rows when artifacts exist, extracting first-pass player/team/pitcher/bullpen/contact-quality signals, and preparing a next-day slate research packet.

It is designed for Christian's local Mac Mini workflow first, with a clean path to a dashboard runner, GitHub Actions, or a cloud worker later.

## Why It Exists

EchoIQ is verification-first:

- Research wide.
- Verify hard.
- Bet narrow.
- Grade cleanly.
- Preserve source logs and unresolved gaps.

Most prediction systems stop at a pick. Night Shift closes the loop: final scores, player boxscores, starter workload, bullpen usage, and prior prediction grading become structured inputs for the next morning's research.

## Fit In EchoIQ

Night Shift lives at `echoiq_v3/daily_agent/`. It does not alter model logic, prediction thresholds, final-card gates, or existing production prediction commands. It writes dated research artifacts under `slates/<YYYY-MM-DD>/` so GPT, Codex, Streamlit, and future pipelines can consume them.

## What It Produces

For slate date `YYYY-MM-DD`:

```text
slates/YYYY-MM-DD/
  00_inputs/
    echoiq_may15_final_predictions_for_codex.md
    final_echoiq_predictions.csv
    final_echoiq_predictions_parsing_gaps.md

  01_postgame_audit/
    YYYY-MM-DD-minus-1_postgame_audit.md
    game_results.csv
    player_performance.csv
    pitcher_usage.csv
    bullpen_fatigue.csv
    model_grading.json

  02_next_slate_research/
    YYYY-MM-DD_slate_preview.md
    verified_slate.csv
    probable_pitchers.csv
    weather.csv
    lineup_status.csv
    matchup_notes.json
    market_snapshot.csv
    injury_news.csv

  03_watchlists/
    hr_watchlist.csv
    total_bases_watchlist.csv
    hits_watchlist.csv
    game_line_leans.csv

  04_pregame_refresh/
    YYYY-MM-DD_pregame_refresh.md
    manual_input_preflight.csv
    verification_matrix.csv
    watchlist_survival.csv
    lineup_verification.csv
    starter_verification.csv
    market_refresh.csv
    player_prop_availability.csv
    weather_refresh.csv
    news_refresh.csv
    manual_input_validation.csv
    change_log.json

  logs/
    daily_agent_run.log
    source_log.md
    unresolved_gaps.md
```

## Manual Commands

Full run:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date today
```

Specific slate:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15
```

Explicit dates:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --postgame-date 2026-05-14 --slate-date 2026-05-15
```

Postgame only:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --only postgame
```

Preview only:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --only preview
```

Statcast diagnostic:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --diagnose-statcast --postgame-date 2026-05-14
python -m echoiq_v3.daily_agent.run_daily_agent --diagnose-statcast --postgame-date 2026-05-14 --force-refresh
```

Market/news diagnostic:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --diagnose-markets --slate-date 2026-05-15
python -m echoiq_v3.daily_agent.run_daily_agent --diagnose-sportsradar --slate-date 2026-05-15
```

Dry run:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --dry-run
```

Force refresh:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --force-refresh
```

Offline mode:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --offline
```

Pregame verification refresh:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --preflight-manual-inputs
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --pregame-refresh --as-of 16:30
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh --game-id 823384
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh --dry-run
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh --offline
```

Postgame learning:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode postgame-learning
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --postgame-learning
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode postgame-learning --dry-run
```

Verbose logging:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --verbose
```

## Date Logic

`--date` is the slate date being previewed. If `--date 2026-05-15` is used:

- Slate date: `2026-05-15`
- Postgame audit date: `2026-05-14`

`--date today` resolves in `America/Chicago` unless `ECHOIQ_TIMEZONE` is set.

## Environment Variables

All secrets stay in the environment. Do not commit `.env` files or print keys.

Supported variables:

- `MLB_STATS_API_BASE`, default `https://statsapi.mlb.com/api/v1`
- `ECHOIQ_DATA_DIR`, default `slates`
- `ECHOIQ_TIMEZONE`, default `America/Chicago`
- `SPORTSRADAR_API_KEY` or `SPORTSRADAR_MLB_API_KEY`, optional
- `ECHOIQ_ENABLE_SPORTSRADAR=1`, required before Night Shift calls SportsRadar endpoints
- `SPORTSRADAR_ACCESS_LEVEL`, default `trial`
- `SPORTSRADAR_MLB_API_BASE`, default `https://api.sportradar.com/mlb`
- `WEATHER_API_KEY`, detected only; v4.1 still requires a supported weather adapter or verified weather artifact before weather gates clear
- `ECHOIQ_WEATHER_CSV`, optional v4.2 operator weather/roof CSV override
- `ECHOIQ_MARKET_CSV`, optional v4.2 operator market CSV override; default `data/manual/market_snapshot.csv`
- `ECHOIQ_PLAYER_PROPS_CSV`, optional v4.2 operator player-prop CSV override
- `ECHOIQ_NEWS_CSV`, optional v4.2 operator news/scratch CSV override
- `ODDS_API_KEY` or `THE_ODDS_API_KEY`, optional game-market enrichment through the existing repo odds adapter

No key means graceful skip. SportsRadar also requires `ECHOIQ_ENABLE_SPORTSRADAR=1` so paid calls are operator-controlled. Missing, disabled, empty, and failing optional sources are written to `logs/source_log.md` and `logs/unresolved_gaps.md`.

## Data Sources

Live in v3:

- MLB Stats API schedule
- MLB Stats API boxscore
- Probable pitchers when present in MLB schedule payload
- Lineup availability when MLB schedule hydrate includes posted lineups
- Pregame confirmed batting orders from MLB Stats API live game feed when posted
- pybaseball/Baseball Savant Statcast window for previous-day pitch and batted-ball events, when available
- Optional SportsRadar MLB schedule metadata and injuries when a key is present and explicitly enabled
- Optional manual/configured game markets and player props from `ECHOIQ_MARKET_CSV` or `data/manual/market_snapshot.csv`
- Optional game markets from the existing The Odds API adapter when `ODDS_API_KEY` or `THE_ODDS_API_KEY` is present

Stubbed or explicit gaps in v3:

- Pitch-type batter matchup analysis beyond basic pitcher pitch-mix notes
- SportsRadar odds comparison/player props unless a verified odds-comparison endpoint and event-ID mapping are added
- Weather and roof context unless a verified weather artifact is supplied
- Fair probability, edge, and staking
- Batter-vs-pitcher history
- Back-to-back reliever tracking and verified leverage index

The agent still runs with missing optional sources and records each gap in `logs/unresolved_gaps.md`.

## Labels

Night Shift MVP watchlists may emit:

- `WATCHLIST`
- `LEAN`
- `CONDITIONAL`
- `PASS`
- `AVOID`
- `LOTTERY`

It does not emit official `BET` rows. Any official play must be created later by the final-card gatekeeper after lineup, starter, weather, odds, market, source-confidence, and kill-switch checks pass.

## Postgame Learning Engine V1

Postgame Learning is a grading and model-learning mode, not a betting-card generator. It compares the slate folder's pregame watchlists, pregame refresh state, matchup notes, and final boxscore artifacts, then writes a deterministic learning packet under:

```text
slates/YYYY-MM-DD/05_postgame_learning/
  prediction_grades.csv
  game_grades.csv
  hidden_winners.csv
  signal_performance.json
  postgame_learning_report.md
  next_slate_prompt_rules.md
```

Primary inputs, when present:

- `00_inputs/final_echoiq_predictions.csv`
- `00_inputs/echoiq_may15_final_predictions_for_codex.md`
- `03_watchlists/hr_watchlist.csv`
- `03_watchlists/total_bases_watchlist.csv`
- `03_watchlists/hits_watchlist.csv`
- `03_watchlists/game_line_leans.csv`
- `04_pregame_refresh/watchlist_survival.csv`
- `04_pregame_refresh/verification_matrix.csv`
- `02_next_slate_research/matchup_notes.json`
- `01_postgame_audit/game_results.csv`
- `01_postgame_audit/player_performance.csv`
- `01_postgame_audit/pitcher_usage.csv`
- `logs/source_log.md`
- `logs/unresolved_gaps.md`

`final_echoiq_predictions.csv` is an optional manual source for actual final chat/EchoIQ prediction boards. It is treated as learning input only, kept separate from repo-generated watchlists and pregame refresh survivors, and must not contain or promote official bet labels. Rows should use this schema:

```text
slate_date,prediction_id,prediction_source,prediction_phase,game,prediction_type,player_name,team,opponent,lineup_slot,opposing_pitcher,pick,confidence_tier,primary_reason,secondary_reason,risk_flag,signal_tags,notes
```

When present, final chat-board and lottery-discussion rows are included in `prediction_grades.csv`, `signal_performance.json`, and the `Final EchoIQ Chat Board Results` report subsection. Game-lean records are split by source/phase as `final_chat_board_game_lean_record`, `all_game_lean_rows_record`, `repo_watchlist_game_lean_record`, and `lottery_discussion_game_lean_record` so the final chat board is not blended into repo-generated rows. When absent, the engine keeps the prior watchlist-only behavior.

`RIGHT_TEAM_WRONG_PLAYER` is intentionally narrow: a player miss needs a validated same-team environment, a clearly identified teammate result, and team/stack/lineup context in the original rationale. Mixed or flawed game-lean weighting is labeled `MIXED_PROCESS_BAD_RESULT` instead of clean correct process.

The engine degrades cleanly. Missing or slate-date-mismatched final artifacts produce inconclusive rows and explicit warnings rather than fabricated scores or player stats. When local final boxscore artifacts are absent and the run is not offline or dry-run, the mode can use the existing MLB Stats API postgame path to load final scores and boxscores.

Player result rules are intentionally simple:

- HR succeeds when `actual_hr >= 1`.
- TB succeeds when `actual_tb >= 2`; a single is partial; zero total bases is a miss.
- Hits/contact succeeds when `actual_h >= 1`; two or more hits is a strong hit; walks-only is partial.
- Game leans succeed when the leaned team won.

Process labels are separate from result labels:

- `CORRECT_PROCESS_GOOD_RESULT`
- `CORRECT_PROCESS_BAD_RESULT`
- `BAD_PROCESS_GOOD_RESULT`
- `BAD_PROCESS_BAD_RESULT`
- `RIGHT_TEAM_WRONG_PLAYER`
- `RIGHT_PLAYER_WRONG_PROP_SUBTYPE`
- `HIDDEN_SUPPORTING_CAST_WINNER`
- `STALE_ASSUMPTION`
- `INCONCLUSIVE`

The report is built to answer baseball-learning questions: whether the reasoning showed up, which signals were predictive or over-weighted, whether HR and TB profiles were confused, whether star names crowded out supporting-cast bats, whether lineup slot mattered, and whether bullpen or game-environment theses appeared in the final box score.

Known limitations:

- Contact-quality process grading is limited unless final Statcast data is available.
- Some good-process/bad-result labels require future pitch-level and hard-contact enrichment.
- v1 is deterministic and rule-based, not a trained model.
- Treat the learning packet as infrastructure and review material, not final truth.

## Interpreting Outputs

Postgame audit artifacts answer: what happened yesterday, which rows could be graded, which misses/wins are known, and which bullpen/player signals should carry forward.

Next-slate research artifacts answer: what is scheduled today, which probable starters are known, which lineups/weather/odds are missing, and which preliminary research lanes deserve morning attention.

Watchlists are not picks. They are candidate research lanes with explicit data gaps.

## Market And News V3

Night Shift v3 adds market/news context without creating official bets:

- `market_snapshot.csv` stores normalized game-market rows with sportsbook, market, line, American price, implied probability when valid, source, last update, and retrieval timestamp.
- `injury_news.csv` stores SportsRadar injury/news rows when available. Unsupported fields stay blank and gaps remain explicit.
- Watchlist CSVs include `odds_available`, `best_price`, `best_price_source`, `implied_probability`, `market_last_updated`, `fair_probability`, `edge`, `playable_price_note`, `market_status`, `injury_news_status`, `lineup_verification_status`, `official_bet_eligible`, and `verification_gates_missing`.
- `official_bet_eligible` is always `false` in v3.
- `fair_probability` and `edge` stay blank because v3 does not invent fair probabilities.
- `matchup_notes.json` includes `market_context` and `news_context` objects per game.
- `next_slate_preview.md` includes Market Availability Snapshot, Injury / News Risk Report, Verification Gates, and Watchlist Market Context sections.

Common source classifications include `SPORTSRADAR_KEY_MISSING`, `SPORTSRADAR_DISABLED`, `SPORTSRADAR_AVAILABLE`, `SPORTSRADAR_QUERY_EXCEPTION`, `SPORTSRADAR_EMPTY_RESPONSE`, `SPORTSRADAR_RATE_LIMITED`, `ODDS_KEY_MISSING`, `ODDS_AVAILABLE`, `ODDS_EMPTY_FOR_SLATE`, `ODDS_QUERY_EXCEPTION`, `PLAYER_PROPS_EMPTY`, `NEWS_AVAILABLE`, `NEWS_EMPTY`, and `NEWS_QUERY_EXCEPTION`.

## Pregame Verification Refresh V4

Night Shift v4 adds a dedicated pregame refresh mode. Morning packet output remains research. Pregame refresh output is verification. Final-card creation stays out of scope.

The refresh reads morning artifacts when available:

- `02_next_slate_research/verified_slate.csv`
- `02_next_slate_research/probable_pitchers.csv`
- `02_next_slate_research/lineup_status.csv`
- `02_next_slate_research/market_snapshot.csv`
- `02_next_slate_research/injury_news.csv`
- `03_watchlists/*.csv`

It then refreshes public MLB schedule status, probable starters, posted-lineup availability, MLB live-feed batting orders, optional configured game markets/player props, optional configured SportsRadar injury/news rows, and writes a separate `04_pregame_refresh/` packet. Weather remains unavailable unless a verified weather artifact exists, and roof status is never inferred.

v4.1 source-completion behavior:

- `lineup_verification.csv` is populated from posted MLB live-feed batting orders when available. If lineups are not posted, the row stays `LINEUPS_NOT_POSTED` and player markets remain `CONDITIONAL` or `NEEDS_FINAL_CHECK`.
- Confirmed lineups update `PLAYER_IN_LINEUP`; confirmed absence kills player-specific watchlist rows that require a starting lineup.
- `market_refresh.csv` accepts configured/manual market rows without a paid API key, maps provider event teams to MLB game IDs, calculates implied probability from valid American odds, and marks missing or stale timestamps as stale.
- `player_prop_availability.csv` can populate HR, total bases, hits, RBI, and runs from configured/manual rows. Missing props do not kill baseball-signal watchlist rows by themselves.
- SportsRadar remains opt-in via key plus `ECHOIQ_ENABLE_SPORTSRADAR=1`; missing keys degrade with `SPORTSRADAR_KEY_MISSING`.

## Operator Inputs V4.3

Night Shift v4.2 added no-credit operator CSVs for verified information Christian has checked manually. v4.3 adds a local preflight command so those CSVs can be checked before the live pregame refresh. These files are optional. Missing files are logged as warnings and the refresh continues with gaps explicit.

Default files:

```text
data/manual/weather_roof.csv
data/manual/market_snapshot.csv
data/manual/player_props.csv
data/manual/news_scratch.csv
```

Template files:

```text
data/manual/templates/weather_roof_template.csv
data/manual/templates/market_snapshot_template.csv
data/manual/templates/player_props_template.csv
data/manual/templates/news_scratch_template.csv
```

Pregame refresh command:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --preflight-manual-inputs
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --summarize-pregame-refresh
```

Override paths when needed:

```bash
ECHOIQ_WEATHER_CSV=/path/to/weather_roof.csv \
ECHOIQ_MARKET_CSV=/path/to/market_snapshot.csv \
ECHOIQ_PLAYER_PROPS_CSV=/path/to/player_props.csv \
ECHOIQ_NEWS_CSV=/path/to/news_scratch.csv \
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --mode pregame-refresh
```

Run preflight after editing any manual CSV, before pregame refresh, and before future final-card review. Preflight does not call APIs, does not run the daily packet, does not run pregame refresh, and does not create bets. It only validates local operator inputs and writes:

```text
slates/YYYY-MM-DD/04_pregame_refresh/manual_input_preflight.csv
```

Preflight statuses:

- `PASS`: every present file has the required schema and no invalid rows.
- `PASS_WITH_WARNINGS`: optional files are missing, files are header-only, rows are valid but non-verifying, or row-level issues can be skipped/downgraded safely.
- `FAIL`: a present file is unreadable or missing required columns, making merge unsafe.

Preflight row checks include slate-date matches, required columns, boolean fields such as `weather_verified` and `available`, recognized market names where known, parseable American odds when prices are present, and recommended source fields such as `source_name` and `source_url`.

Required columns:

```text
weather_roof.csv:
slate_date,game_id,away_team,home_team,venue,roof_status,temperature,wind_speed,wind_direction,humidity,precipitation_risk,weather_verified,weather_risk,source_name,source_url,last_updated,notes

market_snapshot.csv:
slate_date,game_id,away_team,home_team,market_type,market,player_name,team,line,price,sportsbook,last_updated,source_name,source_url,notes

player_props.csv:
slate_date,game_id,player_name,player_id,team,opponent,market,line,price,sportsbook,available,last_updated,source_name,source_url,notes

news_scratch.csv:
slate_date,game_id,player_name,player_id,team,news_type,status,headline,summary,lineup_impact,prop_impact,source_name,source_url,published_at,notes
```

Manual propagation:

- Weather rows populate `weather_refresh.csv`, `weather_verified`, `roof_status_verified`, watchlist weather status, and pregame report weather notes.
- Market rows populate `market_refresh.csv`; valid American prices populate `implied_probability`. Invalid prices are kept unpriced and logged.
- Player-prop rows populate `player_prop_availability.csv`, `market_refresh.csv`, watchlist `odds_available`, `best_price`, `implied_probability`, and prop gates.
- News/scratch rows populate `news_refresh.csv`; confirmed `out` or `not_starting` rows kill matching player candidates, while `questionable` or downgrade rows keep them `CONDITIONAL`.

All manual rows are written with `source=manual_operator_input`. Validation output is written to `04_pregame_refresh/manual_input_validation.csv`. Header-only files are classified as `MANUAL_INPUT_HEADER_ONLY`; actual invalid data rows are summarized in `logs/unresolved_gaps.md` as `MANUAL_INPUT_INVALID_ROWS`.

This remains a verification refresh, not a final-card engine. `official_bet_eligible` remains `false`, and Night Shift does not create official `BET` labels.
- Mapping failures are logged as `EVENT_ID_MAPPING_MISSING`, `TEAM_ID_MAPPING_MISSING`, `PLAYER_ID_MAPPING_MISSING`, or `PLAYER_PROP_EVENT_MAPPING_MISSING`.

After every non-dry-run pregame refresh, the CLI prints a compact terminal summary from `verification_matrix.csv`, `watchlist_survival.csv`, refresh CSVs, and `logs/unresolved_gaps.md`. To inspect an existing refresh without rerunning sources, use:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --summarize-pregame-refresh
```

That helper reads only local artifacts and reports games checked, lineup/weather/market/prop/news counts, watchlist survival status counts, `official_bet_eligible=true` count, unresolved gap count, and the top five gap classifications.

`verification_matrix.csv` evaluates per-game gates:

- `GAME_NOT_STARTED`
- `STARTERS_CONFIRMED`
- `LINEUPS_CONFIRMED`
- `WEATHER_VERIFIED`
- `ROOF_STATUS_VERIFIED`
- `ODDS_VERIFIED`
- `PLAYER_PROPS_VERIFIED`
- `NEWS_CHECKED`
- `NO_MAJOR_SCRATCH_RISK`
- `OFFICIAL_BET_ELIGIBLE`

`OFFICIAL_BET_ELIGIBLE` is always `false` in v4.

`watchlist_survival.csv` classifies prior watchlist rows as:

- `ALIVE`
- `CONDITIONAL`
- `KILLED`
- `PASS`
- `NEEDS_FINAL_CHECK`

It never emits `BET`. Missing odds or props usually creates `CONDITIONAL` or `NEEDS_FINAL_CHECK`, not a kill, unless the exact market is known to be unavailable for final-card review.

Common v4 classifications include `PREGAME_REFRESH_STARTED`, `PREGAME_REFRESH_COMPLETE`, `MORNING_ARTIFACTS_MISSING`, `LINEUPS_CONFIRMED`, `LINEUPS_NOT_POSTED`, `STARTERS_CONFIRMED`, `STARTER_CHANGE_DETECTED`, `WEATHER_SOURCE_UNAVAILABLE`, `ODDS_VERIFIED`, `ODDS_KEY_MISSING`, `PLAYER_PROPS_AVAILABLE`, `PLAYER_PROPS_UNAVAILABLE`, `EVENT_ID_MAPPING_MISSING`, `TEAM_ID_MAPPING_MISSING`, `PLAYER_ID_MAPPING_MISSING`, `PLAYER_PROP_EVENT_MAPPING_MISSING`, `NEWS_REFRESH_AVAILABLE`, `NEWS_REFRESH_UNAVAILABLE`, `WATCHLIST_SURVIVAL_COMPLETE`, and `CHANGE_DETECTION_LIMITED`.

## Mac Mini launchd Scheduling

Use `ops/launchd/com.echoiq.nightshift.example.plist` as a template. Copy it outside the repo, replace placeholder paths, then load it with `launchctl`.

The example points at:

```bash
scripts/run_night_shift.sh
```

That script changes to the repo root, activates `.venv` if present, and runs:

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date today
```

It appends process output to:

```text
logs/nightshift.out.log
logs/nightshift.err.log
```

## Data Source Limitations

Night Shift v2 is intentionally conservative. It uses official MLB data where available, enriches previous-day contact quality from pybaseball/Baseball Savant when available, and leaves missing enrichment blank or explicitly logged. It does not infer injuries, odds, unavailable Statcast fields, detailed pitch-type matchups, or weather from unsupported sources.

Statcast diagnostics classify empty or failed enrichment as `PYBASEBALL_NOT_INSTALLED`, `PYBASEBALL_IMPORT_FAILED`, `STATCAST_QUERY_EXCEPTION`, `STATCAST_EMPTY_FOR_DATE`, `STATCAST_DATE_OUT_OF_RANGE`, `STATCAST_CACHE_EMPTY_OR_STALE`, or `STATCAST_SCHEMA_MISSING_COLUMNS`. Player-ID match diagnostics are written into the source log during postgame runs so an operator can distinguish source unavailability from MLBAM ID mapping misses.

## Statcast Contact Quality

Night Shift v2 adds transparent contact-quality tags:

- `LOUD_CONTACT_BAD_BOX`
- `LOUD_CONTACT_CONFIRMED_RESULT`
- `WEAK_CONTACT_GOOD_BOX`
- `HR_QUALITY_SIGNAL`
- `TB_QUALITY_SIGNAL`
- `CONTACT_QUALITY_SIGNAL`
- `VOLATILE_POWER_ONLY`
- `LOW_QUALITY_CONTACT`
- `INSUFFICIENT_STATCAST_DATA`

Pitcher tags include:

- `SUPPRESSED_CONTACT`
- `LOUD_CONTACT_ALLOWED`
- `BARREL_RISK`
- `HR_RISK_ALLOWED`
- `BETTER_THAN_LINE`
- `WORSE_THAN_LINE`
- `INSUFFICIENT_STATCAST_DATA`

The first-pass thresholds are simple by design: hard hit is exit velocity at least 95 mph, loud contact is at least 100 mph, sweet spot is launch angle from 8 to 32 degrees, and HR-quality contact requires an explicit barrel classification or 100+ mph contact in an HR-style launch-angle band. Missing barrel/xBA/xSLG fields are logged rather than inferred.

## Roadmap

v2:

- Parse and grade prior EchoIQ final cards more deeply.
- Add Statcast quality-of-contact enrichment.
- Add pitcher pitch-mix and batter pitch-type matchup analysis.
- Add stronger bullpen leverage/fatigue model.

v3:

- Add optional SportsRadar injuries/news and metadata.
- Add optional existing repo odds adapter game-market context and implied probability.
- Preserve fair probability, edge, and official plays for later verification modules.
- Still require lineup/weather/starter/news/odds/player-prop verification before official labels.

v4:

- Add Streamlit dashboard tabs for Morning Brief, Postgame Audit, HR Watchlist, TB Watchlist, Hits Watchlist, Game Lines, Bullpen Fatigue, Source Log, and Unresolved Gaps.

v5:

- Add scheduler profiles for 12:15 AM preliminary postgame, 2:30 AM final postgame, 8:00 AM morning slate, 3:00 PM pregame refresh, and rolling 30-minute pregame locks.

v6:

- Add a model feedback loop into training and backtesting datasets.
