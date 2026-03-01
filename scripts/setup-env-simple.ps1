# ScanPilot Environment Setup Script

Write-Host "🚀 Setting up ScanPilot environment..." -ForegroundColor Cyan

# Navigate to project root
Set-Location $PSScriptRoot

# Check if virtual environment exists
if (Test-Path ".venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Upgrade pip first
Write-Host "📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install core packages
Write-Host "📦 Installing core packages..." -ForegroundColor Yellow
$corePackages = @(
    "fastapi",
    "uvicorn", 
    "sqlalchemy",
    "python-jose",
    "python-multipart", 
    "bcrypt",
    "python-dotenv",
    "pydantic-settings",
    "passlib"
)

foreach ($package in $corePackages) {
    Write-Host "Installing $package..." -ForegroundColor Yellow
    python -m pip install $package
}

# Try to install full requirements
Write-Host "📦 Installing full requirements..." -ForegroundColor Yellow
Set-Location backend
python -m pip install -r requirements.txt 2>$null

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
python -c "import fastapi, uvicorn, sqlalchemy; print('✅ All modules imported successfully')"

Write-Host "✅ Environment setup complete!" -ForegroundColor Green
Write-Host "🚀 You can now start the backend with: python main.py" -ForegroundColor Cyan