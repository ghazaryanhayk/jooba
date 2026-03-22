from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    crustdata_api_key: str
    openai_api_key: str
    openai_model: str = 'gpt-4o'
    cache_ttl_seconds: int = 600
    cache_max_size: int = 500
    database_url: str = 'postgresql+asyncpg://jooba:jooba@db:5432/jooba'

    @field_validator('database_url', mode='before')
    @classmethod
    def ensure_async_scheme(cls, v: str) -> str:
        if v.startswith('postgresql://'):
            return v.replace('postgresql://', 'postgresql+asyncpg://', 1)
        return v

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')


settings = Settings()
