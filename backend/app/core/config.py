from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "ScanPilot"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://dev_user:dev_pass@localhost:5432/scanpilot_dev"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost",
        "https://localhost",
        "http://127.0.0.1:3000",
        "https://127.0.0.1:3000"
    ]
    
    # Storage
    STORAGE_PATH: str = "/app/storage"
    UPLOAD_MAX_SIZE: str = "100MB"
    
    # Tools
    TOOLS_PATH: str = "/app/tools"
    MAX_CONCURRENT_SCANS: int = 5
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "/app/logs/scanpilot.log"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Server Configuration
    BACKEND_HOST: str = "localhost"
    BACKEND_PORT: int = 8002
    FRONTEND_HOST: str = "localhost"
    FRONTEND_PORT: int = 3000
    
    # Additional fields from environment
    POSTGRES_PASSWORD: str = ""
    SMTP_PORT: int = 587
    EMAILS_FROM_NAME: str = "ScanPilot"
    BCRYPT_ROUNDS: int = 12
    JWT_ALGORITHM: str = "HS256"
    RATE_LIMIT_PER_MINUTE: int = 100
    WEBSOCKET_PING_INTERVAL: int = 20
    WEBSOCKET_PING_TIMEOUT: int = 20
    CREDENTIAL_ROOT_USER: str = "l0gs3c"
    CREDENTIAL_ROOT_PASSWORD: str = "l0gs3c"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()