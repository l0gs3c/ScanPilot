@echo off
echo Starting ScanPilot Development Environment...
echo.

echo Step 1: Starting databases...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Step 2: Starting Backend (Port 8000)...
start "ScanPilot Backend" cmd /k "cd backend && python main.py"

echo.
echo Step 3: Starting Frontend (Port 3000)...
start "ScanPilot Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ScanPilot is starting up!
echo.
echo Services will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
echo Login credentials: admin / admin123
echo.
timeout /t 5
start http://localhost:3000

pause