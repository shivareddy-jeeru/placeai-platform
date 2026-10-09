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
    
    # DB URL: default to local sqlite, but support Vercel Postgres natively
    @property
    def DATABASE_URL_COMPUTED(self) -> str:
        # Check standard DATABASE_URL first
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            # Fallback to Vercel Postgres automatically
            db_url = os.getenv("POSTGRES_URL", "sqlite:///./placement_assistant.db")
        
        # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return db_url
    
    # API Keys
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    
    # Chroma settings
    CHROMA_DB_DIR: str = Field(default="./chroma_db", env="CHROMA_DB_DIR")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
