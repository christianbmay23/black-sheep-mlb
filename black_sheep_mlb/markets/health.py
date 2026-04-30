"""Provider health/result records for market-source diagnostics."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Generic, TypeVar


T = TypeVar("T")


class ProviderAvailability(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    DEGRADED = "degraded"


class ProviderIssueCode(str, Enum):
    AUTHENTICATION_FAILURE = "authentication_failure"
    QUOTA_EXHAUSTED = "quota_exhausted"
    RATE_LIMITED = "rate_limited"
    PARTIAL_COVERAGE = "partial_coverage"
    STALE_DATA = "stale_data"
    UNSUPPORTED_MARKET = "unsupported_market"
    MAPPING_FAILURE = "mapping_failure"
    PROVIDER_ERROR = "provider_error"


@dataclass(frozen=True)
class ProviderDiagnostic:
    code: ProviderIssueCode | str
    message: str
    severity: str = "warning"
    context: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ProviderHealth:
    provider: str
    availability: ProviderAvailability
    latency_ms: float | None = None
    checked_at: str | None = None
    diagnostics: list[ProviderDiagnostic] = field(default_factory=list)
    raw_provider_metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def available(self) -> bool:
        return self.availability == ProviderAvailability.AVAILABLE

    @classmethod
    def available_result(
        cls,
        provider: str,
        *,
        latency_ms: float | None = None,
        checked_at: str | None = None,
        diagnostics: list[ProviderDiagnostic] | None = None,
    ) -> "ProviderHealth":
        return cls(
            provider=provider,
            availability=ProviderAvailability.AVAILABLE,
            latency_ms=latency_ms,
            checked_at=checked_at,
            diagnostics=list(diagnostics or []),
        )

    @classmethod
    def quota_exhausted(
        cls,
        provider: str,
        *,
        message: str = "provider quota exhausted",
        checked_at: str | None = None,
    ) -> "ProviderHealth":
        return cls(
            provider=provider,
            availability=ProviderAvailability.UNAVAILABLE,
            checked_at=checked_at,
            diagnostics=[
                ProviderDiagnostic(
                    code=ProviderIssueCode.QUOTA_EXHAUSTED,
                    message=message,
                    severity="error",
                )
            ],
        )


@dataclass(frozen=True)
class ProviderFetchResult(Generic[T]):
    provider: str
    records: list[T] = field(default_factory=list)
    health: ProviderHealth | None = None
    diagnostics: list[ProviderDiagnostic] = field(default_factory=list)
    raw_provider_metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        if self.health is not None and self.health.availability == ProviderAvailability.UNAVAILABLE:
            return False
        return bool(self.records)
