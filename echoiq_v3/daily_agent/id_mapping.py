"""Small ID and alias mapping helpers for EchoIQ live source joins."""

from __future__ import annotations

from dataclasses import dataclass


def _normalize_alias(value: object) -> str:
    return " ".join(str(value or "").replace(".", "").strip().upper().split())


TEAM_ALIASES = {
    "ATH": {"ATH", "OAK", "ATHLETICS", "OAKLAND ATHLETICS"},
    "ATL": {"ATL", "BRAVES", "ATLANTA BRAVES"},
    "AZ": {"AZ", "ARI", "DIAMONDBACKS", "ARIZONA DIAMONDBACKS"},
    "BAL": {"BAL", "ORIOLES", "BALTIMORE ORIOLES"},
    "BOS": {"BOS", "RED SOX", "BOSTON RED SOX"},
    "CHC": {"CHC", "CUBS", "CHICAGO CUBS"},
    "CIN": {"CIN", "REDS", "CINCINNATI REDS"},
    "CLE": {"CLE", "GUARDIANS", "CLEVELAND GUARDIANS"},
    "COL": {"COL", "ROCKIES", "COLORADO ROCKIES"},
    "CWS": {"CWS", "CHW", "WHITE SOX", "CHICAGO WHITE SOX"},
    "DET": {"DET", "TIGERS", "DETROIT TIGERS"},
    "HOU": {"HOU", "ASTROS", "HOUSTON ASTROS"},
    "KC": {"KC", "KCR", "ROYALS", "KANSAS CITY ROYALS"},
    "LAA": {"LAA", "ANGELS", "LOS ANGELES ANGELS"},
    "LAD": {"LAD", "DODGERS", "LOS ANGELES DODGERS"},
    "MIA": {"MIA", "MARLINS", "MIAMI MARLINS"},
    "MIL": {"MIL", "BREWERS", "MILWAUKEE BREWERS"},
    "MIN": {"MIN", "TWINS", "MINNESOTA TWINS"},
    "NYM": {"NYM", "METS", "NEW YORK METS"},
    "NYY": {"NYY", "YANKEES", "NEW YORK YANKEES"},
    "PHI": {"PHI", "PHILLIES", "PHILADELPHIA PHILLIES"},
    "PIT": {"PIT", "PIRATES", "PITTSBURGH PIRATES"},
    "SD": {"SD", "SDP", "PADRES", "SAN DIEGO PADRES"},
    "SEA": {"SEA", "MARINERS", "SEATTLE MARINERS"},
    "SF": {"SF", "SFG", "GIANTS", "SAN FRANCISCO GIANTS"},
    "STL": {"STL", "CARDINALS", "ST. LOUIS CARDINALS", "SAINT LOUIS CARDINALS"},
    "TB": {"TB", "TBR", "RAYS", "TAMPA BAY RAYS"},
    "TEX": {"TEX", "RANGERS", "TEXAS RANGERS"},
    "TOR": {"TOR", "BLUE JAYS", "TORONTO BLUE JAYS"},
    "WSH": {"WSH", "WAS", "NATIONALS", "WASHINGTON NATIONALS"},
}

ALIAS_TO_TEAM = {
    _normalize_alias(alias): team
    for team, aliases in TEAM_ALIASES.items()
    for alias in aliases
}


@dataclass(frozen=True)
class GameMappingResult:
    game_id: str
    away_team: str
    home_team: str
    matched: bool


def normalize_team_code(value: object) -> str:
    raw = _normalize_alias(value)
    if not raw:
        return ""
    return ALIAS_TO_TEAM.get(raw, str(value or "").strip().upper())


def normalize_game_key(value: object) -> str:
    raw = str(value or "").strip()
    if "@" not in raw:
        return ""
    away, home = raw.split("@", 1)
    return game_key(away, home)


def game_key(away_team: object, home_team: object) -> str:
    away = normalize_team_code(away_team)
    home = normalize_team_code(home_team)
    return f"{away}@{home}" if away and home else ""


def game_lookup(games: list[object]) -> dict[str, object]:
    lookup: dict[str, object] = {}
    for game in games:
        away = getattr(game, "away_team", "")
        home = getattr(game, "home_team", "")
        key = game_key(away, home)
        if key:
            lookup[key] = game
    return lookup


def map_game(games: list[object], *, away_team: object = "", home_team: object = "", game_key_value: object = "") -> GameMappingResult:
    key = normalize_game_key(game_key_value) if game_key_value else game_key(away_team, home_team)
    if not key:
        return GameMappingResult(game_id="", away_team=normalize_team_code(away_team), home_team=normalize_team_code(home_team), matched=False)
    game = game_lookup(games).get(key)
    if game is None:
        away, home = key.split("@", 1)
        return GameMappingResult(game_id="", away_team=away, home_team=home, matched=False)
    return GameMappingResult(
        game_id=str(getattr(game, "game_id", "")),
        away_team=str(getattr(game, "away_team", "")),
        home_team=str(getattr(game, "home_team", "")),
        matched=True,
    )


def normalize_player_name(value: object) -> str:
    raw = " ".join(str(value or "").replace(".", "").split()).lower()
    suffixes = {"jr", "sr", "ii", "iii", "iv", "v"}
    parts = [part.strip(",") for part in raw.split()]
    while parts and parts[-1] in suffixes:
        parts.pop()
    return " ".join(parts)

