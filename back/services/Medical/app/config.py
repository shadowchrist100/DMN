from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Medical Service"
    database_url: str 
    api_secret: str = ""
    internal_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
