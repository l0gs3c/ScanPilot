from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.base import Base
from app.services.auth_service import AuthService
import os
from typing import Generator
from dotenv import load_dotenv

# Load environment variables
load_dotenv("../../.env")

# Database URL - use SQLite for now
DATABASE_URL = "sqlite:///./scanpilot.db"
print(f"DEBUG: DATABASE_URL = {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """Initialize database - create tables and root user"""
    print("Initializing database...")
    
    # Import all models to ensure table creation
    from app.models import User, Target, Scan
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
    
    # Create root user if not exists
    db = SessionLocal()
    try:
        AuthService.ensure_root_user_exists(db)
    finally:
        db.close()
    
    print("Database initialization completed")