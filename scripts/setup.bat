@echo off
echo Starting ScanPilot Setup for Windows...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not available
    echo Please ensure Docker Desktop is running
    pause
    exit /b 1
)

echo Docker is available!

REM Copy environment file if it doesn't exist
if not exist .env (
    echo Creating environment configuration...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and update the configuration values
    echo Especially change SECRET_KEY and database passwords!
    echo.
)

REM Create necessary directories
echo Creating directories...
if not exist "backend\logs" mkdir "backend\logs"
if not exist "storage\targets" mkdir "storage\targets"
if not exist "storage\uploads" mkdir "storage\uploads"

REM Pull required Docker images
echo Pulling Docker images...
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull nginx:alpine

REM Build and start services
echo Building and starting ScanPilot services...
docker compose up -d --build

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 >nul

REM Check if services are running
docker compose ps

echo.
echo ScanPilot setup completed!
echo.
echo Services:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Documentation: http://localhost:8000/docs
echo.
echo To stop services: docker compose down
echo To view logs: docker compose logs -f
echo.
pause