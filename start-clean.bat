@echo off
REM ScanPilot Clean Start Script (Windows Batch)
REM Kills any processes on ports 8000 and 3000, then starts the application

echo ==========================================
echo     ScanPilot Clean Startup
echo ==========================================
echo.

echo Checking and freeing ports...
echo.

REM Kill process on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing process on port 8000 (PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process on port 3000 (PID: %%a^)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Ports prepared. Starting services...
echo.

REM Start backend
echo Starting Backend Server (Port 8000^)...
cd /d "%~dp0backend"
start "ScanPilot Backend" cmd /k "python main.py"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Server (Port 3000^)...
cd /d "%~dp0frontend"
start "ScanPilot Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo  ScanPilot is starting up!
echo ==========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ==========================================
echo.
echo Close the CMD windows to stop the services
echo.
pause
