"""Batter HR / 2+ TB model (ported from Apr 15 canvas + optional platoon bump)."""
from __future__ import annotations

import math
import re
import unicodedata
from typing import Literal

from models.game_model import clamp, parse_xera, prob_to_american

ModelConf = Literal["Low", "Medium", "High"]
Tier = Literal["A+", "A", "B", "C", "D"]
Profile = list[list[str]]
BVP_HR_MIN_PA = 24
BVP_TB_MIN_PA = 20
RICH_FEATURE_HIGH_PRESENT_MIN = 12
RICH_FEATURE_MEDIUM_PRESENT_MIN = 8


def strip_accents(text: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch))


def lineup_match_key(name: str) -> str:
    stripped = strip_accents(name)
    parts = [
        p
        for p in stripped.split()
        if not re.match(r"^jr\.?$", p, re.I)
        and not re.match(r"^sr\.?$", p, re.I)
        and not re.match(r"^(i|ii|iii|iv|v)$", p, re.I)
    ]
    if len(parts) >= 2:
        first = re.sub(r"[^A-Za-z]", "", parts[0])[:1].lower()
        last = re.sub(r"\.", "", parts[-1]).lower()
        return f"{first}-{last}"
    last = re.sub(r"\.", "", parts[0] if parts else stripped).strip().lower()
    return last


def find_lineup_row(lineup: list[list[str]], name: str) -> list[str] | None:
    want = lineup_match_key(name)
    for row in lineup:
        if len(row) < 2:
            continue
        cell = row[1]
        if cell == name or lineup_match_key(cell) == want:
            return row
    return None


def parse_xslg(line: list[str] | None) -> float | None:
    if not line or len(line) <= 4:
        return None
    raw = line[4] or ""
    try:
        x = float(re.sub(r"[^\d.]", "", raw))
    except ValueError:
        return None
    return x if not math.isnan(x) else None


def parse_brl(line: list[str] | None) -> float | None:
    if not line or len(line) <= 6:
        return None
    brl = line[6] or ""
    if not brl or brl == "—" or not re.fullmatch(r"\d+", brl):
        return None
    return int(brl, 10) / 100


def park_factor(away: str, home: str) -> float:
    if away == "COL" or home == "COL":
        return 1.12
    if away == "NYY" or home == "NYY":
        return 1.04
    if away == "CIN" or home == "CIN":
        return 1.06
    return 1.0


def intrinsic_tier_hr(hr: float) -> Tier:
    if hr >= 0.132:
        return "A+"
    if hr >= 0.102:
        return "A"
    if hr >= 0.078:
        return "B"
    if hr >= 0.058:
        return "C"
    return "D"


def intrinsic_tier_2tb(p: float) -> Tier:
    if p >= 0.42:
        return "A+"
    if p >= 0.35:
        return "A"
    if p >= 0.28:
        return "B"
    if p >= 0.22:
        return "C"
    return "D"


def platoon_hr_bump(batter_hand: str | None, pitcher_hand: str | None) -> float:
    """Small heuristic: opposite-hand batter vs pitcher adds a touch of HR prior."""
    if not batter_hand or not pitcher_hand:
        return 0.0
    b = batter_hand.upper()[:1]
    p = pitcher_hand.upper()[:1]
    if b not in {"L", "R", "S"} or p not in {"L", "R"}:
        return 0.0
    if b == "S":
        b = "L" if p == "R" else "R"
    if b != p:
        return 0.0025
    return -0.001


def stronger_tier(left: Tier, right: Tier) -> Tier:
    rank = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}
    return left if rank[left] >= rank[right] else right


def batter_hr_two_tb(
    away: str,
    home: str,
    team_is_away: bool,
    batter: str,
    lineup: list[list[str]],
    opp_sp_profile: Profile,
    *,
    batter_hand: str | None = None,
    pitcher_hand: str | None = None,
    xslg_override: float | None = None,
    barrel_rate: float | None = None,
    actual_slg: float | None = None,
    hard_hit_rate: float | None = None,
    avg_hit_speed: float | None = None,
    est_ba: float | None = None,
    plate_appearances: int | None = None,
    home_runs: int | None = None,
    opp_xera_override: float | None = None,
    opp_est_slg: float | None = None,
    opp_barrel_rate: float | None = None,
    opp_hard_hit_rate: float | None = None,
    recent_slg: float | None = None,
    recent_ops: float | None = None,
    recent_hr_rate: float | None = None,
    recent_tb_rate: float | None = None,
    weather_factor: float | None = None,
    opp_bullpen_score: float | None = None,
    starter_recent_form_score: float | None = None,
    vs_pitcher_pa: int | None = None,
    vs_pitcher_ab: int | None = None,
    vs_pitcher_hits: int | None = None,
    vs_pitcher_hr: int | None = None,
    vs_pitcher_total_bases: int | None = None,
    include_bvp: bool = True,
) -> tuple[float, float, str, str, Tier, Tier, ModelConf]:
    row = find_lineup_row(lineup, batter)
    brl = parse_brl(row)
    xslg = parse_xslg(row)
    pk = park_factor(away, home)
    opp_xera = opp_xera_override if opp_xera_override is not None else parse_xera(opp_sp_profile)

    use_real_features = any(
        value is not None
        for value in (
            xslg_override,
            barrel_rate,
            actual_slg,
            hard_hit_rate,
            avg_hit_speed,
            est_ba,
            plate_appearances,
            home_runs,
            opp_xera_override,
            opp_est_slg,
            opp_barrel_rate,
            opp_hard_hit_rate,
            recent_slg,
            recent_ops,
            recent_hr_rate,
            recent_tb_rate,
            weather_factor,
            opp_bullpen_score,
            starter_recent_form_score,
        )
    )

    if not use_real_features:
        feature_slots_total = 3
        miss = 0
        if brl is None:
            miss += 1
        if xslg is None:
            miss += 1
        if opp_xera is None:
            miss += 1

        base_hr = 0.028 + platoon_hr_bump(batter_hand, pitcher_hand)
        brl_adj = (brl - 0.52) * 0.09 if brl is not None else -0.006
        xslg_adj = clamp((xslg - 0.4) * 0.1, -0.02, 0.09) if xslg is not None else -0.004
        pit_adj = clamp((opp_xera - 4.15) * 0.009, -0.018, 0.028) if opp_xera is not None else 0.0
        hr = clamp(base_hr + brl_adj + xslg_adj + pit_adj + (pk - 1) * 0.022, 0.006, 0.24)

        base2 = 0.2
        tb2 = clamp(
            base2
            + ((brl - 0.5) * 0.16 if brl is not None else 0)
            + ((xslg - 0.38) * 0.18 if xslg is not None else 0)
            + pit_adj * 0.6,
            0.07,
            0.52,
        )
    else:
        hitter_xslg = xslg_override if xslg_override is not None else xslg
        hitter_barrel = barrel_rate
        hitter_hr_rate = None
        if plate_appearances and plate_appearances > 0 and home_runs is not None:
            hitter_hr_rate = home_runs / plate_appearances

        feature_slots = (
            hitter_xslg,
            hitter_barrel,
            actual_slg,
            hard_hit_rate,
            avg_hit_speed,
            est_ba,
            opp_xera,
            opp_est_slg,
            opp_barrel_rate,
            opp_hard_hit_rate,
            recent_slg,
            recent_ops,
            recent_hr_rate,
            recent_tb_rate,
            weather_factor,
            opp_bullpen_score,
            starter_recent_form_score,
        )
        feature_slots_total = len(feature_slots)
        miss = sum(value is None for value in feature_slots)

        platoon = platoon_hr_bump(batter_hand, pitcher_hand)
        hr = 0.022 + platoon
        if hitter_barrel is not None:
            hr += (hitter_barrel - 0.08) * 0.15
        if hitter_xslg is not None:
            hr += (hitter_xslg - 0.4) * 0.1
        if actual_slg is not None:
            hr += (actual_slg - 0.4) * 0.035
        if hard_hit_rate is not None:
            hr += (hard_hit_rate - 0.38) * 0.05
        if avg_hit_speed is not None:
            hr += (avg_hit_speed - 88.5) * 0.002
        if hitter_hr_rate is not None:
            hr += (hitter_hr_rate - 0.03) * 0.35
        if recent_hr_rate is not None:
            hr += clamp((recent_hr_rate - 0.03) * 0.18, -0.02, 0.03)
        if recent_slg is not None:
            hr += clamp((recent_slg - 0.4) * 0.06, -0.015, 0.025)
        if opp_xera is not None:
            hr += clamp((opp_xera - 4.1) * 0.008, -0.02, 0.03)
        if opp_est_slg is not None:
            hr += clamp((opp_est_slg - 0.4) * 0.07, -0.015, 0.02)
        if opp_barrel_rate is not None:
            hr += (opp_barrel_rate - 0.08) * 0.08
        if opp_hard_hit_rate is not None:
            hr += (opp_hard_hit_rate - 0.38) * 0.04
        if weather_factor is not None:
            hr += clamp((weather_factor - 1.0) * 0.06, -0.015, 0.02)
        if opp_bullpen_score is not None:
            hr += clamp((0.5 - opp_bullpen_score) * 0.03, -0.015, 0.015)
        if starter_recent_form_score is not None:
            hr += clamp((0.5 - starter_recent_form_score) * 0.03, -0.015, 0.015)
        # Keep BvP as a small seasoning, not a driver, unless the sample is more credible.
        if include_bvp and vs_pitcher_pa is not None and vs_pitcher_pa >= BVP_HR_MIN_PA:
            sample_weight = min(vs_pitcher_pa / 60.0, 1.0)
            if vs_pitcher_hr is not None:
                hr += clamp(((vs_pitcher_hr / vs_pitcher_pa) - 0.03) * 0.06 * sample_weight, -0.006, 0.008)
            if (
                vs_pitcher_ab is not None
                and vs_pitcher_ab > 0
                and vs_pitcher_hits is not None
                and vs_pitcher_total_bases is not None
            ):
                pvb_avg = vs_pitcher_hits / vs_pitcher_ab
                pvb_slg = vs_pitcher_total_bases / vs_pitcher_ab
                hr += clamp((pvb_slg - 0.4) * 0.02 * sample_weight, -0.004, 0.006)
        hr = clamp(hr + (pk - 1) * 0.024, 0.004, 0.25)

        tb2 = 0.16 + platoon * 1.5
        if hitter_xslg is not None:
            tb2 += (hitter_xslg - 0.4) * 0.4
        if actual_slg is not None:
            tb2 += (actual_slg - 0.4) * 0.18
        if hitter_barrel is not None:
            tb2 += (hitter_barrel - 0.08) * 0.2
        if hard_hit_rate is not None:
            tb2 += (hard_hit_rate - 0.38) * 0.18
        if avg_hit_speed is not None:
            tb2 += (avg_hit_speed - 88.5) * 0.004
        if est_ba is not None:
            tb2 += (est_ba - 0.245) * 0.16
        if hitter_hr_rate is not None:
            tb2 += (hitter_hr_rate - 0.03) * 0.1
        if recent_slg is not None:
            tb2 += clamp((recent_slg - 0.4) * 0.16, -0.03, 0.05)
        if recent_ops is not None:
            tb2 += clamp((recent_ops - 0.72) * 0.10, -0.025, 0.04)
        if recent_tb_rate is not None:
            tb2 += clamp((recent_tb_rate - 0.17) * 0.25, -0.025, 0.045)
        if opp_xera is not None:
            tb2 += clamp((opp_xera - 4.1) * 0.012, -0.03, 0.04)
        if opp_est_slg is not None:
            tb2 += clamp((opp_est_slg - 0.4) * 0.2, -0.03, 0.05)
        if opp_barrel_rate is not None:
            tb2 += (opp_barrel_rate - 0.08) * 0.15
        if opp_hard_hit_rate is not None:
            tb2 += (opp_hard_hit_rate - 0.38) * 0.1
        if weather_factor is not None:
            tb2 += clamp((weather_factor - 1.0) * 0.18, -0.03, 0.05)
        if opp_bullpen_score is not None:
            tb2 += clamp((0.5 - opp_bullpen_score) * 0.06, -0.03, 0.03)
        if starter_recent_form_score is not None:
            tb2 += clamp((0.5 - starter_recent_form_score) * 0.06, -0.03, 0.03)
        if (
            include_bvp
            and vs_pitcher_pa is not None
            and vs_pitcher_pa >= BVP_TB_MIN_PA
            and vs_pitcher_ab is not None
            and vs_pitcher_ab > 0
            and vs_pitcher_hits is not None
            and vs_pitcher_total_bases is not None
        ):
            sample_weight = min(vs_pitcher_pa / 50.0, 1.0)
            pvb_avg = vs_pitcher_hits / vs_pitcher_ab
            pvb_slg = vs_pitcher_total_bases / vs_pitcher_ab
            tb2 += clamp((pvb_avg - 0.245) * 0.05 * sample_weight, -0.009, 0.011)
            tb2 += clamp((pvb_slg - 0.4) * 0.05 * sample_weight, -0.010, 0.014)
        tb2 = clamp(tb2 + (pk - 1) * 0.1, 0.06, 0.55)

    fair_hr = prob_to_american(hr)
    fair_2tb = prob_to_american(tb2)
    th = intrinsic_tier_hr(hr)
    t2 = intrinsic_tier_2tb(tb2)
    conf: ModelConf = "Medium"
    present = feature_slots_total - miss
    if use_real_features:
        if present >= RICH_FEATURE_HIGH_PRESENT_MIN:
            conf = "High"
        elif present < RICH_FEATURE_MEDIUM_PRESENT_MIN:
            conf = "Low"
    else:
        if miss >= 2:
            conf = "Low"
        elif miss == 0:
            conf = "High"
    return hr, tb2, fair_hr, fair_2tb, th, t2, conf
