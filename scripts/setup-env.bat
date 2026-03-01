@echo off
echo 🚀 Setting up ScanPilot environment...

REM Navigate to project directory
cd /d "%~dp0"

REM Check if virtual environment exists
if exist ".venv\" (
    echo ✅ Virtual environment found
) else (
    echo 📦 Creating virtual environment...
    python -m venv .venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

REM Install core packages
echo 📦 Installing core packages...
python -m pip install fastapi uvicorn sqlalchemy python-jose python-multipart bcrypt python-dotenv pydantic-settings passlib

REM Try full requirements
echo 📦 Installing full requirements...
cd backend
python -m pip install -r requirements.txt

REM Verify installation  
echo 🔍 Verifying installation...
python -c "import fastapi, uvicorn, sqlalchemy; print('✅ All modules imported successfully')"

echo.
echo ✅ Environment setup complete!
echo 🚀 You can now start the backend with: python main.py
echo.
pause