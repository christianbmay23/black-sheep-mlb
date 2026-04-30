"""Provider-agnostic market provider protocols and registry.

The registry only stores provider objects in priority order. It does not call
providers or alter existing pipeline provider selection.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from black_sheep_mlb.markets.health import ProviderHealth
from black_sheep_mlb.markets.schema import GameMarket, MarketSnapshot, PlayerPropMarket


class GameOddsProvider(Protocol):
    provider_name: str

    def get_game_markets(self, date: str, game_keys: list[str] | None = None) -> list[GameMarket]:
        ...


class PlayerPropsProvider(Protocol):
    provider_name: str

    def get_player_prop_markets(
        self,
        date: str,
        game_keys: list[str] | None = None,
        markets: list[str] | None = None,
    ) -> list[PlayerPropMarket]:
        ...


class ProviderHealthCheck(Protocol):
    provider_name: str

    def check_health(self, date: str | None = None) -> ProviderHealth:
        ...


class MarketSnapshotCache(Protocol):
    def load_snapshot(self, date: str) -> MarketSnapshot | None:
        ...

    def store_snapshot(self, snapshot: MarketSnapshot) -> None:
        ...


class ManualMarketProvider(GameOddsProvider, PlayerPropsProvider, Protocol):
    csv_columns: tuple[str, ...]


@dataclass(frozen=True)
class ProviderRegistration:
    name: str
    provider: object
    priority: int = 100
    enabled: bool = True


class MarketProviderRegistry:
    def __init__(self, registrations: list[ProviderRegistration] | None = None):
        self._registrations: list[ProviderRegistration] = []
        for registration in registrations or []:
            self.register(
                registration.name,
                registration.provider,
                priority=registration.priority,
                enabled=registration.enabled,
            )

    def register(self, name: str, provider: object, *, priority: int = 100, enabled: bool = True) -> None:
        self._registrations.append(
            ProviderRegistration(name=name, provider=provider, priority=priority, enabled=enabled)
        )

    def ordered(self, *, include_disabled: bool = False) -> list[ProviderRegistration]:
        rows = self._registrations if include_disabled else [row for row in self._registrations if row.enabled]
        return sorted(rows, key=lambda row: (row.priority, row.name))

    def names(self, *, include_disabled: bool = False) -> list[str]:
        return [row.name for row in self.ordered(include_disabled=include_disabled)]
