@echo off
echo Testing ScanPilot Setup...
echo.

echo Checking Docker...
docker --version
if errorlevel 1 (
    echo Docker is not installed!
    pause
    exit /b 1
)

echo.
echo Copying environment file...
if not exist .env (
    copy .env.example .env
    echo Environment file created. Please edit .env and set your passwords!
) else (
    echo Environment file already exists.
)

echo.
echo Starting development database...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Database should be running on port 5432
echo Redis should be running on port 6379
echo.
echo Next steps:
echo 1. Edit .env file with your settings
echo 2. cd backend && pip install -r requirements.txt
echo 3. cd backend && python main.py
echo 4. In another terminal: cd frontend && npm install && npm run dev
echo.
pause