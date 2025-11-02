@echo off
echo Stopping ScanPilot Development Environment...

echo Stopping development databases...
docker-compose -f docker-compose.dev.yml down

echo.
echo Killing backend and frontend processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo ScanPilot development environment stopped.
pause