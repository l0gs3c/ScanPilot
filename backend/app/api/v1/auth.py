from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services.auth_service import AuthService
from app.utils.jwt_utils import create_access_token, verify_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    is_admin: bool

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """User login endpoint"""
    print(f"DEBUG: Login attempt with username: '{login_data.username}'")
    
    # Authenticate user
    user = AuthService.authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        print(f"DEBUG: Authentication failed for username: '{login_data.username}'")
        raise HTTPException(
            status_code=401, 
            detail="Invalid username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=401, 
            detail="User account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "is_admin": user.is_admin}
    )
    
    return LoginResponse(
        access_token=access_token,
        user_id=user.id,
        username=user.username,
        is_admin=user.is_admin
    )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """User logout endpoint"""
    # In a real application, you might want to add the token to a blacklist
    # For now, we just validate the token and return success
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # TODO: Add token to blacklist or invalidate in Redis/Database
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user information"""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = AuthService.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "username": user.username, 
        "user_id": user.id,
        "is_admin": user.is_admin,
        "is_active": user.is_active
    }