@echo off
echo Starting ScanPilot Backend and Frontend...
echo.

REM Set environment
set NODE_ENV=development

REM Start backend in background
echo Starting Backend Server...
cd /d "%~dp0backend"
start "ScanPilot Backend" cmd /k "python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Server...
cd /d "%~dp0frontend"
start "ScanPilot Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause