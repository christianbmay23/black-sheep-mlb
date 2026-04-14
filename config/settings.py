from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "dev"
    log_level: str = "INFO"
    odds_api_key: str = ""
    sportsdataio_api_key: str = ""
    weather_api_key: str = ""
    default_bankroll: float = 1000.0
    use_live_mlb_stats: bool = True
    use_live_odds: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
