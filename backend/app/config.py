import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Placement Assistant"
    API_V1_STR: str = "/api"
    
    # SECRET_KEY is required in production, optional in development
    @property
    def SECRET_KEY(self) -> str:
        key = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
        env = os.getenv("ENVIRONMENT", "development")
        if env == "production" and key == "dev_secret_key_change_in_production":
            raise ValueError("SECRET_KEY must be explicitly set for production environments")
        return key
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # DB URL: default to local sqlite
    DATABASE_URL: str = Field(default="sqlite:///./placement_assistant.db", env="DATABASE_URL")
    
    # Gemini API Key
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    
    # Chroma settings
    CHROMA_DB_DIR: str = Field(default="./chroma_db", env="CHROMA_DB_DIR")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
