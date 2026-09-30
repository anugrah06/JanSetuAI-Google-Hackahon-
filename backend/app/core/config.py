from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "JanSetu AI"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./jansetu.db"
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Google Cloud Speech-to-Text
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    
    # Demo and Environment
    ENVIRONMENT: str = "development"
    ALLOW_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    
    # Authentication & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jansetu-civic-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Development Seed Credentials (loaded from ENV if provided)
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@jansetu.gov.in")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin@JanSetu2026!")
    CITIZEN_EMAIL: str = os.getenv("CITIZEN_EMAIL", "citizen@jansetu.in")
    CITIZEN_PASSWORD: str = os.getenv("CITIZEN_PASSWORD", "Citizen@JanSetu2026!")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
