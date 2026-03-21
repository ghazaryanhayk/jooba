from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    crustdata_api_key: str
    openai_api_key: str
    openai_model: str = 'gpt-4o'
    cache_ttl_seconds: int = 600
    cache_max_size: int = 500

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')


settings = Settings()
