# ScanPilot - Security Scanning Management Platform

ScanPilot là một nền tảng quản lý các công cụ quét bảo mật với giao diện web hiện đại, cho phép quản lý targets, domains, subdomains và thực hiện các scan với real-time monitoring.

## Kiến trúc hệ thống

### Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + TypeScript
- **Backend**: Python FastAPI + SQLAlchemy + Celery
- **Database**: PostgreSQL + Redis (for caching & task queue)
- **WebSocket**: Socket.IO (real-time communication)
- **Container**: Docker + Docker Compose
- **Authentication**: JWT tokens

## Cấu trúc thư mục

```
ScanPilot/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── common/              # Shared components (Button, Modal, etc.)
│   │   │   ├── layout/              # Layout components (Sidebar, Header, etc.)
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── dashboard/           # Dashboard specific components
│   │   │   ├── targets/             # Target management components
│   │   │   └── scans/               # Scan management components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API services
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── store/                   # State management (Zustand/Redux)
│   │   ├── utils/                   # Utility functions
│   │   └── assets/                  # Static assets
│   │       ├── images/
│   │       └── icons/
│   ├── public/                      # Public static files
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── api/                     # API routes
│   │   │   └── v1/                  # API version 1
│   │   │       ├── auth.py          # Authentication endpoints
│   │   │       ├── targets.py       # Target management endpoints
│   │   │       ├── scans.py         # Scan management endpoints
│   │   │       ├── wildcards.py     # Wildcard management endpoints
│   │   │       └── websocket.py     # WebSocket endpoints
│   │   ├── core/                    # Core configuration
│   │   │   ├── config.py            # App configuration
│   │   │   ├── security.py          # Security utilities
│   │   │   └── database.py          # Database configuration
│   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── user.py              # User model
│   │   │   ├── target.py            # Target model
│   │   │   ├── scan.py              # Scan model
│   │   │   └── wildcard.py          # Wildcard model
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── services/                # Business logic
│   │   │   ├── auth_service.py      # Authentication service
│   │   │   ├── target_service.py    # Target management service
│   │   │   ├── scan_service.py      # Scan execution service
│   │   │   └── tool_manager.py      # Tool management service
│   │   ├── utils/                   # Utility functions
│   │   ├── database/                # Database utilities
│   │   └── workers/                 # Celery workers for background tasks
│   ├── tests/                       # Test files
│   ├── migrations/                  # Database migrations
│   ├── logs/                        # Application logs
│   ├── storage/                     # File storage
│   │   ├── scan_results/            # Scan result files
│   │   └── uploads/                 # User uploaded files
│   ├── requirements.txt
│   └── main.py                      # FastAPI app entry point
│
├── tools/                           # Security scanning tools
│   └── dirsearch-0.4.3/            # Directory brute-force tool
│
├── docker/                          # Docker configurations
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
├── database/                        # Database related files
│   ├── init.sql                     # Initial database schema
│   └── seed.sql                     # Sample data
│
├── scripts/                         # Utility scripts
│   ├── setup.sh                     # Setup script for Linux/Mac
│   ├── setup.bat                    # Setup script for Windows
│   └── backup.sh                    # Backup script
│
├── docs/                           # Documentation
│   ├── api.md                      # API documentation
│   ├── deployment.md               # Deployment guide
│   └── user-guide.md               # User guide
│
├── docker-compose.yml              # Docker compose configuration
├── docker-compose.dev.yml          # Development environment
├── .env.example                    # Environment variables example
├── .gitignore                      # Git ignore file
└── README.md                       # This file
```

## Tính năng chính

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management

### 2. Dashboard
- Overview của tất cả targets và scans
- Real-time statistics
- Recent activity logs
- System health monitoring

### 3. Target Management
- Tạo và quản lý targets (domains/IPs)
- Wildcard support (*.example.com)
- Target grouping và filtering
- Port specification

### 4. Scan Management  
- Multiple scanning tools integration
- Real-time scan monitoring
- Scan history và results
- Download scan reports
- Scan scheduling

### 5. Real-time Features
- Live scan output streaming
- Real-time notifications
- Progress tracking
- WebSocket communication

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Python 3.9+ (for development)

### Production Deployment (Docker)
```bash
# Clone repository
git clone <repository-url>
cd ScanPilot

# Copy và configure environment variables
cp .env.example .env
# Edit .env file with your configuration

# Build và start services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Development Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend  
npm install
npm run dev

# Database setup
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

### Targets
- `GET /api/v1/targets` - List all targets
- `POST /api/v1/targets` - Create new target
- `GET /api/v1/targets/{id}` - Get target details
- `PUT /api/v1/targets/{id}` - Update target
- `DELETE /api/v1/targets/{id}` - Delete target

### Scans
- `GET /api/v1/scans` - List all scans
- `POST /api/v1/scans` - Start new scan
- `GET /api/v1/scans/{id}` - Get scan details
- `POST /api/v1/scans/{id}/pause` - Pause scan
- `POST /api/v1/scans/{id}/resume` - Resume scan
- `POST /api/v1/scans/{id}/stop` - Stop scan
- `GET /api/v1/scans/{id}/results` - Download scan results

### WebSocket
- `/ws/scans/{scan_id}` - Real-time scan updates

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.