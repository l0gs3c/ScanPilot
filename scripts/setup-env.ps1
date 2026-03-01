#!/usr/bin/env powershell

# ScanPilot Environment Setup Script
# This script ensures all dependencies are installed and environment is ready

Write-Host "🚀 Setting up ScanPilot environment..." -ForegroundColor Cyan

# Navigate to project root
Set-Location $PSScriptRoot

# Check if virtual environment exists
if (Test-Path ".venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Check if activation worked
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Virtual environment activated: $env:VIRTUAL_ENV" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Upgrade pip first
Write-Host "📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
python -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install some packages, trying core packages only..." -ForegroundColor Yellow
    
    # Install core packages that usually work
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
}

# Verify installation by trying to import key modules
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
$testScript = @"
try:
    import fastapi
    import uvicorn
    import sqlalchemy
    print('✅ All core modules imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"@

$testScript | python
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Module verification failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment setup complete!" -ForegroundColor Green
Write-Host "🚀 You can now start the backend with: python main.py" -ForegroundColor Cyan