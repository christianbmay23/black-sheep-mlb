# EchoIQ Manual Inputs

EchoIQ can run with no manual inputs and will keep missing odds, props, lineups,
weather, Ballpark Pal, and park factors explicit. To populate boards without
paid APIs, pass CSV files or one JSON bundle to the EchoIQ scripts.

CSV usage:

```bash
python3 scripts/analyze_mlb_slate.py \
  --date 2026-04-24 \
  --mode full \
  --output-dir reports/2026-04-24 \
  --manual-odds data/manual/example/odds.csv \
  --manual-props data/manual/example/props.csv \
  --manual-weather data/manual/example/weather.csv \
  --manual-ballpark data/manual/example/ballpark_pal.csv \
  --manual-lineups data/manual/example/lineups.csv
```

JSON usage:

```bash
python3 scripts/analyze_mlb_slate.py \
  --date 2026-04-24 \
  --mode full \
  --output-dir reports/2026-04-24 \
  --manual-inputs data/manual/example/echoiq_inputs.json
```

If JSON and CSV are both provided, JSON is primary for any data type it contains.
CSV is still used for data types absent from JSON. Missing optional files are
skipped. Present files with missing required columns raise a clear schema error.

## Validator

Validate manual files before running a slate:

```bash
python3 scripts/validate_echoiq_manual_inputs.py \
  --date 2026-04-24 \
  --manual-odds data/manual/example/odds.csv \
  --manual-props data/manual/example/props.csv \
  --manual-weather data/manual/example/weather.csv \
  --manual-ballpark data/manual/example/ballpark_pal.csv \
  --manual-lineups data/manual/example/lineups.csv
```

Validate a JSON bundle:

```bash
python3 scripts/validate_echoiq_manual_inputs.py \
  --date 2026-04-24 \
  --manual-inputs data/manual/example/echoiq_inputs.json
```

Default mode exits nonzero only for true errors. Warnings are printed but still
produce `VALID`. Use strict mode when you want warnings to fail the preflight:

```bash
python3 scripts/validate_echoiq_manual_inputs.py \
  --date 2026-04-24 \
  --manual-props data/manual/example/props.csv \
  --strict
```

Errors include missing required structural columns, missing game identifiers,
invalid `market_type`, invalid `prop_type`, invalid `lineup_status`, invalid
recommendation labels, invalid confidence values, non-numeric prices or factors,
and probabilities outside the accepted 0-1 or 0-100 range.

Warnings include unknown columns, missing `source`, missing `source_url`, missing
or non-ISO timestamps, timestamps more than two days away from `--date`, missing
odds prices, and probabilities entered as percentages such as `57`.

## Shared Fields

Every row should include:

```text
source,source_url,timestamp,confidence
```

Use `confidence` values such as `High`, `Medium`, or `Low`. Low confidence rows
can populate raw boards, but they will not be treated as strong final-card proof.

`source` and `timestamp` should be populated for auditability. The validator
warns when they are missing. `source_url` is optional but recommended; missing
URLs are warnings, not errors.

Each row must identify the game with either:

```text
game_id
```

or:

```text
away_team,home_team
```

Weather and Ballpark Pal rows can also match by `venue`.

## odds.csv

Required:

```text
date,market_type,source,timestamp,confidence
```

Expected:

```text
date,game_id,away_team,home_team,selection,market_type,sportsbook,consensus_price,best_price,opening_price,current_price,line,model_probability,source,source_url,timestamp,confidence
```

Supported `market_type` examples:

```text
moneyline,run_line,full_game_total,team_total,first_five_moneyline,first_five_total
```

`model_probability` is optional. If it is absent, the row can appear in the
source log but cannot create a value edge.

## props.csv

Required:

```text
date,player,team,prop_type,source,timestamp,confidence
```

Expected:

```text
date,game_id,away_team,home_team,player,team,opponent,prop_type,line,over_price,under_price,sportsbook,consensus_price,best_price,raw_probability,fair_price,source,source_url,timestamp,confidence
```

Supported `prop_type` examples:

```text
total_bases,hits,home_runs,rbi,runs,walks,strikeouts,pitcher_strikeouts,pitcher_outs,pitcher_earned_runs,pitcher_hits_allowed,pitcher_walks_allowed
```

`raw_probability` should come from your free/manual research. EchoIQ does not
invent it. If a prop has raw probability but no odds, it may populate a raw
board but will not be added to the final betting card.

Preferred probability format is decimal probability: `0.57`. If you enter
`57`, the validator warns that it appears to be a percent-style probability.
Values below 0 or above 100 are errors.

## weather.csv

Required:

```text
date,source,timestamp,confidence
```

Expected:

```text
date,venue,game_id,away_team,home_team,temperature,wind_speed,wind_direction,wind_effect,humidity,dew_point,precipitation_risk,roof_status,delay_risk,source,source_url,timestamp,confidence
```

EchoIQ uses weather fields only as transparent confidence/context adjustments.
Examples: wind blowing in reduces HR confidence, cold weather downgrades carry.

## ballpark_pal.csv

Required:

```text
date,source,timestamp,confidence
```

Expected:

```text
date,venue,game_id,away_team,home_team,run_factor,hr_factor,weather_factor,air_density,carry_grade,rh_hr_factor,lh_hr_factor,notes,source,source_url,timestamp,confidence
```

If Ballpark Pal data is unavailable, leave the file absent or fields blank.
EchoIQ will mark those factors unavailable rather than infer them.

## lineups.csv

Required:

```text
date,team,player,batting_order,lineup_status,source,timestamp,confidence
```

Expected:

```text
date,game_id,away_team,home_team,team,player,batting_order,position,handedness,lineup_status,source,source_url,timestamp,confidence
```

Supported `lineup_status` values:

```text
confirmed,projected,unavailable
```

Confirmed lineups improve role/volume confidence. Projected lineups remain
usable but lower confidence.

## Outputs

Manual inputs add:

```text
source_log.csv
unresolved_gaps.csv
```

The source log records data type, source, source URL, timestamp, confidence, row
count, and notes. The unresolved gaps file records missing data type, impact,
severity, and recommended fix per game.
