from pydantic_settings import BaseSettings
from typing import List, Union
import os
import json

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "ScanPilot"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"  # Backend server host
    SERVER_PORT: int = 8000        # Backend server port
    
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
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",  # Vite default
        "https://localhost:3000",
        "http://localhost",
        "https://localhost",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:3000"
    ]
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                origins = json.loads(self.BACKEND_CORS_ORIGINS)
            except json.JSONDecodeError:
                origins = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        else:
            origins = self.BACKEND_CORS_ORIGINS
        
        # In development, also allow all localhost/127.0.0.1 origins
        if self.ENVIRONMENT == "development":
            print(f"⚙️  CORS Origins configured: {len(origins)} origins")
            for origin in origins:
                print(f"  - {origin}")
        
        return origins
    
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
    
    # Additional fields from environment
    POSTGRES_PASSWORD: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "ScanPilot"
    BCRYPT_ROUNDS: int = 12
    JWT_ALGORITHM: str = "HS256"
    RATE_LIMIT_PER_MINUTE: int = 100
    WEBSOCKET_PING_INTERVAL: int = 25
    WEBSOCKET_PING_TIMEOUT: int = 20
    
    # Default credentials (change in production!)
    CREDENTIAL_ROOT_USER: str = "admin"
    CREDENTIAL_ROOT_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()