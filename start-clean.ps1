#!/usr/bin/env powershell

# ScanPilot Clean Start Script
# Kills any processes on ports 8000 and 3000, then starts the application

param(
    [switch]$BackendOnly,  # Start backend only
    [switch]$FrontendOnly  # Start frontend only
)

Write-Host "🚀 ScanPilot Clean Startup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on a port
function Stop-PortProcess {
    param([int]$Port)
    
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "🔄 Killing process on port $Port..." -ForegroundColor Yellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Port $Port freed" -ForegroundColor Green
    } else {
        Write-Host "✅ Port $Port is available" -ForegroundColor Green
    }
}

# Navigate to project root
Set-Location $PSScriptRoot

if ($BackendOnly) {
    Write-Host "🖥️  Preparing Backend (Port 8000)..." -ForegroundColor Cyan
    Stop-PortProcess -Port 8000
    Write-Host ""
    Write-Host "🖥️  Starting Backend..." -ForegroundColor Green
    Set-Location ".\backend"
    python main.py
}
elseif ($FrontendOnly) {
    Write-Host "🌐 Preparing Frontend (Port 3000)..." -ForegroundColor Cyan
    Stop-PortProcess -Port 3000
    Write-Host ""
    Write-Host "🌐 Starting Frontend..." -ForegroundColor Green
    Set-Location ".\frontend"
    npm run dev
}
else {
    Write-Host "🔄 Preparing Ports..." -ForegroundColor Cyan
    Stop-PortProcess -Port 8000
    Stop-PortProcess -Port 3000
    Write-Host ""
    
    # Start backend in new window
    Write-Host "🖥️  Starting Backend (Port 8000)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python main.py"
    
    # Wait for backend to start
    Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
    Start-Sleep 3
    
    # Start frontend in new window
    Write-Host "🌐 Starting Frontend (Port 3000)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
    
    Write-Host ""
    Write-Host "✅ ScanPilot is starting up!" -ForegroundColor Green
    Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📍 Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📖 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Note: Close the PowerShell windows to stop the services" -ForegroundColor Yellow
    Write-Host "📝 Tip: Use -BackendOnly or -FrontendOnly to start individual services" -ForegroundColor Yellow
}
