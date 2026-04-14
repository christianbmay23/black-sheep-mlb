from .bullpen_features import bullpen_edge
from .lineup_features import lineup_edge
from .park_weather_features import park_weather_edge
from .pitching_features import pitching_edge


def build_game_features(game: dict) -> dict:
    return {
        "pitching_edge": pitching_edge(game),
        "bullpen_edge": bullpen_edge(game),
        "lineup_edge": lineup_edge(game),
        "park_weather_edge": park_weather_edge(game),
    }
