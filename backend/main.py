from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
# Try multiple possible paths for .env file
env_paths = [
    "../.env",
    "../../.env", 
    ".env",
    os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
]

for env_path in env_paths:
    if os.path.exists(env_path):
        print(f"Loading .env from: {env_path}")
        load_dotenv(env_path)
        break
else:
    print("No .env file found, using default values")

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.api.v1 import auth, targets, scans, wildcards, websocket, templates
from app.database import init_db

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ScanPilot - Security Scanning Management Platform",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and create root user on startup"""
    init_db()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["authentication"])
app.include_router(targets.router, prefix=f"{settings.API_V1_PREFIX}/targets", tags=["targets"])
app.include_router(scans.router, prefix=f"{settings.API_V1_PREFIX}/scans", tags=["scans"])
app.include_router(wildcards.router, prefix=f"{settings.API_V1_PREFIX}/wildcards", tags=["wildcards"])
app.include_router(templates.router, prefix=f"{settings.API_V1_PREFIX}/templates", tags=["templates"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])

# Static files
if os.path.exists("storage"):
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")

@app.get("/")
async def root():
    return {
        "message": "Welcome to ScanPilot API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True if settings.ENVIRONMENT == "development" else False
    )