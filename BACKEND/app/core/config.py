import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Database URL by default
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./duolingo.db")
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEFAULT_USER_ID: int = int(os.getenv("DEFAULT_USER_ID", "1"))

settings = Settings()
