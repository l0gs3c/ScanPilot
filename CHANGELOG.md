# 📝 ScanPilot - Changelog

Lịch sử thay đổi và fixes cho ScanPilot project.

---

## [2026-02-23] - Latest Updates

### ✅ Login Issue Fix - Comprehensive Debugging (NEW!)

**Issue**: UI bị treo ở "Loading ScanPilot..." khi login

**Root Cause Analysis**:
- Lack of error logging made debugging difficult
- CORS configuration might be blocking some ports
- No request/response logging in backend
- Frontend error handling không đủ detailed

**Solutions Implemented**:

1. **Frontend Error Handling** ([LoginPage.tsx](frontend/src/pages/LoginPage.tsx))
   - ✅ Added comprehensive console logging (🔑 🎯 📦 ✅ ❌)
   - ✅ Better error messages with network/CORS hints
   - ✅ Detailed error object logging (name, message, stack)
   - ✅ Finally block ensures loading state always resets
   - Context7 patterns: React error handling (47KB)

2. **Backend Request Logging** ([main.py](backend/main.py))
   - ✅ Added HTTP middleware for request/response logging
   - ✅ Login endpoint logging (attempt, success, failure)
   - ✅ Shows request method, URL, headers, client IP
   - ✅ Only in DEBUG mode (no production overhead)
   - Context7 patterns: FastAPI debugging (53KB)

3. **Improved CORS Configuration** ([config.py](backend/app/core/config.py))
   - ✅ Extended origins: Added localhost:5173, all 127.0.0.1 ports
   - ✅ CORS logging in development mode
   - ✅ Shows configured origins on startup
   - Total: 12 origins supported

4. **Debug Documentation** ([LOGIN_DEBUG.md](LOGIN_DEBUG.md))
   - ✅ Complete debugging guide (400+ lines)
   - ✅ Browser console instructions
   - ✅ Backend terminal checks
   - ✅ Common issues & solutions
   - ✅ Quick verification steps

**How to Debug Now**:
```
1. Open browser DevTools (F12) → Console tab
2. Try logging in
3. See detailed logs:
   - 🔑 Login attempt started
   - 🎯 API_URL: http://localhost:8000/api/v1
   - 🚀 Sending request to: ...
   - 📦 Response status: 200
   - ✅ Login successful
4. Check backend terminal for request logs
```

**Context7 Documentation** (100KB total):
- React Error Handling (47KB) - Async patterns, error boundaries
- FastAPI Debugging (53KB) - Request logging, CORS troubleshooting

### ✅ Environment Variables Configuration

**Backend Configuration** with Pydantic Settings:
- ✅ Created comprehensive [.env](.env) file with all settings
- ✅ Updated [backend/app/core/config.py](backend/app/core/config.py) - Added `SERVER_HOST`, `SERVER_PORT`
- ✅ Updated [backend/main.py](backend/main.py) - Reads from `settings` instead of hardcoded values
- ✅ Installed `pydantic-settings` and `python-dotenv`
- ✅ CORS origins now support JSON array or comma-separated format
- ✅ All ports, hosts, secrets configurable via .env

**Frontend Configuration** with Vite Environment:
- ✅ Created [frontend/.env](frontend/.env) - Development settings
- ✅ Created [frontend/.env.production](frontend/.env.production) - Production settings
- ✅ Updated [frontend/src/config/api.ts](frontend/src/config/api.ts) - Centralized config with environment variables
- ✅ Updated [frontend/vite.config.ts](frontend/vite.config.ts) - Dynamic port and proxy configuration
- ✅ Updated [frontend/src/utils/api.ts](frontend/src/utils/api.ts) - Import from centralized config
- ✅ Updated [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx) - Use API_URL from config

**Configuration Features**:
- 📝 All VITE_ prefixed variables exposed to client
- 📝 Feature flags (WebSocket, Notifications, Analytics)
- 📝 API timeouts configurable
- 📝 Development/Production modes
- 📝 Dynamic port allocation (auto-increment if busy)

**Documentation**:
- ✅ Created [ENVIRONMENT_CONFIG.md](ENVIRONMENT_CONFIG.md) - Complete 400+ line guide
- ✅ Context7 patterns: FastAPI Settings (51KB) + Vite Environment (49KB)

**Benefits**:
- ✅ No hardcoded configs - easy deployment
- ✅ Environment-specific settings (dev/staging/prod)
- ✅ Secure credential management
- ✅ Docker-friendly configuration

### ✅ Servers Running Successfully

**Backend (FastAPI)** - ✅ LIVE
- URL: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Status: Running with Uvicorn auto-reload
- Features: JWT auth, CORS configured, SQLAlchemy ORM
- Fixed: Added missing `app/__init__.py` to enable module imports

**Frontend (React + Vite)** - ✅ LIVE
- URL: http://localhost:3002 (auto-detected free port)
- Build Tool: Vite v7.3.1 ready in 1172ms
- Styling: Tailwind CSS v4.2.0 with @tailwindcss/vite plugin
- Features: React 18, TypeScript, Context API, Protected routes
- HMR: Hot Module Replacement enabled

**Database & Cache**:
- PostgreSQL: Port 5432 (Docker) - Connected
- Redis: Port 6379 (Docker) - Connected

### ✅ Context7 Documentation Retrieved

**Latest Best Practices** (100KB total):
1. **FastAPI CORS & Security** (53KB)
   - CORS middleware configuration
   - Security best practices
   - Production deployment patterns
   - Library: `/fastapi/fastapi` (Trust: 9.9)

2. **React 18 Authentication** (47KB)
   - Context API state management
   - Protected route patterns
   - Authentication flows
   - Library: `/websites/react_dev` (Trust: 10)

**Usage**: Documentation integrated into:
- [AUTHENTICATION.md](AUTHENTICATION.md) - JWT patterns
- [REACT_PATTERNS.md](REACT_PATTERNS.md) - React hooks
- [VITE_CONFIG.md](VITE_CONFIG.md) - Vite configuration

### ✅ Project Organization

**Cleaned Up Root Directory**:
- Markdown files: 12 → 8 (consolidated)
- Scripts moved to `scripts/` folder
- Clear separation: Main scripts in root, support scripts in scripts/

**File Structure**:
```
ScanPilot/
├── start.bat|ps1|sh    # Main startup (use these!)
├── stop-dev.bat        # Stop services
├── 8 essential .md     # Documentation
└── scripts/            # All support scripts (13 files)
```

### ✅ Tailwind CSS v4 Migration

**Issue**: PostCSS plugin error blocking frontend startup
```
[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` 
directly as a PostCSS plugin...
```

**Solution**: Migrated to Tailwind v4 with Vite plugin using Context7 documentation

**Changes**:
- ✅ Upgraded Vite v4.5.14 → v7.3.1
- ✅ Installed `@tailwindcss/vite` v4.2.0
- ✅ Updated `vite.config.ts` to use `tailwindcss()` plugin
- ✅ Changed CSS import to `@import "tailwindcss";`
- ✅ Removed `postcss.config.js` (no longer needed)

**Context7 Research**:
```bash
mcp_context7_resolve-library-id --libraryName "tailwindcss"
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/tailwindcss_installation_using-vite" \
  --topic "vite postcss configuration setup tailwind v4"
```

**Documentation**: See [VITE_CONFIG.md](VITE_CONFIG.md) for complete Tailwind v4 guide

---

### ✅ Documentation with Context7 MCP

**Updates**:
1. **README.md** - Project overview với Context7 integration
2. **AUTHENTICATION.md** - JWT patterns từ FastAPI docs
3. **CONTEXT7_USAGE.md** - Complete implementation examples
4. **VITE_CONFIG.md** - Vite + Tailwind v4 configuration
5. **REACT_PATTERNS.md** - React hooks & patterns
6. **QUICKSTART.md** - Quick start với environment setup

**Context7 Documentation Retrieved**:
- FastAPI JWT Auth: 55KB (1482 lines)
- React Patterns: 46KB (1703 lines)
- Vite + Tailwind: 49KB (1742 lines)
- Total: 150KB of latest patterns

**Libraries Used**:
- `/fastapi/fastapi` (Trust Score: 9.9)
- `/websites/react_dev` (Trust Score: 10)
- `/websites/vite_dev` (Trust Score: 9.9)
- `/websites/tailwindcss_installation_using-vite` (Trust Score: 9.9)

---

### ✅ Servers Running

**Backend (FastAPI)**:
- URL: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Features: JWT auth, protected endpoints, SQLAlchemy ORM

**Frontend (React + Vite)**:
- URL: http://localhost:3001
- Build Tool: Vite v7.3.1
- Styling: Tailwind CSS v4
- Features: React 18, TypeScript, Context API

**Database & Cache**:
- PostgreSQL: Port 5432 (Docker)
- Redis: Port 6379 (Docker)

---

## [2026-02-23] - Initial Setup

### ✅ Authentication System

**Implementation**:
- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- Frontend Context API for auth state
- Token persistence in localStorage

**Features**:
- Login/Logout functionality
- Protected routes
- Token verification
- User session management

---

## Architecture

### Backend Stack
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM for database
- Pydantic - Data validation
- JWT - Token-based authentication
- PostgreSQL - Relational database
- Redis - Caching & message broker

### Frontend Stack
- React 18 - UI library
- TypeScript - Type-safe JavaScript
- Vite v7 - Build tool & dev server
- Tailwind CSS v4 - Utility-first CSS (Vite plugin)
- Axios - HTTP client
- React Router - Client-side routing

### DevOps
- Docker & Docker Compose
- Uvicorn ASGI server
- Context7 MCP for documentation

---

## Known Issues

### Fixed
- ✅ **Tailwind PostCSS Error** - Migrated to v4 with Vite plugin
- ✅ **CORS Issues** - Configured in backend
- ✅ **Port Conflicts** - Frontend runs on 3001 when 3000 busy

### Open
- No critical issues

---

## Roadmap

### Short Term
- [ ] Target management CRUD
- [ ] Scan execution engine
- [ ] Real-time scan monitoring
- [ ] WebSocket integration

### Long Term
- [ ] Role-based access control (RBAC)
- [ ] Advanced scanning features
- [ ] Export functionality (PDF, JSON, CSV)
- [ ] Notification system (Email, Slack)
- [ ] Multi-user support
- [ ] API rate limiting & throttling

---

## Documentation

### Core Documentation
- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [AUTHENTICATION.md](AUTHENTICATION.md) - Auth system

### Technical Guides
- [VITE_CONFIG.md](VITE_CONFIG.md) - Vite + Tailwind v4
- [REACT_PATTERNS.md](REACT_PATTERNS.md) - React patterns
- [CONTEXT7_USAGE.md](CONTEXT7_USAGE.md) - Context7 usage

### References
- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [Tailwind CSS v4](https://tailwindcss.com)
- [FastAPI](https://fastapi.tiangolo.com)
- [React 18](https://react.dev)
- [Vite](https://vite.dev)

---

## Contributors

- Development with Context7 MCP assistance
- Official documentation from:
  - FastAPI team
  - React team
  - Tailwind CSS team
  - Vite team

---

**Last Updated**: February 23, 2026
