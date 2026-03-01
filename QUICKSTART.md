# ScanPilot - Quick Start Guide

## 🚀 One-Click Startup

### Start Everything (Recommended)
```powershell
.\start.ps1
```

### Start Individual Services
```powershell
# Backend only
.\start.ps1 -BackendOnly

# Frontend only  
.\start.ps1 -FrontendOnly

# Force environment setup
.\start.ps1 -Setup

# Development mode with auto-reload
.\start.ps1 -Dev
```

## 🔧 Manual Setup (if needed)

### Environment Setup
```powershell
# Setup virtual environment and install dependencies
.\setup-env.ps1
```

### Backend
```powershell
cd backend
.\start-backend.ps1

# With setup
.\start-backend.ps1 -Setup

# Development mode
.\start-backend.ps1 -Dev
```

### Frontend
```powershell
cd frontend  
.\start-frontend.ps1

# With npm install
.\start-frontend.ps1 -Setup

# Build for production
.\start-frontend.ps1 -Build
```

## 🚀 Even Simpler - Batch Files

### Windows Users (Recommended)
```batch
# From root directory - Simple workflow
start.bat              # Start everything
stop-dev.bat           # Stop all services

# Advanced - Use scripts from scripts/ folder
.\scripts\setup-env.bat       # Setup environment once
.\scripts\start-all.bat       # Start everything
.\scripts\start-backend.bat   # Backend only
.\scripts\start-frontend.bat  # Frontend only
```

**Note**: Để đơn giản, chỉ cần dùng `start.bat` và `stop-dev.bat` từ root directory. Các script khác trong `scripts/` folder dành cho advanced users.

## 🌐 Truy cập ứng dụng

### ✅ Servers đang chạy (Last Updated: Feb 23, 2026)
- **Frontend**: http://localhost:3000 ✅ LIVE
  - Vite v7.3.1 dev server với HMR
  - Tailwind CSS v4.2.0 - @tailwindcss/vite plugin
  - Configuration: `frontend/.env` (VITE_ prefix)
  - Auto-reload khi có thay đổi code
  
- **Backend API**: http://localhost:8000 ✅ LIVE
  - FastAPI với Pydantic Settings
  - Configuration: `.env` in root directory
  - JWT authentication enabled
  - SQLAlchemy ORM with PostgreSQL
  - Auto-reload in development mode
  
- **API Documentation**: http://localhost:8000/docs
  - Swagger UI - Interactive API testing
  - Tự động generated từ FastAPI schemas
  
- **Alternative API Docs**: http://localhost:8000/redoc
  - ReDoc UI - Alternative documentation view
  - Clean & professional interface
  
- **Database**: PostgreSQL:5432
  - Chạy trong Docker container
  - Persistent storage với volumes
  
- **Cache**: Redis:6379
  - Chạy trong Docker container
  - Session storage và caching

### ⚙️ Environment Configuration

**All configurations are now loaded from environment variables!**

**Backend** (`.env` in root directory):
```bash
SERVER_HOST=0.0.0.0        # Backend host
SERVER_PORT=8000           # Backend port
ENVIRONMENT=development    # development | production
DEBUG=True                 # Enable auto-reload
SECRET_KEY=...            # JWT secret
DATABASE_URL=...          # PostgreSQL connection
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_BASE_URL=http://localhost:8000  # Backend URL
VITE_PORT=3000                           # Frontend port
VITE_ENABLE_WEBSOCKET=true              # Feature flags
```

**See [ENVIRONMENT_CONFIG.md](ENVIRONMENT_CONFIG.md) for complete configuration guide.**

**Note**: Ports có thể thay đổi nếu port đã bị sử dụng (Frontend: 3000→3001→3002)

### 🔍 Kiểm tra Server Status
```powershell
# Check backend
curl http://localhost:8000/

# Check API health
curl http://localhost:8000/api/v1/health

# Check frontend
curl http://localhost:3000/

# Check database connection
docker ps | grep postgres

# Check Redis status
docker ps | grep redis
```

## 🔐 Thông tin đăng nhập

- **Username**: `admin`
- **Password**: `admin123`

## ✅ Tính năng đã hoạt động

- [x] 🐳 Docker containers (PostgreSQL + Redis)
- [x] 🐍 FastAPI Backend server
- [x] ⚛️ React Frontend với Vite  
- [x] 🎨 Tailwind CSS styling
- [x] 🔐 Login/Authentication system
- [x] 📊 Dashboard cơ bản
- [x] 🎯 Navigation menu
- [x] 📱 Responsive design
- [x] 🚀 API endpoints cơ bản

## 🛠️ Tools tích hợp sẵn

- **DirSearch**: Directory brute-force tool
- Có thể thêm nhiều tools khác vào thư mục `/tools`

## 📁 Cấu trúc project

```
ScanPilot/
├── 🚀 start.ps1             # PowerShell startup (Main - Use this!)
├── 🚀 start.bat             # Batch startup (Main - Use this!)
├── 🚀 start.sh              # Linux/Mac startup
├── 🛑 stop-dev.bat          # Stop all services
├── 📋 docker-compose.yml    # Production Docker compose
├── 📋 docker-compose.dev.yml # Development Docker compose
│
├── 📜 scripts/              # Support scripts & utilities
│   ├── setup-env.ps1       # Environment setup
│   ├── start-all.bat       # Alternative starter
│   ├── start-backend.bat   # Backend only
│   ├── start-frontend.bat  # Frontend only
│   ├── check_db.py         # Database checker
│   ├── test_*.py           # Test scripts
│   └── README.md           # Scripts documentation
│
├── ⚛️ frontend/             # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # Context providers (Auth, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functions
│   ├── vite.config.ts      # Vite configuration
│   └── package.json        # Node dependencies
│
├── 🐍 backend/              # FastAPI + Python
│   ├── app/
│   │   ├── api/            # API endpoints (v1, v2)
│   │   ├── core/           # Config & dependencies
│   │   ├── crud/           # Database operations
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
│
├── 🛠️ tools/               # Security scanning tools
│   ├── dirsearch-0.4.3/    # Directory brute-force
│   ├── nuclei/             # Vulnerability scanner (future)
│   └── subfinder/          # Subdomain discovery (future)
│
├── 📚 Documentation/
│   ├── README.md           # Project overview
│   ├── QUICKSTART.md       # This file
│   ├── AUTHENTICATION.md   # Auth system guide
│   ├── CONTEXT7_USAGE.md   # Context7 MCP usage
│   ├── VITE_CONFIG.md      # Vite configuration guide
│   ├── REACT_PATTERNS.md   # React patterns & hooks
│   └── ENVIRONMENT.md      # Environment setup
│
└── 🐳 docker/              # Docker configurations
    ├── backend.Dockerfile  # Backend container
    ├── frontend.Dockerfile # Frontend container
    └── nginx.conf          # Nginx reverse proxy
```

## 🔧 Cấu hình môi trường

File `.env` đã được tạo với cấu hình mặc định:
- Database: PostgreSQL 
- Cache: Redis
- JWT Secret: Đã được set
- CORS: Đã cho phép localhost:3000

## 📈 Tính năng sắp tới

- [ ] 🎯 Target management (CRUD)
- [ ] 🔍 Scan execution engine  
- [ ] 📊 Real-time scan monitoring
- [ ] 📁 File upload/download
- [ ] 📋 Scan history & results
- [ ] 🔔 Notifications
- [ ] 👥 User management
- [ ] 🛡️ Advanced security features

## 🐛 Troubleshooting

### Backend không khởi chạy
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend báo lỗi
```bash
cd frontend  
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🌍 Environment Configuration

### Environment Variables

#### Root .env file
```bash
# Server Configuration
BACKEND_HOST=localhost        # Backend server host
BACKEND_PORT=8000            # Backend server port
FRONTEND_HOST=localhost      # Frontend server host  
FRONTEND_PORT=3000          # Frontend server port

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","https://localhost:3000"]
```

#### Frontend .env file (frontend/.env)
```bash
# Frontend Configuration
VITE_BACKEND_HOST=localhost  # Must match BACKEND_HOST in root .env
VITE_BACKEND_PORT=8000      # Must match BACKEND_PORT in root .env
VITE_DEV_PORT=3000          # Frontend development server port
```

### Configuration Examples

#### Local Development
```bash
# Root .env
BACKEND_HOST=localhost
BACKEND_PORT=8000
FRONTEND_PORT=3000

# frontend/.env  
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=8000
```

#### Production Server
```bash
# Root .env
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_HOST=your-domain.com

# frontend/.env
VITE_BACKEND_HOST=your-domain.com
VITE_BACKEND_PORT=8000
```

### Changing Environment

To change from localhost to different domain/IP:

1. **Update root .env**: Change `BACKEND_HOST` and `BACKEND_PORT`
2. **Update frontend/.env**: Change `VITE_BACKEND_HOST` and `VITE_BACKEND_PORT`
3. **Update CORS origins**: Add your frontend URL to `BACKEND_CORS_ORIGINS`
4. **Restart servers** for changes to take effect

### Environment Troubleshooting

#### Port Already in Use
- Change ports in both .env files
- Ensure BACKEND_PORT and VITE_BACKEND_PORT match
- Update CORS origins if necessary

#### CORS Errors
- Add your frontend URL to BACKEND_CORS_ORIGINS
- Verify URL format matches exactly (http/https, port)
- Restart backend server

#### Can't Connect to Backend
- Verify VITE_BACKEND_HOST and VITE_BACKEND_PORT in frontend/.env
- Check if backend is running: `curl http://localhost:8000/`
- Test backend health: `curl http://localhost:8000/api/v1/health`

---

## 🎉 Kết luận

**ScanPilot đã sẵn sàng để phát triển!** 

Khung sườn ứng dụng đã hoàn thiện với:
- ✅ Backend API hoạt động
- ✅ Frontend UI hiện đại  
- ✅ Database integration
- ✅ Authentication system
- ✅ Docker containerization
- ✅ Development workflow

Bạn có thể bắt đầu phát triển các tính năng chi tiết ngay bây giờ!