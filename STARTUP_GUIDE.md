# ScanPilot Startup Guide

## Default Ports

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## Quick Start Scripts

### Windows

#### Option 1: Clean Start (Recommended)
Automatically kills any processes on ports 8000 and 3000, then starts both services:

**PowerShell:**
```powershell
.\start-clean.ps1
```

**Command Prompt:**
```batch
start-clean.bat
```

**Options:**
- Start backend only: `.\start-clean.ps1 -BackendOnly`
- Start frontend only: `.\start-clean.ps1 -FrontendOnly`

#### Option 2: Standard Start
```powershell
.\start.ps1
```
or
```batch
start.bat
```

### Manual Start

#### Backend Only
```powershell
cd backend
python main.py
```

#### Frontend Only
```powershell
cd frontend
npm run dev
```

## Port Management

### Check Port Usage
```powershell
# Check if ports are in use
Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State
```

### Kill Process on Port
```powershell
# Kill process on port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Configuration Files

### Frontend Port Configuration
Edit `frontend/.env`:
```env
VITE_PORT=3000
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Port Configuration
Edit `backend/app/core/config.py`:
```python
SERVER_HOST: str = "0.0.0.0"
SERVER_PORT: int = 8000
```

## Storage Structure

After the latest updates, scan results are stored in:
```
backend/storage/
├── targets/
│   ├── target_1.json           # Target metadata
│   ├── example.com_80/         # Scan results folder
│   │   ├── nuclei_1.txt
│   │   └── dirsearch_1.txt
│   └── api.test.com_443/       # Another target's results
│       └── subfinder_1.txt
└── uploads/                     # Uploaded files
```

**Format**: `domain_port` (e.g., `example.com_80`, `api.test.com_443`)
- All ports are always included in the folder name
- Target metadata JSON files are in the same directory
- Scan results are organized in subfolders named by domain and port

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. **Use clean start script** (recommended):
   ```powershell
   .\start-clean.ps1
   ```

2. **Or manually kill processes**:
   ```powershell
   # PowerShell
   $ports = @(8000, 3000)
   foreach ($port in $ports) {
       $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
       if ($conn) {
           Stop-Process -Id $conn.OwningProcess -Force
       }
   }
   ```

### Backend Not Starting
1. Ensure you're in the backend directory
2. Check Python is installed: `python --version`
3. Check dependencies: `pip install -r requirements.txt`
4. View logs in the terminal window

### Frontend Not Starting
1. Ensure you're in the frontend directory
2. Check Node.js is installed: `node --version`
3. Install dependencies: `npm install`
4. Clear cache: `npm run dev -- --force`

## Development Tips

- **Backend auto-reload**: Backend uses `uvicorn --reload` for automatic code reloading
- **Frontend HMR**: Frontend uses Vite's Hot Module Replacement for instant updates
- **API Testing**: Use http://localhost:8000/docs for interactive API documentation
- **Environment variables**: Frontend vars must start with `VITE_`

## Stopping Services

1. Close the PowerShell/CMD windows running the services
2. Or press `Ctrl+C` in each terminal
3. Or use the clean start script which automatically handles port cleanup
