#!/usr/bin/env powershell

# ScanPilot Full Application Startup Script

param(
    [switch]$BackendOnly,  # Start backend only
    [switch]$FrontendOnly, # Start frontend only
    [switch]$Setup,        # Force environment setup
    [switch]$Dev           # Development mode
)

Write-Host "🚀 ScanPilot Application Launcher" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Navigate to project root
Set-Location $PSScriptRoot

if ($BackendOnly) {
    Write-Host "🖥️  Starting Backend Only..." -ForegroundColor Yellow
    & ".\backend\start-backend.ps1" $(if($Setup){"-Setup"}) $(if($Dev){"-Dev"})
}
elseif ($FrontendOnly) {
    Write-Host "🌐 Starting Frontend Only..." -ForegroundColor Yellow
    & ".\frontend\start-frontend.ps1" $(if($Setup){"-Setup"})
}
else {
    Write-Host "🔄 Starting Full Application..." -ForegroundColor Yellow
    
    # Start backend in background
    Write-Host "🖥️  Starting Backend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\backend\start-backend.ps1' $(if($Setup){'-Setup'}) $(if($Dev){'-Dev'})"
    
    # Wait a moment for backend to start
    Start-Sleep 3
    
    # Start frontend in background  
    Write-Host "🌐 Starting Frontend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\frontend\start-frontend.ps1' $(if($Setup){'-Setup'})"
    
    Write-Host ""
    Write-Host "✅ ScanPilot is starting up!" -ForegroundColor Green
    Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "📍 Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📖 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Close the PowerShell windows to stop the services" -ForegroundColor Yellow
}