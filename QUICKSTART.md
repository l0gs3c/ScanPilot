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
# Setup environment once
setup-env.bat

# Start everything
start-all.bat

# Or start individually  
start-backend.bat
start-frontend.bat
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs
- **Database**: PostgreSQL trên port 5432
- **Cache**: Redis trên port 6379

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
├── 🎯 start-dev.bat        # Script khởi chạy nhanh
├── 🛑 stop-dev.bat         # Script dừng services
├── 📋 docker-compose.dev.yml # Dev database
├── ⚛️ frontend/             # React app  
├── 🐍 backend/              # FastAPI app
└── 🛠️ tools/               # Security tools
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