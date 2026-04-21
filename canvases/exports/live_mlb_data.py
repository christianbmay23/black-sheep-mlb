"""Live MLB data adapters for odds, weather, and RotoWire lineup verification."""
from __future__ import annotations

import json
import os
import re
import unicodedata
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any


class LiveDataError(RuntimeError):
    """Raised when a required live data source is unavailable or incomplete."""


ROOT = Path(__file__).resolve().parents[2]
_ENV_LOADED = False
ODDS_API_SPORT = "baseball_mlb"
ODDS_API_PROP_MARKETS = (
    "batter_home_runs",
    "batter_hits",
    "batter_total_bases",
    "batter_rbis",
    "batter_runs_scored",
    "batter_hits_runs_rbis",
    "batter_singles",
    "batter_doubles",
    "batter_triples",
    "batter_walks",
    "batter_strikeouts",
    "batter_stolen_bases",
    "pitcher_strikeouts",
    "pitcher_record_a_win",
    "pitcher_hits_allowed",
    "pitcher_walks",
    "pitcher_earned_runs",
    "pitcher_outs",
)
ROTOWIRE_GAME_BOOKS = (
    "betrivers",
    "caesars",
    "circasports",
    "draftkings",
    "fanatics",
    "fanduel",
    "hardrock",
    "mgm",
    "thescore",
)
ROTOWIRE_PROP_BOOKS = (
    "betrivers",
    "caesars",
    "draftkings",
    "fanatics",
    "fanduel",
    "hardrock",
    "mgm",
    "thescore",
)
ROTOWIRE_PROP_PAGE_KEYS = {
    "batter_home_runs": "onehomerun",
    "batter_total_bases": "bases",
}
RUNTIME_DIAGNOSTICS: list[dict[str, Any]] = []

TEAM_NAME_ALIASES = {
    "athletics": "ATH",
    "oakland athletics": "ATH",
    "a's": "ATH",
    "arizona diamondbacks": "AZ",
    "atlanta braves": "ATL",
    "baltimore orioles": "BAL",
    "boston red sox": "BOS",
    "chicago cubs": "CHC",
    "chicago white sox": "CWS",
    "cincinnati reds": "CIN",
    "cleveland guardians": "CLE",
    "colorado rockies": "COL",
    "detroit tigers": "DET",
    "houston astros": "HOU",
    "kansas city royals": "KC",
    "los angeles angels": "LAA",
    "los angeles dodgers": "LAD",
    "miami marlins": "MIA",
    "milwaukee brewers": "MIL",
    "minnesota twins": "MIN",
    "new york mets": "NYM",
    "new york yankees": "NYY",
    "philadelphia phillies": "PHI",
    "pittsburgh pirates": "PIT",
    "san diego padres": "SD",
    "seattle mariners": "SEA",
    "san francisco giants": "SF",
    "st. louis cardinals": "STL",
    "st louis cardinals": "STL",
    "saint louis cardinals": "STL",
    "tampa bay rays": "TB",
    "texas rangers": "TEX",
    "toronto blue jays": "TOR",
    "washington nationals": "WSH",
}

TEAM_ABBR_ALIASES = {
    "ARI": "AZ",
    "AZ": "AZ",
    "ATH": "ATH",
    "OAK": "ATH",
    "CHW": "CWS",
    "CWS": "CWS",
    "KC": "KC",
    "KCR": "KC",
    "SD": "SD",
    "SDP": "SD",
    "SF": "SF",
    "SFG": "SF",
    "TB": "TB",
    "TBR": "TB",
    "WSH": "WSH",
    "WSN": "WSH",
}

VENUE_COORDS = {
    "angelstadium": (33.8003, -117.8827),
    "buschstadium": (38.6226, -90.1928),
    "chasefield": (33.4453, -112.0667),
    "citizensbankpark": (39.9061, -75.1665),
    "coorsfield": (39.7561, -104.9942),
    "comericapark": (42.3390, -83.0485),
    "daikinpark": (29.7573, -95.3555),
    "dodgerstadium": (34.0739, -118.2400),
    "fenwaypark": (42.3467, -71.0972),
    "georgemsteinbrennerfield": (27.9800, -82.5062),
    "globelifefield": (32.7513, -97.0825),
    "greatamericanballpark": (39.0979, -84.5081),
    "kauffmanstadium": (39.0517, -94.4803),
    "loandepotpark": (25.7781, -80.2197),
    "minutemaidpark": (29.7573, -95.3555),
    "nationalspark": (38.8730, -77.0074),
    "oraclepark": (37.7786, -122.3893),
    "orioleparkatcamdenyards": (39.2839, -76.6217),
    "petcopark": (32.7073, -117.1573),
    "pncpark": (40.4469, -80.0057),
    "progressivefield": (41.4962, -81.6852),
    "rogerscentre": (43.6414, -79.3894),
    "sutterhealthpark": (38.5806, -121.5138),
    "targetfield": (44.9817, -93.2776),
    "tmobilepark": (47.5914, -122.3325),
    "truistpark": (33.8907, -84.4677),
    "wrigleyfield": (41.9484, -87.6553),
    "yankeestadium": (40.8296, -73.9262),
}


@dataclass
class RotoWireLineupSide:
    pitcher_name: str
    pitcher_hand: str
    status: str
    players: list[dict[str, str]]

    @property
    def confirmed(self) -> bool:
        return "confirmed" in self.status.lower()


@dataclass
class RotoWireGame:
    away: str
    home: str
    game_time_et: str
    started: bool
    away_side: RotoWireLineupSide
    home_side: RotoWireLineupSide


@dataclass
class WeatherSnapshot:
    venue_name: str
    source: str
    forecast_time_utc: str
    roof_type: str
    temperature_f: float | None
    wind_speed_mph: float | None
    wind_direction_deg: float | None
    precipitation_probability_pct: float | None
    precipitation_inches: float | None
    weather_code: int | None
    run_factor: float
    summary: str


@dataclass
class GameOdds:
    event_id: str
    away_abbr: str
    home_abbr: str
    away_moneyline: int | None
    home_moneyline: int | None
    total_line: float | None
    over_price: int | None
    under_price: int | None
    bookmakers_count: int
    last_update: str
    source: str = ""


@dataclass
class PropMarketLine:
    event_id: str
    market_key: str
    player_key: str
    player_name: str
    point: float | None
    over_price: int | None
    under_price: int | None
    bookmakers_count: int
    last_update: str
    source: str = ""


def strip_accents(text: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", text or "") if not unicodedata.combining(ch))


def normalize_player_name(name: str) -> str:
    clean = strip_accents(name).lower()
    clean = re.sub(r"\b(jr|sr)\.?\b", "", clean)
    clean = re.sub(r"\b(i|ii|iii|iv|v)\b", "", clean)
    clean = re.sub(r"[^a-z0-9]+", "", clean)
    return clean


def normalize_team_name(name: str) -> str:
    clean = strip_accents(name).lower().replace("&amp;", "and")
    clean = re.sub(r"[^a-z0-9 ]+", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return TEAM_NAME_ALIASES.get(clean, clean.upper())


def normalize_team_abbr(name: str) -> str:
    clean = strip_accents(name).upper().strip()
    return TEAM_ABBR_ALIASES.get(clean, clean)


def normalize_venue_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", strip_accents((name or "").lower()))


def fetch_text(url: str, headers: dict[str, str] | None = None) -> str:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read().decode("utf-8", "ignore")


def fetch_json(url: str, headers: dict[str, str] | None = None) -> Any:
    text = fetch_text(url, headers=headers)
    return json.loads(text)


def parse_float(value: Any) -> float | None:
    if value in {None, "", "—"}:
        return None
    try:
        return float(str(value).strip())
    except ValueError:
        return None


def parse_int(value: Any) -> int | None:
    if value in {None, "", "—"}:
        return None
    try:
        return int(str(value).strip())
    except ValueError:
        return None


def round_median(values: list[int]) -> int | None:
    if not values:
        return None
    return int(round(median(values)))


def round_median_float(values: list[float]) -> float | None:
    if not values:
        return None
    return float(round(float(median(values)), 3))


def parse_iso_utc(value: Any) -> datetime | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        return None


def load_repo_env() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    _ENV_LOADED = True
    protected_keys = set(os.environ)
    for name in (".env", ".env.local"):
        path = ROOT / name
        if not path.is_file():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            if not key or key in protected_keys:
                continue
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
                value = value[1:-1]
            os.environ[key] = value


def odds_api_key(required: bool = False) -> str | None:
    load_repo_env()
    key = os.getenv("ODDS_API_KEY") or os.getenv("THE_ODDS_API_KEY")
    if required and not key:
        raise LiveDataError("Missing ODDS_API_KEY / THE_ODDS_API_KEY for live odds + prop market ingestion.")
    return key


def reset_runtime_diagnostics() -> None:
    RUNTIME_DIAGNOSTICS.clear()


def get_runtime_diagnostics() -> list[dict[str, Any]]:
    return list(RUNTIME_DIAGNOSTICS)


def record_runtime_diagnostic(
    code: str,
    message: str,
    *,
    severity: str = "warning",
    source: str = "",
    context: dict[str, Any] | None = None,
) -> None:
    entry = {
        "code": code,
        "message": message,
        "severity": severity,
        "source": source,
        "context": context or {},
    }
    if entry not in RUNTIME_DIAGNOSTICS:
        RUNTIME_DIAGNOSTICS.append(entry)


def parse_http_error_details(exc: Exception) -> dict[str, str]:
    details: dict[str, str] = {}
    body = ""
    if hasattr(exc, "read"):
        try:
            body = exc.read().decode("utf-8", "ignore")
        except Exception:
            body = ""
    if body:
        try:
            parsed = json.loads(body)
            if isinstance(parsed, dict):
                details = {str(k): str(v) for k, v in parsed.items() if v is not None}
        except json.JSONDecodeError:
            details["body"] = body[:300]
    if "message" not in details and str(exc):
        details["message"] = str(exc)
    return details


def scan_div_block(text: str, start_idx: int) -> str:
    depth = 0
    token = re.compile(r"<div\b|</div>")
    for match in token.finditer(text, start_idx):
        if match.group(0) == "<div":
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return text[start_idx : match.end()]
    return text[start_idx:]


def strip_tags(value: str) -> str:
    text = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", text).strip()


def extract_inline_json_array(text: str, anchor: str) -> list[dict[str, Any]]:
    anchor_idx = text.find(anchor)
    if anchor_idx < 0:
        raise LiveDataError(f"Unable to find embedded JSON anchor: {anchor}")
    data_idx = text.find("data:", anchor_idx)
    if data_idx < 0:
        raise LiveDataError(f"Unable to find embedded data array after anchor: {anchor}")
    arr_idx = text.find("[", data_idx)
    if arr_idx < 0:
        raise LiveDataError(f"Unable to find embedded JSON array after anchor: {anchor}")
    decoder = json.JSONDecoder()
    payload, _ = decoder.raw_decode(text[arr_idx:])
    if not isinstance(payload, list):
        raise LiveDataError(f"Embedded data payload is not a list for anchor: {anchor}")
    return payload


def parse_rotowire_side(block: str, side: str) -> RotoWireLineupSide:
    list_match = re.search(rf'<ul class="lineup__list is-{side}">(.*?)</ul>', block, flags=re.DOTALL)
    if not list_match:
        return RotoWireLineupSide("", "", "Missing", [])
    section = list_match.group(1)

    pitcher_match = re.search(
        r'lineup__player-highlight-name">\s*<a[^>]*>([^<]+)</a>\s*<span class="lineup__throws">([^<]*)</span>',
        section,
        flags=re.DOTALL,
    )
    status_match = re.search(r'<li class="lineup__status[^"]*">(.*?)</li>', section, flags=re.DOTALL)
    players: list[dict[str, str]] = []
    for player_match in re.finditer(
        r'<li class="lineup__player">.*?<div class="lineup__pos">([^<]+)</div>\s*'
        r'<a(?: title="([^"]+)")?[^>]*>([^<]+)</a>\s*'
        r'<span class="lineup__bats">([^<]*)</span>',
        section,
        flags=re.DOTALL,
    ):
        pos, title_name, display_name, bats = player_match.groups()
        name = strip_tags(title_name or display_name)
        players.append({"name": name, "pos": strip_tags(pos), "bats": strip_tags(bats)})

    return RotoWireLineupSide(
        pitcher_name=strip_tags(pitcher_match.group(1) if pitcher_match else ""),
        pitcher_hand=strip_tags(pitcher_match.group(2) if pitcher_match else ""),
        status=strip_tags(status_match.group(1) if status_match else "Missing"),
        players=players,
    )


def fetch_rotowire_lineups(date_str: str) -> dict[str, RotoWireGame]:
    url = f"https://www.rotowire.com/baseball/daily-lineups.php?date={urllib.parse.quote(date_str)}"
    text = fetch_text(url, headers={"User-Agent": "Mozilla/5.0"})
    matches = list(re.finditer(r'<div class="lineup is-mlb[^"]*"', text))
    if not matches:
        raise LiveDataError("RotoWire lineup page did not return any MLB lineup blocks.")

    out: dict[str, RotoWireGame] = {}
    for match in matches:
        block = scan_div_block(text, match.start())
        team_codes = re.findall(r'<div class="lineup__abbr">\s*([A-Z]+)\s*</div>', block)
        if len(team_codes) < 2:
            continue
        away, home = normalize_team_abbr(team_codes[0]), normalize_team_abbr(team_codes[1])
        game_key = f"{away}@{home}"
        time_match = re.search(r'<div class="lineup__time">\s*([^<]+)</div>', block)
        away_side = parse_rotowire_side(block, "visit")
        home_side = parse_rotowire_side(block, "home")
        out[game_key] = RotoWireGame(
            away=away,
            home=home,
            game_time_et=strip_tags(time_match.group(1) if time_match else ""),
            started="has-started" in block,
            away_side=away_side,
            home_side=home_side,
        )
    if not out:
        raise LiveDataError("Unable to parse any RotoWire lineup games.")
    return out


def geocode_venue(venue_name: str, location_name: str) -> tuple[float, float]:
    venue_key = normalize_venue_key(venue_name)
    if venue_key in VENUE_COORDS:
        return VENUE_COORDS[venue_key]
    queries = [
        f"{venue_name} {location_name} MLB",
        f"{venue_name} {location_name}",
        venue_name,
    ]
    for query in queries:
        data = fetch_json(
            "https://geocoding-api.open-meteo.com/v1/search?"
            + urllib.parse.urlencode({"name": query, "count": 5, "language": "en", "format": "json"})
        )
        results = data.get("results") or []
        filtered = [r for r in results if r.get("country_code") in {"US", "CA"}]
        chosen = filtered[0] if filtered else (results[0] if results else None)
        if chosen and chosen.get("latitude") is not None and chosen.get("longitude") is not None:
            return float(chosen["latitude"]), float(chosen["longitude"])
    raise LiveDataError(f"Open-Meteo geocoding failed for venue '{venue_name}' ({location_name}).")


def compute_weather_run_factor(
    temperature_f: float | None,
    wind_speed_mph: float | None,
    precip_pct: float | None,
    weather_code: int | None,
    roof_type: str,
) -> float:
    factor = 1.0
    if temperature_f is not None:
        factor += max(-0.05, min(0.06, (temperature_f - 70.0) * 0.0025))
    if wind_speed_mph is not None:
        factor += max(-0.015, min(0.025, (wind_speed_mph - 8.0) * 0.0015))
    if precip_pct is not None:
        factor -= max(0.0, min(0.04, (precip_pct - 30.0) * 0.0008))
    if weather_code in {61, 63, 65, 66, 67, 71, 73, 75, 80, 81, 82, 95, 96, 99}:
        factor -= 0.02
    roof_lower = (roof_type or "").lower()
    if "closed" in roof_lower or "dome" in roof_lower:
        factor -= 0.005
    return round(max(0.88, min(1.12, factor)), 3)


def fetch_weather_snapshot(
    venue_name: str,
    location_name: str,
    roof_type: str,
    game_time_utc: str,
) -> WeatherSnapshot:
    latitude, longitude = geocode_venue(venue_name, location_name)
    game_dt = datetime.fromisoformat(game_time_utc.replace("Z", "+00:00")).astimezone(timezone.utc)
    forecast = fetch_json(
        "https://api.open-meteo.com/v1/forecast?"
        + urllib.parse.urlencode(
            {
                "latitude": f"{latitude:.4f}",
                "longitude": f"{longitude:.4f}",
                "hourly": ",".join(
                    [
                        "temperature_2m",
                        "wind_speed_10m",
                        "wind_direction_10m",
                        "precipitation_probability",
                        "precipitation",
                        "weather_code",
                    ]
                ),
                "temperature_unit": "fahrenheit",
                "wind_speed_unit": "mph",
                "precipitation_unit": "inch",
                "timezone": "UTC",
                "forecast_days": 3,
            }
        )
    )
    hourly = forecast.get("hourly") or {}
    times = hourly.get("time") or []
    if not times:
        raise LiveDataError(f"Open-Meteo forecast returned no hourly data for {venue_name}.")

    parsed_times: list[datetime] = []
    for raw in times:
        parsed_times.append(datetime.fromisoformat(f"{raw}+00:00"))
    nearest_idx = min(range(len(parsed_times)), key=lambda idx: abs((parsed_times[idx] - game_dt).total_seconds()))

    temp_f = parse_float((hourly.get("temperature_2m") or [None])[nearest_idx])
    wind_mph = parse_float((hourly.get("wind_speed_10m") or [None])[nearest_idx])
    wind_dir = parse_float((hourly.get("wind_direction_10m") or [None])[nearest_idx])
    precip_pct = parse_float((hourly.get("precipitation_probability") or [None])[nearest_idx])
    precip_inches = parse_float((hourly.get("precipitation") or [None])[nearest_idx])
    weather_code = parse_int((hourly.get("weather_code") or [None])[nearest_idx])
    run_factor = compute_weather_run_factor(temp_f, wind_mph, precip_pct, weather_code, roof_type)

    summary_bits = []
    if temp_f is not None:
        summary_bits.append(f"{round(temp_f)}F")
    if wind_mph is not None:
        summary_bits.append(f"{round(wind_mph)} mph wind")
    if precip_pct is not None:
        summary_bits.append(f"{round(precip_pct)}% precip")
    if roof_type:
        summary_bits.append(roof_type)

    return WeatherSnapshot(
        venue_name=venue_name,
        source="Open-Meteo",
        forecast_time_utc=parsed_times[nearest_idx].isoformat().replace("+00:00", "Z"),
        roof_type=roof_type,
        temperature_f=temp_f,
        wind_speed_mph=wind_mph,
        wind_direction_deg=wind_dir,
        precipitation_probability_pct=precip_pct,
        precipitation_inches=precip_inches,
        weather_code=weather_code,
        run_factor=run_factor,
        summary=" / ".join(summary_bits),
    )


def summarize_total_market(market: dict[str, Any]) -> tuple[float | None, int | None, int | None]:
    by_point: dict[float, dict[str, list[int]]] = defaultdict(lambda: {"Over": [], "Under": []})
    for outcome in market.get("outcomes") or []:
        point = parse_float(outcome.get("point"))
        price = parse_int(outcome.get("price"))
        side = str(outcome.get("name") or "")
        if point is None or price is None or side not in {"Over", "Under"}:
            continue
        by_point[point][side].append(price)
    if not by_point:
        return None, None, None
    point = max(
        by_point.keys(),
        key=lambda candidate: len(by_point[candidate]["Over"]) + len(by_point[candidate]["Under"]),
    )
    return point, round_median(by_point[point]["Over"]), round_median(by_point[point]["Under"])


def choose_rotowire_total_market(rows: list[dict[str, Any]]) -> tuple[float | None, int | None, int | None, int]:
    by_point: dict[float, list[int]] = defaultdict(list)
    for row in rows:
        for book in ROTOWIRE_GAME_BOOKS:
            point = parse_float(row.get(f"{book}_ou"))
            price = parse_int(row.get(f"{book}_ouML"))
            if point is None or price is None:
                continue
            by_point[point].append(price)
    if not by_point:
        return None, None, None, 0
    chosen_point = max(
        by_point.keys(),
        key=lambda candidate: (len(by_point[candidate]), -abs(candidate - 8.0)),
    )
    juice = round_median(by_point[chosen_point])
    coverage = len(by_point[chosen_point])
    return chosen_point, juice, juice, coverage


def fetch_rotowire_game_odds(
    date_str: str,
    schedule_games: dict[str, dict[str, Any]],
) -> dict[str, GameOdds]:
    payload = fetch_json(
        "https://www.rotowire.com/betting/mlb/tables/mlb-games.php?"
        + urllib.parse.urlencode({"date": date_str}),
        headers={"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest"},
    )
    if not isinstance(payload, list):
        raise LiveDataError("RotoWire game odds table did not return a list payload.")

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in payload:
        if not isinstance(row, dict):
            continue
        grouped[str(row.get("gameID") or "")].append(row)

    out: dict[str, GameOdds] = {}
    for rows in grouped.values():
        if not rows:
            continue
        base = next((row for row in rows if str(row.get("homeAway") or "") == "away"), rows[0])
        team = normalize_team_abbr(str(base.get("abbr") or ""))
        opp = normalize_team_abbr(str(base.get("oppAbbr") or ""))
        away_abbr, home_abbr = (team, opp) if str(base.get("homeAway") or "") == "away" else (opp, team)
        game_key = f"{away_abbr}@{home_abbr}"
        if game_key not in schedule_games:
            continue

        away_prices: list[int] = []
        home_prices: list[int] = []
        for row in rows:
            is_away_row = str(row.get("homeAway") or "") == "away"
            for book in ROTOWIRE_GAME_BOOKS:
                team_price = parse_int(row.get(f"{book}_moneyline"))
                opp_price = parse_int(row.get(f"{book}_moneylineOpp"))
                if team_price is None or opp_price is None:
                    continue
                if is_away_row:
                    away_prices.append(team_price)
                    home_prices.append(opp_price)
                else:
                    home_prices.append(team_price)
                    away_prices.append(opp_price)

        total_line, over_price, under_price, total_coverage = choose_rotowire_total_market(rows)
        moneyline_coverage = min(len(away_prices), len(home_prices))

        out[game_key] = GameOdds(
            event_id=f"rotowire:{rows[0].get('gameID')}",
            away_abbr=away_abbr,
            home_abbr=home_abbr,
            away_moneyline=round_median(away_prices),
            home_moneyline=round_median(home_prices),
            total_line=total_line,
            over_price=over_price,
            under_price=under_price,
            bookmakers_count=max(moneyline_coverage, total_coverage),
            last_update=date_str,
            source="rotowire_game_table",
        )
    return out


def fetch_live_game_odds(
    schedule_games: dict[str, dict[str, Any]],
    date_str: str | None = None,
    *,
    required: bool = False,
) -> dict[str, GameOdds]:
    out: dict[str, GameOdds] = {}
    selection_meta: dict[str, tuple[float, bool, int]] = {}
    api_key = odds_api_key(required=False)
    if api_key:
        try:
            payload = fetch_json(
                "https://api.the-odds-api.com/v4/sports/"
                f"{ODDS_API_SPORT}/odds?"
                + urllib.parse.urlencode(
                    {
                        "apiKey": api_key,
                        "regions": "us",
                        "markets": "h2h,totals",
                        "oddsFormat": "american",
                        "dateFormat": "iso",
                    }
                )
            )
            for event in payload:
                away_abbr = normalize_team_name(str(event.get("away_team") or ""))
                home_abbr = normalize_team_name(str(event.get("home_team") or ""))
                if not re.fullmatch(r"[A-Z]{2,3}", away_abbr) or not re.fullmatch(r"[A-Z]{2,3}", home_abbr):
                    continue
                game_key = f"{away_abbr}@{home_abbr}"
                if game_key not in schedule_games:
                    continue

                away_prices: list[int] = []
                home_prices: list[int] = []
                total_line: float | None = None
                over_price: int | None = None
                under_price: int | None = None
                last_update = ""
                bookmakers_count = 0
                schedule_dt = parse_iso_utc(schedule_games[game_key].get("game_date_utc"))
                event_dt = parse_iso_utc(event.get("commence_time"))

                for bookmaker in event.get("bookmakers") or []:
                    bookmakers_count += 1
                    for market in bookmaker.get("markets") or []:
                        market_key = market.get("key")
                        last_update = max(last_update, str(market.get("last_update") or ""))
                        if market_key == "h2h":
                            for outcome in market.get("outcomes") or []:
                                price = parse_int(outcome.get("price"))
                                if price is None:
                                    continue
                                team_abbr = normalize_team_name(str(outcome.get("name") or ""))
                                if team_abbr == away_abbr:
                                    away_prices.append(price)
                                elif team_abbr == home_abbr:
                                    home_prices.append(price)
                        elif market_key == "totals":
                            total_line, over_price, under_price = summarize_total_market(market)

                away_moneyline = round_median(away_prices)
                home_moneyline = round_median(home_prices)
                has_two_way_moneyline = away_moneyline is not None and home_moneyline is not None
                event_distance = (
                    abs((event_dt - schedule_dt).total_seconds())
                    if event_dt is not None and schedule_dt is not None
                    else float("inf")
                )
                previous_distance, previous_has_two_way, previous_bookmakers = selection_meta.get(
                    game_key,
                    (float("inf"), False, -1),
                )
                should_replace = (
                    game_key not in out
                    or (has_two_way_moneyline and not previous_has_two_way)
                    or (
                        has_two_way_moneyline == previous_has_two_way
                        and (
                            event_distance < previous_distance
                            or (
                                event_distance == previous_distance
                                and bookmakers_count > previous_bookmakers
                            )
                        )
                    )
                )
                if not should_replace:
                    continue

                out[game_key] = GameOdds(
                    event_id=str(event.get("id") or ""),
                    away_abbr=away_abbr,
                    home_abbr=home_abbr,
                    away_moneyline=away_moneyline,
                    home_moneyline=home_moneyline,
                    total_line=total_line,
                    over_price=over_price,
                    under_price=under_price,
                    bookmakers_count=bookmakers_count,
                    last_update=last_update,
                    source="odds_api",
                )
                selection_meta[game_key] = (event_distance, has_two_way_moneyline, bookmakers_count)
        except Exception as exc:
            details = parse_http_error_details(exc)
            error_code = details.get("error_code", "")
            message = details.get("message", str(exc))
            if error_code == "OUT_OF_USAGE_CREDITS":
                record_runtime_diagnostic(
                    "odds_api_out_of_usage_credits",
                    "Odds API usage credits are exhausted; falling back to Rotowire game odds. Live Odds API event IDs for prop pulls are unavailable until credits are restored.",
                    source="odds_api",
                    context={"date": date_str or "", "stage": "game_odds"},
                )
            else:
                record_runtime_diagnostic(
                    "odds_api_game_odds_failed",
                    f"Odds API game odds request failed: {message}",
                    source="odds_api",
                    context={"date": date_str or "", "stage": "game_odds", "error_code": error_code},
                )
            if required and not date_str:
                raise

    if date_str:
        fallback = fetch_rotowire_game_odds(date_str, schedule_games)
        for game_key, rotowire_game in fallback.items():
            current = out.get(game_key)
            if current is None:
                out[game_key] = rotowire_game
                continue
            if current.away_moneyline is None:
                current.away_moneyline = rotowire_game.away_moneyline
            if current.home_moneyline is None:
                current.home_moneyline = rotowire_game.home_moneyline
            if current.total_line is None:
                current.total_line = rotowire_game.total_line
            if current.over_price is None:
                current.over_price = rotowire_game.over_price
            if current.under_price is None:
                current.under_price = rotowire_game.under_price
            current.bookmakers_count = max(current.bookmakers_count, rotowire_game.bookmakers_count)
            if not current.last_update:
                current.last_update = rotowire_game.last_update
            if rotowire_game.source and rotowire_game.source not in current.source:
                current.source = "+".join(part for part in [current.source, rotowire_game.source] if part)

    if required and not out:
        raise LiveDataError("Unable to load any live game odds from configured providers.")
    return out


def choose_prop_line(
    grouped: dict[tuple[str, float | None], dict[str, list[int]]],
    target_point: float | None = None,
) -> tuple[float | None, int | None, int | None, int]:
    if not grouped:
        return None, None, None, 0
    scored: list[tuple[int, float, float | None]] = []
    for (_, point), sides in grouped.items():
        coverage = len(sides["Over"]) + len(sides["Yes"]) + len(sides["Under"]) + len(sides["No"])
        point_gap = abs((point or 0.0) - (target_point or (point or 0.0)))
        scored.append((coverage, -point_gap, point))
    scored.sort(reverse=True)
    chosen_point = scored[0][2]
    entry = next(sides for (_, point), sides in grouped.items() if point == chosen_point)
    over_prices = entry["Over"] + entry["Yes"]
    under_prices = entry["Under"] + entry["No"]
    coverage = len(over_prices) + len(under_prices)
    return chosen_point, round_median(over_prices), round_median(under_prices), coverage


def fetch_live_prop_markets(event_id: str, *, required: bool = False) -> dict[tuple[str, str], PropMarketLine]:
    api_key = odds_api_key(required=False)
    if not api_key:
        return {}
    try:
        payload = fetch_json(
            "https://api.the-odds-api.com/v4/sports/"
            f"{ODDS_API_SPORT}/events/{urllib.parse.quote(event_id)}/odds?"
            + urllib.parse.urlencode(
                {
                    "apiKey": api_key,
                    "regions": "us",
                    "markets": ",".join(ODDS_API_PROP_MARKETS),
                    "oddsFormat": "american",
                    "dateFormat": "iso",
                }
            )
        )
    except Exception as exc:
        details = parse_http_error_details(exc)
        error_code = details.get("error_code", "")
        message = details.get("message", str(exc))
        if error_code == "OUT_OF_USAGE_CREDITS":
            record_runtime_diagnostic(
                "odds_api_out_of_usage_credits",
                "Odds API usage credits are exhausted; live prop pulls are unavailable and fallback sources will be used where possible.",
                source="odds_api",
                context={"event_id": event_id, "stage": "prop_markets"},
            )
        else:
            record_runtime_diagnostic(
                "odds_api_prop_markets_failed",
                f"Odds API prop request failed for event {event_id}: {message}",
                source="odds_api",
                context={"event_id": event_id, "stage": "prop_markets", "error_code": error_code},
            )
        if required:
            raise
        return {}
    grouped: dict[tuple[str, str], dict[tuple[str, float | None], dict[str, list[int]]]] = defaultdict(
        lambda: defaultdict(lambda: {"Over": [], "Under": [], "Yes": [], "No": []})
    )
    display_names: dict[tuple[str, str], str] = {}
    updates: dict[tuple[str, str], str] = {}

    for bookmaker in payload.get("bookmakers") or []:
        for market in bookmaker.get("markets") or []:
            market_key = str(market.get("key") or "")
            if not market_key:
                continue
            market_update = str(market.get("last_update") or "")
            for outcome in market.get("outcomes") or []:
                player_name = str(outcome.get("description") or "")
                player_key = normalize_player_name(player_name)
                if not player_key:
                    continue
                side = str(outcome.get("name") or "")
                price = parse_int(outcome.get("price"))
                point = parse_float(outcome.get("point"))
                if side not in {"Over", "Under", "Yes", "No"} or price is None:
                    continue
                grouped[(player_key, market_key)][(player_key, point)][side].append(price)
                display_names[(player_key, market_key)] = player_name
                updates[(player_key, market_key)] = max(updates.get((player_key, market_key), ""), market_update)

    out: dict[tuple[str, str], PropMarketLine] = {}
    for (player_key, market_key), player_group in grouped.items():
        target_point = 1.5 if market_key == "batter_total_bases" else 0.5 if market_key == "batter_home_runs" else None
        point, over_price, under_price, coverage = choose_prop_line(player_group, target_point=target_point)
        out[(player_key, market_key)] = PropMarketLine(
            event_id=event_id,
            market_key=market_key,
            player_key=player_key,
            player_name=display_names[(player_key, market_key)],
            point=point,
            over_price=over_price,
            under_price=under_price,
            bookmakers_count=coverage,
            last_update=updates.get((player_key, market_key), ""),
            source="odds_api",
        )
    if required and not out:
        raise LiveDataError(f"No live prop markets returned for event {event_id}.")
    return out


def summarize_rotowire_tb_market(row: dict[str, Any]) -> tuple[float | None, int | None, int | None, int, str]:
    grouped: dict[float, dict[str, list[int]]] = defaultdict(lambda: {"Over": [], "Under": []})
    inferred_yes_prices: list[int] = []
    for book in ROTOWIRE_PROP_BOOKS:
        point = parse_float(row.get(f"{book}_bases"))
        under_price = parse_int(row.get(f"{book}_basesUnder"))
        over_price = parse_int(row.get(f"{book}_basesOver"))
        if point is not None and (under_price is not None or over_price is not None) and 0.5 <= point <= 3.5:
            if over_price is not None:
                grouped[point]["Over"].append(over_price)
            if under_price is not None:
                grouped[point]["Under"].append(under_price)
            continue
        if point is not None:
            inferred_yes_prices.append(int(round(point * 100)))

    if grouped:
        target_point = min(grouped.keys(), key=lambda candidate: (abs(candidate - 1.5), -len(grouped[candidate]["Over"])))
        over_price = round_median(grouped[target_point]["Over"])
        under_price = round_median(grouped[target_point]["Under"])
        coverage = len(grouped[target_point]["Over"]) + len(grouped[target_point]["Under"])
        return target_point, over_price, under_price, coverage, "rotowire_props_two_way"

    if inferred_yes_prices:
        return 1.5, round_median(inferred_yes_prices), None, len(inferred_yes_prices), "rotowire_props_yes_only"

    return None, None, None, 0, ""


def fetch_rotowire_team_hr_markets(team_abbr: str) -> list[dict[str, Any]]:
    payload = fetch_json(
        "https://www.rotowire.com/baseball/ajax/get-home-run-chances.php?"
        + urllib.parse.urlencode({"team": team_abbr}),
        headers={"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest"},
    )
    return payload if isinstance(payload, list) else []


def fetch_rotowire_prop_markets(date_str: str) -> dict[str, dict[tuple[str, str], PropMarketLine]]:
    rotowire_games = fetch_rotowire_lineups(date_str)
    team_to_game: dict[str, str] = {}
    for game_key, game in rotowire_games.items():
        team_to_game[game.away] = game_key
        team_to_game[game.home] = game_key

    text = fetch_text(
        "https://www.rotowire.com/betting/mlb/player-props.php?" + urllib.parse.urlencode({"date": date_str}),
        headers={"User-Agent": "Mozilla/5.0"},
    )
    tb_rows = extract_inline_json_array(text, 'const prop = "bases"')

    out: dict[str, dict[tuple[str, str], PropMarketLine]] = defaultdict(dict)

    for team_abbr, game_key in team_to_game.items():
        for row in fetch_rotowire_team_hr_markets(team_abbr):
            player_name = str(row.get("name") or "").strip()
            player_key = normalize_player_name(player_name)
            if not player_key:
                continue
            prices = [parse_int((row.get("oddsHR") or {}).get(book)) for book in ROTOWIRE_PROP_BOOKS]
            prices = [price for price in prices if price is not None]
            if not prices:
                continue
            out[game_key][(player_key, "batter_home_runs")] = PropMarketLine(
                event_id=f"rotowire:{game_key}",
                market_key="batter_home_runs",
                player_key=player_key,
                player_name=player_name,
                point=0.5,
                over_price=round_median(prices),
                under_price=None,
                bookmakers_count=len(prices),
                last_update=date_str,
                source="rotowire_props_yes_only",
            )

    for row in tb_rows:
        player_name = str(row.get("name") or "")
        player_key = normalize_player_name(player_name)
        team = normalize_team_abbr(str(row.get("team") or ""))
        opp = normalize_team_abbr(str(row.get("opp") or "").lstrip("@"))
        if not player_key or not team or not opp:
            continue
        game_key = f"{team}@{opp}" if str(row.get("opp") or "").startswith("@") else f"{opp}@{team}"
        if game_key not in team_to_game.values():
            continue
        point, over_price, under_price, coverage, source = summarize_rotowire_tb_market(row)
        if point is None or over_price is None:
            continue
        out[game_key][(player_key, "batter_total_bases")] = PropMarketLine(
            event_id=f"rotowire:{game_key}",
            market_key="batter_total_bases",
            player_key=player_key,
            player_name=player_name,
            point=point,
            over_price=over_price,
            under_price=under_price,
            bookmakers_count=coverage,
            last_update=date_str,
            source=source,
        )

    return dict(out)


def fetch_slate_prop_markets(
    date_str: str,
    event_ids_by_game: dict[str, str],
) -> dict[str, dict[tuple[str, str], PropMarketLine]]:
    out: dict[str, dict[tuple[str, str], PropMarketLine]] = {game_key: {} for game_key in event_ids_by_game}
    rotowire_only_games = sorted(game_key for game_key, event_id in event_ids_by_game.items() if str(event_id).startswith("rotowire:"))
    if rotowire_only_games:
        record_runtime_diagnostic(
            "rotowire_only_prop_fallback",
            f"Using Rotowire-only prop fallback for {len(rotowire_only_games)} games because live Odds API event IDs were unavailable.",
            source="rotowire",
            context={"games": rotowire_only_games, "date": date_str},
        )
    for game_key, event_id in event_ids_by_game.items():
        if not event_id or event_id.startswith("rotowire:"):
            continue
        try:
            out[game_key] = fetch_live_prop_markets(event_id, required=False)
        except Exception:
            out[game_key] = {}

    fallback = fetch_rotowire_prop_markets(date_str)
    for game_key, markets in fallback.items():
        current = out.setdefault(game_key, {})
        for market_key, line in markets.items():
            current.setdefault(market_key, line)
    return out
