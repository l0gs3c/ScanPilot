@echo off
title ScanPilot Backend Server

REM Navigate to project directory
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist ".venv\" (
    echo ❌ Virtual environment not found. Running setup...
    call setup-env.bat
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Navigate to backend
cd backend

REM Quick dependency check
echo 🔍 Checking dependencies...
python -c "import fastapi, uvicorn, sqlalchemy" 2>nul
if errorlevel 1 (
    echo ❌ Dependencies missing. Please run setup-env.bat first
    pause
    exit /b 1
)

REM Start backend
echo.
echo 🚀 Starting ScanPilot Backend...
echo 📍 Backend URL: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs  
echo ⏹️  Press Ctrl+C to stop
echo.

python main.py