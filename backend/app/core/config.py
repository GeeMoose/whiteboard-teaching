from pydantic_settings import BaseSettings
from typing import List, Optional
from decouple import config


class Settings(BaseSettings):
    # Project Settings
    PROJECT_NAME: str = config("PROJECT_NAME", default="Whiteboard Teaching AI")
    VERSION: str = config("VERSION", default="1.0.0")
    API_V1_STR: str = config("API_V1_STR", default="/api/v1")
    
    # Server Settings
    HOST: str = config("HOST", default="0.0.0.0")
    PORT: int = config("PORT", default=8000, cast=int)
    RELOAD: bool = config("RELOAD", default=True, cast=bool)
    LOG_LEVEL: str = config("LOG_LEVEL", default="info")
    
    # CORS
    ALLOWED_HOSTS: List[str] = config("ALLOWED_HOSTS", default="http://localhost:3000,http://127.0.0.1:3000", cast=lambda v: [host.strip() for host in v.split(',')])
    
    # Database
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./whiteboard_teaching.db")
    
    # Redis
    REDIS_URL: str = config("REDIS_URL", default="redis://localhost:6379")
    
    # Unified LLM API
    UNIFIED_LLM_API_KEY: str = config("UNIFIED_LLM_API_KEY", default="")
    UNIFIED_LLM_BASE_URL: str = config("UNIFIED_LLM_BASE_URL", default="")
    UNIFIED_LLM_DEFAULT_MODEL: str = config("UNIFIED_LLM_DEFAULT_MODEL", default="")
    
    # Legacy LLM APIs (deprecated - use UNIFIED_LLM_API_KEY instead)
    OPENAI_API_KEY: Optional[str] = config("OPENAI_API_KEY", default=None)
    ANTHROPIC_API_KEY: Optional[str] = config("ANTHROPIC_API_KEY", default=None)
    GOOGLE_API_KEY: Optional[str] = config("GOOGLE_API_KEY", default=None)
    
    # Animation settings
    ANIMATION_OUTPUT_DIR: str = config("ANIMATION_OUTPUT_DIR", default="./animations")
    MAX_ANIMATION_DURATION: int = config("MAX_ANIMATION_DURATION", default=300, cast=int)
    
    # Security
    SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-change-in-production")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    # Docker Settings
    DOCKER_EXPOSE_PORT: int = config("DOCKER_EXPOSE_PORT", default=8000, cast=int)
    
    # LLM Service Settings
    LLM_TIMEOUT: float = config("LLM_TIMEOUT", default=60.0, cast=float)
    LLM_TEMPERATURE: float = config("LLM_TEMPERATURE", default=0.7, cast=float)
    LLM_MAX_TOKENS: int = config("LLM_MAX_TOKENS", default=1500, cast=int)
    
    # API Response Messages
    API_ROOT_MESSAGE: str = config("API_ROOT_MESSAGE", default="Whiteboard Teaching AI API")
    API_HEALTH_MESSAGE: str = config("API_HEALTH_MESSAGE", default="healthy")
    
    # System Messages
    LLM_SYSTEM_MESSAGE: str = config("LLM_SYSTEM_MESSAGE", default="You are a helpful assistant.")
    
    # Static Files
    STATIC_DIR: str = config("STATIC_DIR", default="static")
    STATIC_MOUNT_PATH: str = config("STATIC_MOUNT_PATH", default="/static")
    
    class Config:
        case_sensitive = True


settings = Settings()