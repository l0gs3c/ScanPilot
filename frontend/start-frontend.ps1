#!/usr/bin/env powershell

# ScanPilot Frontend Startup Script

param(
    [switch]$Setup,  # Force npm install
    [switch]$Build   # Build for production
)

Write-Host "Starting ScanPilot Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location $PSScriptRoot

# Check if node_modules exists or setup requested
$needsSetup = -not (Test-Path "node_modules") -or $Setup

if ($needsSetup) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencies installed" -ForegroundColor Green
}

if ($Build) {
    Write-Host "Building for production..." -ForegroundColor Yellow
    npm run build
} else {
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    npm run dev
}