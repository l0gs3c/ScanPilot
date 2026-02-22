# Simple ScanPilot Backend for Demo with Authentication
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
import datetime
import uuid
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from passlib.hash import bcrypt

# Security configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(
    title="ScanPilot Demo",
    version="1.0.0",
    description="ScanPilot - Security Scanning Management Platform (Demo Version with Auth)",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for authentication
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    is_admin: bool

class User(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool

# Mock users database
mock_users = {
    "admin": {
        "user_id": 1,
        "username": "admin",
        "email": "admin@scanpilot.local",
        "hashed_password": pwd_context.hash("admin"),  # password: admin
        "is_active": True,
        "is_admin": True,
    },
    "test": {
        "user_id": 2, 
        "username": "test",
        "email": "test@scanpilot.local",
        "hashed_password": pwd_context.hash("test"),  # password: test
        "is_active": True,
        "is_admin": False,
    }
}

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str):
    if username in mock_users:
        return mock_users[username]
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user

# Mock data
mock_targets = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Example Website",
        "host": "example.com", 
        "port": 80,
        "protocol": "http",
        "status": "not_started",
        "created_at": "2026-02-20T10:00:00Z",
        "updated_at": "2026-02-20T10:00:00Z"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002", 
        "name": "Test API",
        "host": "api.test.com",
        "port": 443,
        "protocol": "https", 
        "status": "testing",
        "created_at": "2026-02-21T14:30:00Z",
        "updated_at": "2026-02-21T15:45:00Z"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Local Server",
        "host": "192.168.1.100",
        "port": 8080,
        "protocol": "http",
        "status": "closed", 
        "created_at": "2026-02-22T09:15:00Z",
        "updated_at": "2026-02-22T16:20:00Z"
    }
]

mock_scans = [
    {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "target_id": "550e8400-e29b-41d4-a716-446655440001", 
        "tool_name": "DirSearch",
        "status": "completed",
        "progress": 100,
        "started_at": "2026-02-20T11:00:00Z",
        "completed_at": "2026-02-20T11:15:00Z",
        "results_count": 45
    },
    {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "target_id": "550e8400-e29b-41d4-a716-446655440002",
        "tool_name": "Nmap Port Scan", 
        "status": "running",
        "progress": 65,
        "started_at": "2026-02-21T15:30:00Z",
        "completed_at": None,
        "results_count": 0
    },
    {
        "id": "660e8400-e29b-41d4-a716-446655440003",
        "target_id": "550e8400-e29b-41d4-a716-446655440003",
        "tool_name": "Nikto Web Scan",
        "status": "failed", 
        "progress": 25,
        "started_at": "2026-02-22T10:00:00Z",
        "completed_at": "2026-02-22T10:05:00Z",
        "results_count": 0
    }
]

@app.get("/")
async def root():
    return {
        "message": "Welcome to ScanPilot Demo API",
        "version": "1.0.0",
        "docs": "/docs",
        "auth_required": True
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "auth": "required"}

# Authentication endpoints
@app.post("/api/v1/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    user = authenticate_user(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "user_id": user["user_id"],
            "is_admin": user["is_admin"]
        }, 
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "username": user["username"],
        "is_admin": user["is_admin"]
    }

@app.post("/api/v1/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (in real app, would invalidate token)"""
    return {"message": "Successfully logged out"}

@app.get("/api/v1/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "is_admin": current_user["is_admin"],
        "is_active": current_user["is_active"]
    }

@app.get("/api/v1/targets")
async def get_targets(current_user: dict = Depends(get_current_user)):
    """Get list of targets (protected endpoint)"""
    return {"targets": mock_targets, "total": len(mock_targets)}

@app.get("/api/v1/targets/{target_id}")
async def get_target(target_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific target (protected endpoint)"""
    target = next((t for t in mock_targets if t["id"] == target_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target

@app.post("/api/v1/targets")
async def create_target(target: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Create new target (protected endpoint)"""
    new_target = {
        "id": str(uuid.uuid4()),
        "name": target.get("name"),
        "host": target.get("host"),
        "port": target.get("port", 80),
        "protocol": target.get("protocol", "http"),
        "status": "not_started",
        "created_at": datetime.datetime.now().isoformat() + "Z",
        "updated_at": datetime.datetime.now().isoformat() + "Z",
        "created_by": current_user["username"]
    }
    mock_targets.append(new_target)
    return new_target

@app.get("/api/v1/scans")
async def get_scans(current_user: dict = Depends(get_current_user)):
    """Get list of scans (protected endpoint)"""
    return {"scans": mock_scans, "total": len(mock_scans)}

@app.get("/api/v1/scans/{scan_id}")
async def get_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific scan (protected endpoint)"""
    scan = next((s for s in mock_scans if s["id"] == scan_id), None)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics (protected endpoint)"""
    total_targets = len(mock_targets)
    active_scans = len([s for s in mock_scans if s["status"] == "running"])
    completed_scans = len([s for s in mock_scans if s["status"] == "completed"])
    failed_scans = len([s for s in mock_scans if s["status"] == "failed"])
    
    return {
        "total_targets": total_targets,
        "active_scans": active_scans,
        "completed_scans": completed_scans,
        "failed_scans": failed_scans,
        "recent_scans": mock_scans[:5],
        "user": current_user["username"]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ScanPilot Demo Backend...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000")
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True
    )