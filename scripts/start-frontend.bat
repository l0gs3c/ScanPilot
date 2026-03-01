@echo off
title ScanPilot Frontend Server

REM Navigate to frontend directory
cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing npm dependencies...
    npm install
)

REM Start frontend
echo.
echo 🌐 Starting ScanPilot Frontend...
echo 📍 Frontend URL: http://localhost:3000
echo ⏹️  Press Ctrl+C to stop
echo.

npm run dev