# 🌍 Environment Configuration Guide

Complete guide for configuring ScanPilot across different environments using environment variables.

**Context7 Documentation**: This guide follows best practices from FastAPI Settings Management and Vite Environment Variables patterns.

---

## 📋 Overview

ScanPilot uses environment variables for configuration to enable easy deployment across different environments:
- **Development** - Local development with debug mode
- **Staging** - Pre-production testing
- **Production** - Live deployment

### Key Benefits
- ✅ No hardcoded configurations in code
- ✅ Easy to change settings without code changes
- ✅ Secure credential management
- ✅ Environment-specific configurations
- ✅ Works with Docker and native deployments

---

## 🔧 Backend Configuration (.env)

### Location
Place `.env` file in the **root directory** of the project:
```
ScanPilot/
├── .env                    # Backend environment variables
├── .env.example           # Example configuration (template)
└── backend/
    └── app/
        └── core/
            └── config.py  # Settings class
```

### Configuration Structure

#### 1. Server Configuration
```bash
# Backend API Server
SERVER_HOST=0.0.0.0        # 0.0.0.0 = all interfaces, localhost = local only
SERVER_PORT=8000           # Backend API port
```

**When to change**:
- Use `0.0.0.0` for Docker or production (all network interfaces)
- Use `localhost` or `127.0.0.1` for local development only

#### 2. Application Settings
```bash
PROJECT_NAME=ScanPilot
VERSION=1.0.0
ENVIRONMENT=development    # development | production | staging
DEBUG=True                 # Enable auto-reload and debug logs
API_V1_PREFIX=/api/v1
```

**Environment modes**:
- `development` - Debug mode ON, auto-reload enabled
- `production` - Debug mode OFF, optimized for performance
- `staging` - Testing environment with production-like settings

#### 3. Database Configuration
```bash
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_PASSWORD=secure_password_here
```

**Examples**:
```bash
# Local development
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/scanpilot_dev

# Docker (using service name)
DATABASE_URL=postgresql://scanpilot:password@postgres:5432/scanpilot

# Production (external database)
DATABASE_URL=postgresql://prod_user:strong_pass@db.example.com:5432/scanpilot_prod
```

#### 4. Security Configuration
```bash
SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480   # 8 hours
BCRYPT_ROUNDS=12

# Default admin credentials (MUST change in production!)
CREDENTIAL_ROOT_USER=admin
CREDENTIAL_ROOT_PASSWORD=admin123
```

**Security Best Practices**:
- Generate random SECRET_KEY: `openssl rand -hex 32`
- Use strong passwords in production
- Change default admin credentials immediately
- Never commit .env files to version control

#### 5. CORS Configuration
```bash
# JSON array format
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","https://yourdomain.com"]

# Or comma-separated format
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

**Add your frontend URLs here** to enable cross-origin requests.

### Complete .env Example

See [.env](.env) for the complete configuration file with all available options.

---

## ⚛️ Frontend Configuration (frontend/.env)

### Location
Place `.env` files in the **frontend** directory:
```
ScanPilot/
└── frontend/
    ├── .env                    # Development variables
    ├── .env.production        # Production variables
    └── .env.local            # Local overrides (git-ignored)
```

### Vite Environment Variables

**Important**: All frontend environment variables **must** start with `VITE_` prefix to be exposed to the client code.

#### 1. Backend API Configuration
```bash
# Must match your backend server
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

**Examples**:
```bash
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production
VITE_API_BASE_URL=https://api.yourdomain.com

# Docker internal
VITE_API_BASE_URL=http://backend:8000
```

#### 2. Development Server
```bash
VITE_PORT=3000              # Dev server port (auto-increments if busy)
```

#### 3. Application Settings
```bash
VITE_APP_NAME=ScanPilot
VITE_APP_VERSION=1.0.0
```

#### 4. Feature Flags
```bash
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
```

#### 5. API Timeouts
```bash
VITE_API_TIMEOUT=30000          # 30 seconds
VITE_UPLOAD_TIMEOUT=300000      # 5 minutes
```

#### 6. Development Tools
```bash
VITE_ENABLE_DEV_TOOLS=true     # Redux DevTools, etc.
VITE_LOG_LEVEL=debug            # debug | info | warn | error
```

### Complete frontend/.env Example

See [frontend/.env](frontend/.env) for the complete configuration file.

---

## 🐳 Docker Configuration

### Using .env with Docker Compose

Docker Compose automatically loads `.env` from the project root:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - SERVER_HOST=${SERVER_HOST}
      - SERVER_PORT=${SERVER_PORT}
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
```

### Environment-Specific Compose Files
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml up
```

---

## 📝 How It Works

### Backend (FastAPI + Pydantic Settings)

**1. Settings Class** ([backend/app/core/config.py](backend/app/core/config.py)):
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    SECRET_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()  # Auto-loads from .env
```

**2. Usage in Code** ([backend/main.py](backend/main.py)):
```python
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

uvicorn.run(
    "main:app",
    host=settings.SERVER_HOST,
    port=settings.SERVER_PORT
)
```

### Frontend (Vite Environment Variables)

**1. Config File** ([frontend/src/config/api.ts](frontend/src/config/api.ts)):
```typescript
// Vite exposes VITE_ prefixed variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;
```

**2. Vite Config** ([frontend/vite.config.ts](frontend/vite.config.ts)):
```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    server: {
      port: parseInt(env.VITE_PORT || '3000', 10),
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
        }
      }
    }
  }
})
```

---

## 🚀 Quick Start for Different Environments

### Local Development
```bash
# 1. Copy example file
cp .env.example .env

# 2. Edit .env
# - Set DEBUG=True
# - Use localhost for DATABASE_URL
# - Keep default credentials

# 3. Start services
.\start.ps1
```

### Docker Development
```bash
# Use docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
# 1. Create production .env
# - Set ENVIRONMENT=production
# - Set DEBUG=False
# - Use production DATABASE_URL
# - Change all default credentials
# - Generate new SECRET_KEY

# 2. Create frontend/.env.production
# - Set VITE_API_BASE_URL to production URL
# - Disable dev tools

# 3. Deploy
docker-compose up -d
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Change `CREDENTIAL_ROOT_USER` and `CREDENTIAL_ROOT_PASSWORD`
- [ ] Set `DEBUG=False`
- [ ] Set `ENVIRONMENT=production`
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Update `BACKEND_CORS_ORIGINS` to only allowed domains
- [ ] Never commit `.env` files to git (use `.env.example` as template)
- [ ] Use environment variables in CI/CD instead of .env files
- [ ] Enable HTTPS in production
- [ ] Review all exposed environment variables in frontend (VITE_ prefix)

---

## 📚 References

### Context7 Documentation Used
- **FastAPI Settings**: Pydantic BaseSettings pattern (51KB from /fastapi/fastapi)
- **Vite Environment**: .env files and mode-specific configuration (49KB from /websites/vite_dev)

### Official Documentation
- [FastAPI Settings Management](https://fastapi.tiangolo.com/advanced/settings/)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)

### Related Guides
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication setup
- [VITE_CONFIG.md](VITE_CONFIG.md) - Vite configuration details

---

**Last Updated**: February 23, 2026 with Context7 MCP documentation
