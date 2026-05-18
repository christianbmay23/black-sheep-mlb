# Baseball Savant Fetch Plan v1.0

Defines WHAT to pull, WHEN, WHY, and WHICH framework files consume the output.
No API code here — planning only.

---

## Fetch Schedule

| Timing | Label | Purpose |
|--------|-------|---------|
| T-24h (night before) | `PRE_SLATE` | Arsenal profiling for all SPs; builds pitcher_profiles.json |
| T-4h (morning of) | `GAME_DAY_DEEP` | Hitter hot zones, pitch-type splits, recent form |
| T-2h (pre-lineup) | `LINEUP_LOCK` | Final bullpen usage, recent SP pitch counts |

---

## Pitch Arsenal (Per SP) — PRE_SLATE

**URL pattern:** `https://baseballsavant.mlb.com/savant-search` → Pitcher arsenal stats, current season

| Field | Column Name | Why |
|-------|-------------|-----|
| Pitch mix % | `pitch_type_pct` | Confirms what the SP is actually throwing (not 2024 profile) |
| Avg velocity | `avg_speed` | Detects velocity decline from prior season profile |
| Horizontal break | `pfx_x` | Confirms slider/cutter shape |
| Vertical break | `pfx_z` | Confirms rise (4S IVB) or drop (splitter/curve) |
| Spin rate | `release_spin_rate` | Secondary movement indicator |
| Whiff % | `whiff_pct` | Per-pitch swing-and-miss rate; identifies dominant vs degraded pitches |
| CSW % | `csw_pct` | Called strikes + whiffs; overall pitch effectiveness |
| BA against | `ba` | Per-pitch outcome |
| xwOBA against | `xwoba` | Per-pitch expected damage allowed |

**Consumed by:** `pitcher_profiles.json` (adds `VERIFIED` fields to replace `HIGH_CONF_INFERENCE`)

**Upgrade impact:** Converts ~80% of LOW_CONF_INFERENCE pitch claims to VERIFIED or HIGH_CONF

---

## Hitter Hot Zones — GAME_DAY_DEEP

**URL pattern:** `https://baseballsavant.mlb.com/savant-search` → Batting → Heat Maps → vs LHP / vs RHP separately

| Field | Why |
|-------|-----|
| Zone xwOBA (9-zone grid) | Replaces archetype-only zone maps with actual data |
| Swing % by zone | Identifies true chase zones |
| Hard hit % by zone | Confirms pull-power zone vs soft contact zone |

**Pull for:** All Tier 1 (BASEBALL_GRADE A) targets before finalizing zone analysis  
**Format output as:** `{player}_{hand_faced}_zone_xwoba.json` stored under `slates/YYYY-MM-DD/`

**Upgrade impact:** Eliminates [UNSUPPORTED] zone heat maps; replaces with [VERIFIED]

---

## Hitter Pitch-Type Splits — GAME_DAY_DEEP

**URL pattern:** Savant → Batter page → Pitch Type → Current season → vs LHP/RHP

| Field | Why |
|-------|-----|
| xwOBA vs 4S | Does hitter genuinely damage fastballs or just average? |
| xwOBA vs slider | Identifies true vulnerability to breaking balls |
| xwOBA vs splitter | Key for Coors altitude structure (STRUCT_05) and CLE games |
| xwOBA vs changeup | Critical for same-side assessments |
| Whiff % by pitch type | Confirms which pitches generate chases vs contact |

**Consumed by:** `hitter_profiles.json` → upgrades swing-path claims from inference to data  
**Also feeds:** `matchup_matrix.json` → adds `pitch_type_xwoba` field per matchup entry

---

## Pitcher vL/vR Splits — PRE_SLATE

**URL pattern:** FanGraphs → Pitcher page → Splits → 2026 → vs LHB / vs RHB

| Field | Why |
|-------|-----|
| ERA vL / ERA vR | Confirms or denies platoon advantage magnitude |
| K% vL / K% vR | Identifies if pitcher neutralizes platoon via K rate |
| HR/9 vL / HR/9 vR | Directly feeds pitcher_factor in EV model |
| BABIP vL / vR | Separates luck from skill in platoon splits |

**Key rule:** Never assign platoon-edge advantage without checking current-season K% split.  
A pitcher with K% 35% vs LHB has no effective platoon disadvantage despite being RHP.

---

## Recent SP Form (L3 Starts) — GAME_DAY_DEEP

**URL pattern:** Savant → Pitcher → Game Log → Filter last 3 appearances

| Field | Why |
|-------|-----|
| Avg velo per game | Declining game-over-game = fatigue or injury concern |
| Whiff% per game | Is the pitcher's best pitch working lately? |
| Pitch count per game | Efficiency → predicts today's hook timing |
| HR allowed per game | Spike = vulnerability confirmed; zero = command-day streak |

**Consumed by:** Modifies `pitcher_factor` in EV calculation; lowers it if recent form is strong.

---

## Bullpen Usage — LINEUP_LOCK

**URL pattern:** FanGraphs → Team page → Bullpen → Current season ERA + usage + recent appearances

| Field | Why |
|-------|-----|
| Bullpen ERA (team) | Context for follow-through analysis |
| Key reliever recent usage | Identifies if top reliever is unavailable (pitched 2 straight) |
| Leverage index by reliever | Who will actually pitch in high-leverage spots? |

**Rule:** Flag any game where a top-tier bullpen arm (ERA <2.50, usage >60%) appears unavailable (pitched previous 2 days).  
This reduces the SP "if pulled early" risk for prop targets.

---

## Weather — GAME_DAY_DEEP + Final Check T-2h

**API target:** Weather.com or Weather Underground → hourly forecast for each outdoor park

| Field | Why |
|-------|-----|
| Wind speed (mph) | >10 mph is material; >15 mph significantly changes HR probability |
| Wind direction | Out = HR friendly; in = HR suppressive; cross = neutral |
| Temperature (°F) | <55°F reduces carry ~4-6 feet per 10° below 72°F |
| Humidity % | Secondary; high humidity at warm temps slightly increases carry |
| Precipitation risk | >30% rain chance → flag PPD risk |

**Output format:** `{park_code}_weather_{YYYYMMDD_HH}.json`  
**Consumed by:** `weather_factor` in EV model; `VOLATILITY` assignment in grade system

**Priority outdoor parks for this system:**
- COL (Coors) — highest impact; altitude × wind = extreme variance
- WSH (Nationals Park) — second-highest impact on HR props
- CWS (Rate Field) — wind channel sensitive
- PNC (Pittsburgh) — spring evenings cold
- ATH/SAC (Sutter Health) — cool late nights

---

## Data Dependency Map

```
PRE_SLATE pulls:
  savant_pitcher_arsenal → pitcher_profiles.json (VERIFIED fields)
  fangraphs_splits_vLvR  → pitcher_profiles.json (platoon splits)

GAME_DAY_DEEP pulls:
  savant_hitter_hot_zones        → hitter_profiles.json (zone data)
  savant_hitter_pitch_type_xwoba → matchup_matrix.json (interaction data)
  savant_sp_l3_form              → EV model pitcher_factor
  weather_api                    → ev_calculation (weather_factor)
                                 → grade_assignment (VOLATILITY level)

LINEUP_LOCK pulls:
  fangraphs_bullpen_usage → follow-through analysis
  mlb_confirmed_lineups   → VOLATILITY update (HIGH → MEDIUM or LOW)

All feeds into:
  price_ingestion_schema.json → (fair_prob, ev fields)
  postgame_log.csv            → (environment_confirmed field)
```

---

## What This Does NOT Yet Cover

- Live pitch-by-pitch tracking (in-game)
- Statcast bat speed (requires 2026 API availability confirmation)
- Spin rate trends mid-season (requires full Statcast query access)
- SEAM-based pitch prediction models (third-party; not yet integrated)

These are Phase 4 additions per `post_audit_framework.md` roadmap.
