# EchoIQ Night Shift

EchoIQ Night Shift is the overnight MLB intelligence agent for EchoIQ v3. It audits the previous day's games, records source gaps, grades prior EchoIQ artifacts when rows exist, and prepares a next-slate research packet for morning review.

Night Shift does not create official plays. It writes research artifacts only. Official plays require later lineup, starter, weather, odds, market, and gate verification.

## Run

```bash
python -m echoiq_v3.daily_agent.run_daily_agent --date today
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15
python -m echoiq_v3.daily_agent.run_daily_agent --postgame-date 2026-05-14 --slate-date 2026-05-15
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --only postgame
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --only preview
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --dry-run
python -m echoiq_v3.daily_agent.run_daily_agent --date 2026-05-15 --offline
python -m echoiq_v3.daily_agent.run_daily_agent --diagnose-markets --slate-date 2026-05-15
```

`--date` is the slate date being previewed. The postgame audit date defaults to one day earlier.

## Outputs

For slate date `YYYY-MM-DD`, Night Shift writes:

```text
slates/YYYY-MM-DD/
  01_postgame_audit/
  02_next_slate_research/
  03_watchlists/
  logs/
```

The live v3/v4 sources are MLB Stats API for schedules/statuses/boxscores/live-feed lineups and optional pybaseball/Baseball Savant Statcast for previous-day contact quality. SportsRadar injury/news and metadata are optional and require both a key and `ECHOIQ_ENABLE_SPORTSRADAR=1`. Game-market odds are optional through the existing repo Odds API adapter when `ODDS_API_KEY` or `THE_ODDS_API_KEY` is present. Manual/configured market rows can be supplied through `ECHOIQ_MARKET_CSV` or `data/manual/market_snapshot.csv`. Weather, fair probabilities, edge, and deeper pitch-type matchup modeling remain explicit gaps unless separately verified.

v4.1 pregame refresh improves source completion but still does not create official plays:

- confirmed MLB live-feed batting orders populate `04_pregame_refresh/lineup_verification.csv`
- confirmed absence from a posted lineup kills player-specific watchlist candidates
- configured/manual game markets and player props can populate `market_refresh.csv` and `player_prop_availability.csv`
- weather remains `WEATHER_SOURCE_UNAVAILABLE` unless a verified weather artifact exists
- missing source and ID-mapping gaps are written to `logs/unresolved_gaps.md`

v3 adds:

- `02_next_slate_research/market_snapshot.csv`
- `02_next_slate_research/injury_news.csv`
- market/news context in `matchup_notes.json`
- market context fields in each watchlist CSV

`official_bet_eligible` is always `false` in v3. Watchlists are research rows only.

## Statcast V2

When pybaseball/Baseball Savant returns previous-day rows, Night Shift enriches player and pitcher artifacts with:

- exit velocity averages/maxes
- launch angle averages
- hard-hit counts/rates
- barrel counts/rates when an explicit Statcast barrel classification is available
- sweet-spot counts/rates
- xBA, xSLG, and xwOBA when present
- whiff and called-strike-plus-whiff rates for pitchers
- transparent hitter and pitcher signal tags

If Statcast is unavailable or a field is missing, the CSV field stays blank and `logs/source_log.md` plus `logs/unresolved_gaps.md` record the limitation.

## Statcast Diagnostics

Use the diagnostic mode before trusting a new date range:

```bash
python3 -m echoiq_v3.daily_agent.run_daily_agent --diagnose-statcast --postgame-date 2026-05-14
python3 -m echoiq_v3.daily_agent.run_daily_agent --diagnose-statcast --postgame-date 2026-05-14 --force-refresh
```

The command reports the requested date, query window, timezone, pybaseball version, cache path, cache usage, row count, returned columns, unique game/batter/pitcher counts, safe sample rows, status classification, and the recommended next action. Empty results are classified as `STATCAST_EMPTY_FOR_DATE`, `STATCAST_DATE_OUT_OF_RANGE`, `STATCAST_CACHE_EMPTY_OR_STALE`, `STATCAST_QUERY_EXCEPTION`, `STATCAST_SCHEMA_MISSING_COLUMNS`, or a pybaseball install/import failure.

## MVP Labels

Generated watchlist rows may use only:

- `WATCHLIST`
- `LEAN`
- `CONDITIONAL`
- `PASS`
- `AVOID`
- `LOTTERY`

Night Shift MVP rejects generated `BET`, `LOCK`, `GUARANTEED`, `MAX`, and `FREE MONEY` labels.
