from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Meditrib"
    API_V1_STR: str = "/api/v1"

    # DATABASE
    DATABASE_URL: str = "sqlite:///./meditrib.db"

    # SECURITY (these map to your existing .env variables)
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_CHANGE_ME_IN_PROD"
    JWT_SECRET_KEY: str = ""  # From your existing .env
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Server
    PORT: int = 8000

    # CORS
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:80",
        "http://localhost:8080",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"  # Ignore extra env vars not defined here
    )


settings = Settings()
