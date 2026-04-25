"""Game win probability (ported from canvases/mlb-pregame-intel-apr15.canvas.tsx)."""
from __future__ import annotations

import json
import math
import re
from typing import Literal

ModelConf = Literal["Low", "Medium", "High"]
DecisionTier = Literal["A+", "A", "B", "C", "D"]

Profile = list[list[str]]
DEFAULT_MODEL_WEIGHT_ALPHA = 0.25  # 0.25 = model gets 25% weight; market gets 75% weight.
DEFAULT_MARKET_BLEND_ALPHA = DEFAULT_MODEL_WEIGHT_ALPHA
WIN_PROB_SHRINKAGE_FACTOR = 1.0


def clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def american_to_implied(a: float) -> float:
    if a > 0:
        return 100 / (a + 100)
    aa = abs(a)
    return aa / (aa + 100)


def devig_two_way(away_a: float, home_a: float) -> tuple[float, float]:
    ia = american_to_implied(away_a)
    ih = american_to_implied(home_a)
    s = ia + ih
    if s <= 0:
        return 0.5, 0.5
    return ia / s, ih / s


def recalibrate_win_probability(p: float) -> float:
    """Apply documented linear shrinkage only.

    Keep the factor at 1.0 until strict-slate calibration data justifies moving
    probabilities toward 50%.
    """
    x = clamp(p, 0.001, 0.999) - 0.5
    return clamp(0.5 + x * WIN_PROB_SHRINKAGE_FACTOR, 0.001, 0.999)


def cap_win_probability(p: float, lo: float = 0.25, hi: float = 0.75) -> float:
    return clamp(p, lo, hi)


def blend_with_market(model_prob: float, market_prob: float, *, alpha: float = DEFAULT_MODEL_WEIGHT_ALPHA) -> float:
    weight = clamp(alpha, 0.0, 1.0)
    return clamp((weight * model_prob) + ((1.0 - weight) * market_prob), 0.001, 0.999)


def blended_win_probabilities(
    raw_away: float,
    raw_home: float,
    market_away: float,
    market_home: float,
    *,
    alpha: float = DEFAULT_MODEL_WEIGHT_ALPHA,
) -> tuple[float, float]:
    away = blend_with_market(raw_away, market_away, alpha=alpha)
    home = blend_with_market(raw_home, market_home, alpha=alpha)
    total = away + home
    if total <= 0:
        return 0.5, 0.5
    return away / total, home / total


def parse_xera(profile: Profile) -> float | None:
    for row in profile:
        if len(row) < 2:
            continue
        k, v = row[0], row[1]
        if "/" in v:
            m = re.search(r"/\s*([\d.]+)", v)
            if m:
                return float(m.group(1))
        if "xERA" in k and "/" not in v:
            m2 = re.search(r"([\d.]+)", v)
            if m2:
                return float(m2.group(1))
    return None


def starter_score(xera: float | None) -> float:
    if xera is None or math.isnan(xera):
        return 0.5
    return clamp((5.50 - xera) / 5.00, -0.35, 1.0)


def xera_nonlinear_margin(xa: float | None, xh: float | None) -> float:
    """Extra margin added to ``d = s_h - s_a`` (positive favors home).

    Uses ``(xERA_home - xERA_away)`` in run units with a superlinear magnitude so
    large starter mismatches move win probability more than the linear ``starter_score`` gap alone.
    """
    if xa is None or xh is None or math.isnan(xa) or math.isnan(xh):
        return 0.0
    delta = clamp(xh - xa, -4.25, 4.25)
    mag = abs(delta) ** 1.38
    # delta > 0 => home SP worse on paper => shift d negative (favor away)
    return -0.102 * math.copysign(mag, delta)


def lineup_score(rows: list[list[str]]) -> float:
    if not rows:
        return 0.44
    acc = 0.0
    n = 0
    for row in rows:
        if len(row) > 6:
            brl = row[6]
            if brl and brl != "—" and re.fullmatch(r"\d+", brl or ""):
                acc += int(brl, 10) / 100
                n += 1
        xw = re.sub(r"[^\d.]", "", row[3] if len(row) > 3 else "") or ""
        if xw:
            try:
                x = float(xw)
                acc += clamp((x - 0.28) / 0.22, 0, 1)
                n += 1
            except ValueError:
                pass
    return clamp(acc / n, 0.18, 0.95) if n else 0.44


def park_split(weather: str, run_env: str) -> tuple[float, float]:
    mid = 0.5
    if "dome" in weather.lower():
        mid = 0.52
    if run_env == "High":
        mid = 0.54
    if run_env in {"Low", "Low-Medium"}:
        mid = 0.47
    return mid - 0.012, mid + 0.012


def park_split_from_factor(weather: str, run_env: str, weather_factor: float | None) -> tuple[float, float]:
    away, home = park_split(weather, run_env)
    if weather_factor is None:
        return away, home
    shift = clamp((weather_factor - 1.0) * 0.35, -0.02, 0.02)
    return clamp(away + shift, 0.42, 0.58), clamp(home + shift, 0.42, 0.58)


def variance_score(profile: Profile) -> float:
    blob = json.dumps(profile)
    if "No Savant" in blob or "UNVERIFIED" in blob:
        return 0.38
    if "17 PA" in blob or "tiny sample" in blob or "36 PA" in blob:
        return 0.4
    return 0.52


def win_probability_model(
    away_lineup: list[list[str]],
    home_lineup: list[list[str]],
    away_sp_profile: Profile,
    home_sp_profile: Profile,
    weather: str,
    run_env: str,
    *,
    away_bullpen_score: float | None = None,
    home_bullpen_score: float | None = None,
    away_recent_form_score: float | None = None,
    home_recent_form_score: float | None = None,
    weather_factor: float | None = None,
) -> tuple[float, float, ModelConf, list[str]]:
    xa = parse_xera(away_sp_profile)
    xh = parse_xera(home_sp_profile)
    miss: list[str] = []
    if xa is None:
        miss.append("away SP xERA")
    if xh is None:
        miss.append("home SP xERA")
    if not away_lineup:
        miss.append("away LU")
    if not home_lineup:
        miss.append("home LU")
    if away_bullpen_score is None:
        miss.append("away bullpen")
    if home_bullpen_score is None:
        miss.append("home bullpen")
    if away_recent_form_score is None:
        miss.append("away recent form")
    if home_recent_form_score is None:
        miss.append("home recent form")

    pa_away, pa_home = park_split_from_factor(weather, run_env, weather_factor)
    bull_a = away_bullpen_score if away_bullpen_score is not None else 0.5
    bull_h = home_bullpen_score if home_bullpen_score is not None else 0.5
    recent_a = away_recent_form_score if away_recent_form_score is not None else 0.5
    recent_h = home_recent_form_score if home_recent_form_score is not None else 0.5
    sa = starter_score(xa)
    sh = starter_score(xh)
    lu_a = lineup_score(away_lineup)
    lu_h = lineup_score(home_lineup)
    va = variance_score(away_sp_profile)
    vh = variance_score(home_sp_profile)

    # Fixed slice: SP + recent (L10 proxy) + park + variance (no bullpen / no raw lineup yet).
    w_sp = 0.41
    w_rec = 0.07
    w_pa = 0.07
    w_var = 0.03
    core_a = w_sp * sa + w_rec * recent_a + w_pa * pa_away + w_var * va
    core_h = w_sp * sh + w_rec * recent_h + w_pa * pa_home + w_var * vh
    d_core = core_h - core_a
    close_boost = math.exp(-28.0 * d_core * d_core)
    w_bull = 0.20 + 0.10 * close_boost
    w_lu = 0.22 - 0.10 * close_boost

    s_a = w_sp * sa + w_bull * bull_a + w_lu * lu_a + w_rec * recent_a + w_pa * pa_away + w_var * va
    s_h = w_sp * sh + w_bull * bull_h + w_lu * lu_h + w_rec * recent_h + w_pa * pa_home + w_var * vh
    d = s_h - s_a + xera_nonlinear_margin(xa, xh)
    p_home = 1 / (1 + math.exp(-3.55 * d))
    p_home = recalibrate_win_probability(p_home)
    p_home = cap_win_probability(p_home)
    p_away = 1.0 - p_home

    model_conf: ModelConf = "Medium"
    if len(miss) >= 2:
        model_conf = "Low"
    elif len(miss) == 0 and bool(away_lineup) and bool(home_lineup):
        model_conf = "High"
    return p_away, p_home, model_conf, miss


def tier_from_edge(edge_pct: float) -> DecisionTier:
    if edge_pct >= 7.5:
        return "A+"
    if edge_pct >= 5.0:
        return "A"
    if edge_pct >= 2.5:
        return "B"
    if edge_pct >= 1.0:
        return "C"
    return "D"


def prob_to_american(p: float) -> str:
    if p <= 0.001 or p >= 0.999 or math.isnan(p):
        return "—"
    if p >= 0.5:
        m = -round((p / (1 - p)) * 100)
        return str(m)
    return f"+{round(((1 - p) / p) * 100)}"
