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


def strip_accents(text: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch))


def lineup_match_key(name: str) -> str:
    stripped = strip_accents(name)
    parts = [p for p in stripped.split() if not re.match(r"^jr\.?$", p, re.I) and not re.match(r"^sr\.?$", p, re.I)]
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
    if p >= 0.38:
        return "A+"
    if p >= 0.32:
        return "A"
    if p >= 0.26:
        return "B"
    if p >= 0.2:
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
) -> tuple[float, float, str, str, Tier, ModelConf]:
    row = find_lineup_row(lineup, batter)
    brl = parse_brl(row)
    xslg = parse_xslg(row)
    pk = park_factor(away, home)
    opp_xera = parse_xera(opp_sp_profile)
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
    fair_hr = prob_to_american(hr)
    fair_2tb = prob_to_american(tb2)
    th = intrinsic_tier_hr(hr)
    t2 = intrinsic_tier_2tb(tb2)
    rank = {"A+": 5, "A": 4, "B": 3, "C": 2, "D": 1}
    tier: Tier = th if rank[th] >= rank[t2] else t2
    conf: ModelConf = "Medium"
    if miss >= 2:
        conf = "Low"
    if miss == 0 and row:
        conf = "High"
    return hr, tb2, fair_hr, fair_2tb, tier, conf
