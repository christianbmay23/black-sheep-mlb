# EchoIQ HR Intelligence v1

EchoIQ HR Intelligence v1 is a fixture-first foundation for a transparent MLB home-run and batter-prop board. It does not call live MLB, Statcast, weather, lineup, or odds APIs yet. Fixture rows are clearly marked `fixture_only` and should not be treated as real picks, verified odds, or production model output.

## Why It Exists

The attached Claude and GPT market-map PDFs were used as strategy context only. The consistent product gap is a single workflow that combines Statcast-style contact quality, pitcher and pitch-mix matchup, park/weather context, lineup and starter verification, market edge, kill flags, and an auditable output trail. This module creates that repo-ready shape without pretending the live data layer is complete.

## What It Produces

The fixture CLI writes:

- `outputs/hr_boards/YYYY-MM-DD_hr_full_board.csv`
- `outputs/hr_boards/YYYY-MM-DD_hr_final_card.csv`
- `outputs/hr_boards/YYYY-MM-DD_hr_lottery_card.csv`
- `outputs/hr_boards/YYYY-MM-DD_hr_watchlist.csv`
- `outputs/hr_boards/YYYY-MM-DD_hr_audit_log.json`

Every board row includes source status, missing fields, kill flags, action label, and a short reason.

## Run Fixture Mode

```bash
python3 -m black_sheep_mlb.hr_intelligence.run_daily_hr_pipeline --date 2026-04-24 --fixture
```

Optional paths:

```bash
python3 -m black_sheep_mlb.hr_intelligence.run_daily_hr_pipeline \
  --date 2026-04-24 \
  --fixture \
  --fixture-file data/fixtures/echoiq_hr_intelligence/2026-04-24_hr_fixture.json \
  --output-dir outputs/hr_boards
```

## HR Threat Score v1

Weights:

- Batter Power: `0.22`
- Recent Contact Quality: `0.18`
- Pitcher HR Vulnerability: `0.16`
- Pitch-Type Matchup: `0.14`
- Park/Weather Boost: `0.10`
- Lineup/PA Expectation: `0.08`
- Market Value: `0.07`
- Risk Adjustment: `0.05`

Tier thresholds:

- `90-100`: Elite HR Target
- `80-89`: Strong HR Target
- `70-79`: Viable HR Lean
- `60-69`: Lottery Only
- `50-59`: Watchlist
- `<50`: Pass

The score-to-fair-probability mapping is conservative and tuneable: 50 maps to about 2.0%, 60 to 3.5%, 70 to 5.5%, 80 to 8.0%, 90 to 11.5%, and 100 to 15.0%. `edge_pct` is relative model edge versus market implied probability; `0.15` means the fair probability is 15% higher than the market implied probability.

## Action Labels

- `BET`: strong score, confirmed lineup/starter, no major kill flags, and `edge_pct >= 0.15`, meaning the model fair probability is at least 15% higher than market implied probability.
- `LEAN`: viable score with playable edge and confirmed core verification.
- `LOTTERY`: long-odds profile with enough power/matchup support but not enough confidence for the main card.
- `WATCHLIST`: interesting profile blocked by fragile context or verification.
- `PASS`: failed verification, no odds, negative edge, not in lineup, or missing critical data.

## Kill Flags

The v1 verifier can emit:

- `NOT_IN_LINEUP`
- `LINEUP_UNCONFIRMED`
- `LOW_PA_EXPECTATION`
- `WIND_IN`
- `ELITE_GB_PITCHER`
- `INJURY_RISK`
- `NO_HR_ODDS`
- `NEGATIVE_EDGE`
- `BAD_PRICE`
- `MISSING_CRITICAL_DATA`
- `STARTER_UNCONFIRMED`

## Later Live Data Integration

The clean integration point is `black_sheep_mlb.hr_intelligence.schema.HitterInput`. A future adapter should populate one row per hitter versus the opposing starter from verified MLB schedule/starter/lineup data, Statcast batter contact quality, pitcher allowed-contact metrics, pitch-type matchup, park/weather boost, PA expectation, and current HR odds. Missing inputs should remain blank or explicitly unverified; they should not be silently imputed into verified fields.

## Known Limitations

- Fixture data is synthetic and not a real MLB slate.
- Weights and normalization ranges are transparent heuristics, not calibrated.
- Market edge uses one HR price per row; no line shopping or no-vig consensus exists yet.
- No CLV, ROI, postgame grading, or historical calibration ledger is wired yet.
- Existing prediction, canvas, and EchoIQ slate-report behavior are unchanged.
