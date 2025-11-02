from sqlalchemy.orm import Session
from app.models.user import User
from typing import Optional
import os

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user with username and password"""
        user = db.query(User).filter(User.username == username).first()
        if user and user.verify_password(password):
            return user
        return None
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def create_user(db: Session, username: str, password: str, is_admin: bool = False) -> User:
        """Create a new user"""
        password_hash = User.hash_password(password)
        user = User(
            username=username,
            password_hash=password_hash,
            is_admin=is_admin
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def ensure_root_user_exists(db: Session) -> None:
        """Ensure root user exists, create if not found"""
        root_username = os.getenv("CREDENTIAL_ROOT_USER", "admin")
        root_password = os.getenv("CREDENTIAL_ROOT_PASSWORD", "admin")
        
        print(f"DEBUG: Root username from env: '{root_username}'")
        print(f"DEBUG: Root password from env: '{root_password}'")
        
        # Check if root user already exists
        existing_user = AuthService.get_user_by_username(db, root_username)
        if not existing_user:
            print(f"Creating root user: {root_username}")
            AuthService.create_user(
                db=db, 
                username=root_username, 
                password=root_password, 
                is_admin=True
            )
            print("Root user created successfully")
        else:
            print(f"Root user '{root_username}' already exists")