from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "PayGuard AI"
    app_env: str = "development"
    app_debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = (
        "postgresql+psycopg://payguard:payguard@localhost:5432/payguard"
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Use psycopg 3 for hosting-provider PostgreSQL URLs."""
        if value.startswith("postgres://"):
            return value.replace(
                "postgres://",
                "postgresql+psycopg://",
                1,
            )

        if value.startswith("postgresql://"):
            return value.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1,
            )

        return value

    # Authentication
    jwt_secret: str | None = None
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Frontend
    frontend_url: str = "http://localhost:5173"

    # AI
    ai_provider: str | None = None
    ai_api_key: str | None = None
    ai_model: str | None = None
    ai_temperature: float = 0.2
    ai_timeout_seconds: int = 30

    # Razorpay
    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
