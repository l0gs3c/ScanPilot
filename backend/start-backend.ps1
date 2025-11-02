#!/usr/bin/env powershell

# ScanPilot Backend Startup Script
# This script ensures environment is ready and starts the backend

param(
    [switch]$Setup,  # Force environment setup
    [switch]$Dev     # Development mode with auto-reload
)

Write-Host "Starting ScanPilot Backend..." -ForegroundColor Cyan

# Navigate to project root
$projectRoot = Split-Path $PSScriptRoot
Set-Location $projectRoot

# Check if setup is needed or requested
$needsSetup = -not (Test-Path ".venv") -or $Setup

if ($needsSetup) {
    Write-Host "Setting up environment..." -ForegroundColor Yellow
    & ".\setup-env.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Environment setup failed" -ForegroundColor Red
        exit 1
    }
} else {
    # Just activate existing environment
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\.venv\Scripts\Activate.ps1"
}

# Navigate to backend directory
Set-Location backend

# Quick dependency check
Write-Host "Checking dependencies..." -ForegroundColor Yellow
python -c "import fastapi, uvicorn, sqlalchemy" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependencies missing, running setup..." -ForegroundColor Yellow
    Set-Location ..
    & ".\setup-env.ps1"
    Set-Location backend
}

# Start the backend
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Backend URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

if ($Dev) {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} else {
    python main.py
}