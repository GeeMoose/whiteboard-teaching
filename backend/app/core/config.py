from pydantic_settings import BaseSettings
from typing import List, Optional
from decouple import config


class Settings(BaseSettings):
    PROJECT_NAME: str = "Whiteboard Teaching AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Database
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./whiteboard_teaching.db")
    
    # Redis
    REDIS_URL: str = config("REDIS_URL", default="redis://localhost:6379")
    
    # LLM APIs
    OPENAI_API_KEY: Optional[str] = config("OPENAI_API_KEY", default=None)
    ANTHROPIC_API_KEY: Optional[str] = config("ANTHROPIC_API_KEY", default=None)
    GOOGLE_API_KEY: Optional[str] = config("GOOGLE_API_KEY", default=None)
    
    # Animation settings
    ANIMATION_OUTPUT_DIR: str = config("ANIMATION_OUTPUT_DIR", default="./animations")
    MAX_ANIMATION_DURATION: int = config("MAX_ANIMATION_DURATION", default=300, cast=int)
    
    # Security
    SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        case_sensitive = True


settings = Settings()