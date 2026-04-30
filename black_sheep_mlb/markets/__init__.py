"""Provider-agnostic market infrastructure."""
from .cache import FileMarketSnapshotCache, snapshot_from_dict, snapshot_to_dict
from .health import (
    ProviderAvailability,
    ProviderDiagnostic,
    ProviderFetchResult,
    ProviderHealth,
    ProviderIssueCode,
)
from .schema import (
    MANUAL_MARKET_CSV_COLUMNS,
    GameMarket,
    MarketBackedStatus,
    MarketCoverageStatus,
    MarketFreshness,
    MarketSide,
    MarketSnapshot,
    MarketType,
    PlayerPropMarket,
    ProviderEventRef,
    game_markets_from_legacy_game_odds,
    player_prop_market_from_legacy_line,
)
from .status import (
    can_mark_market_backed_ev,
    classify_coverage,
    classify_manual_market,
    classify_market_backing,
)

__all__ = [
    "GameMarket",
    "FileMarketSnapshotCache",
    "MANUAL_MARKET_CSV_COLUMNS",
    "MarketBackedStatus",
    "MarketCoverageStatus",
    "MarketFreshness",
    "MarketSide",
    "MarketSnapshot",
    "MarketType",
    "PlayerPropMarket",
    "ProviderAvailability",
    "ProviderDiagnostic",
    "ProviderEventRef",
    "ProviderFetchResult",
    "ProviderHealth",
    "ProviderIssueCode",
    "can_mark_market_backed_ev",
    "classify_coverage",
    "classify_manual_market",
    "classify_market_backing",
    "game_markets_from_legacy_game_odds",
    "player_prop_market_from_legacy_line",
    "snapshot_from_dict",
    "snapshot_to_dict",
]
