@echo off
echo 🚀 ScanPilot Application Launcher
echo =================================

REM Navigate to project directory
cd /d "%~dp0"

REM Start backend in new window
echo 🖥️  Starting Backend...
start "ScanPilot Backend" start-backend.bat

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window  
echo 🌐 Starting Frontend...
start "ScanPilot Frontend" start-frontend.bat

echo.
echo ✅ ScanPilot is starting up!
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo.
echo Close the command windows to stop the services
echo.
pause