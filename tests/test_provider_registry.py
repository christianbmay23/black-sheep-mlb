from __future__ import annotations

import unittest

from black_sheep_mlb.data_sources.provider_registry import MarketProviderRegistry
from black_sheep_mlb.markets.health import ProviderAvailability, ProviderHealth, ProviderIssueCode


class ProviderRegistryTests(unittest.TestCase):
    def test_registry_orders_enabled_providers_by_priority_without_calling_them(self):
        primary = _Provider("primary")
        secondary = _Provider("secondary")
        disabled = _Provider("disabled")
        registry = MarketProviderRegistry()

        registry.register("secondary", secondary, priority=20)
        registry.register("disabled", disabled, priority=1, enabled=False)
        registry.register("primary", primary, priority=10)

        self.assertEqual(registry.names(), ["primary", "secondary"])
        self.assertEqual(registry.names(include_disabled=True), ["disabled", "primary", "secondary"])
        self.assertFalse(primary.called)
        self.assertFalse(secondary.called)
        self.assertFalse(disabled.called)

    def test_provider_health_quota_exhausted_result(self):
        health = ProviderHealth.quota_exhausted("oddsapi", message="credits exhausted")

        self.assertEqual(health.provider, "oddsapi")
        self.assertEqual(health.availability, ProviderAvailability.UNAVAILABLE)
        self.assertFalse(health.available)
        self.assertEqual(health.diagnostics[0].code, ProviderIssueCode.QUOTA_EXHAUSTED)
        self.assertEqual(health.diagnostics[0].severity, "error")


class _Provider:
    provider_name = "test"

    def __init__(self, name: str):
        self.name = name
        self.called = False

    def get_game_markets(self, *args, **kwargs):
        self.called = True
        return []


if __name__ == "__main__":
    unittest.main()
