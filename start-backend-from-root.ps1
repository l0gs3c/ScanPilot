# Start backend from project root (required for relative paths to work)
# This ensures all relative paths like "storage/targets/targets.json" work correctly

Write-Host "=== ScanPilot Backend Startup ===" -ForegroundColor Cyan
Write-Host "Note: Backend MUST run from project root for relative paths to work" -ForegroundColor Yellow

# Ensure we're in project root
$currentDir = Get-Location
if ($currentDir.Path -notmatch "ScanPilot$") {
    if (Test-Path "backend\main.py") {
        Write-Host "✓ Already in project root" -ForegroundColor Green
    } else {
        Write-Host "✗ Not in project root! Please cd to ScanPilot folder first" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nStarting backend server..." -ForegroundColor Cyan
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Gray

# Start backend with Python from project root
# Using -m flag to run as module while keeping cwd as project root
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
