# ScanPilot Environment Configuration

## Overview
This document explains how to configure ScanPilot's environment variables for different deployment scenarios.

## Environment Variables

### Root .env file (d:\Work\tools\ScanPilot\.env)

#### Server Configuration
```bash
# Server Configuration
BACKEND_HOST=localhost        # Backend server host
BACKEND_PORT=8002            # Backend server port
FRONTEND_HOST=localhost      # Frontend server host  
FRONTEND_PORT=3000          # Frontend server port
```

#### CORS Configuration
```bash
# CORS Configuration - Add your frontend URLs here
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","https://localhost:3000","http://localhost","https://localhost"]
```

### Frontend .env file (d:\Work\tools\ScanPilot\frontend\.env)

```bash
# Frontend Configuration
VITE_BACKEND_HOST=localhost  # Must match BACKEND_HOST in root .env
VITE_BACKEND_PORT=8002      # Must match BACKEND_PORT in root .env

# Development Configuration
VITE_DEV_PORT=3000          # Frontend development server port
```

## Configuration Examples

### Local Development
```bash
# Root .env
BACKEND_HOST=localhost
BACKEND_PORT=8002
FRONTEND_HOST=localhost
FRONTEND_PORT=3000

# frontend/.env  
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=8002
VITE_DEV_PORT=3000
```

### Production Server
```bash
# Root .env
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_HOST=your-domain.com
FRONTEND_PORT=80

# frontend/.env
VITE_BACKEND_HOST=your-domain.com
VITE_BACKEND_PORT=8000
VITE_DEV_PORT=3000
```

### Docker Deployment
```bash
# Root .env
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8002
FRONTEND_HOST=scanpilot-frontend
FRONTEND_PORT=3000

# frontend/.env
VITE_BACKEND_HOST=scanpilot-backend
VITE_BACKEND_PORT=8002
VITE_DEV_PORT=3000
```

## Quick Start Scripts

### Windows
```bash
# Start both servers
.\start.bat

# Or manually:
cd backend && python main.py
cd frontend && npm run dev
```

### Linux/Mac
```bash
# Start both servers
chmod +x start.sh
./start.sh

# Or manually:
cd backend && python main.py &
cd frontend && npm run dev
```

## Changing Environment

To change from localhost to a different domain/IP:

1. **Update root .env file**:
   ```bash
   BACKEND_HOST=192.168.1.100
   BACKEND_PORT=8002
   ```

2. **Update frontend/.env file**:
   ```bash
   VITE_BACKEND_HOST=192.168.1.100
   VITE_BACKEND_PORT=8002
   ```

3. **Update CORS origins** in root .env:
   ```bash
   BACKEND_CORS_ORIGINS=["http://192.168.1.100:3000","https://192.168.1.100:3000"]
   ```

4. **Restart both servers** for changes to take effect.

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. Change ports in both .env files
2. Make sure BACKEND_PORT and VITE_BACKEND_PORT match
3. Update CORS origins if necessary

### CORS Errors  
If you get CORS errors:
1. Add your frontend URL to BACKEND_CORS_ORIGINS
2. Make sure the URL format matches exactly (http/https, port numbers)
3. Restart backend server

### Can't Connect to Backend
1. Verify VITE_BACKEND_HOST and VITE_BACKEND_PORT in frontend/.env
2. Check if backend server is running on specified host:port
3. Test backend directly: http://BACKEND_HOST:BACKEND_PORT/health