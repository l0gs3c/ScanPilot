# 📁 Scripts Directory

Thư mục chứa các script phụ trợ cho development và testing.

---

## 🚀 Startup Scripts

### Main Scripts (Recommended - Use from root)
```bash
# From root directory
.\start.bat          # Windows - Start all services
.\start.ps1          # PowerShell - Start all services  
./start.sh           # Linux/Mac - Start all services
.\stop-dev.bat       # Stop development servers
```

### Alternative Startup Scripts (Advanced)
- **start-all.bat** - Start all services (backend + frontend + docker)
- **start-backend.bat** - Start only backend server
- **start-dev.bat** - Start development environment
- **start-frontend.bat** - Start only frontend server
- **start_backend.bat** - Alternative backend starter

**Note**: Prefer using main scripts from root directory for simpler workflow.

---

## ⚙️ Setup Scripts

### Environment Setup
- **setup-env.bat** - Windows environment setup
- **setup-env.ps1** - PowerShell environment setup
- **setup-env-simple.ps1** - Simplified PowerShell setup
- **setup.bat** - Initial project setup (Windows)
- **setup.sh** - Initial project setup (Linux/Mac)
- **test-setup.bat** - Test setup verification

### Usage
```bash
# First time setup
cd scripts
.\setup.bat          # Windows
./setup.sh           # Linux/Mac

# Environment configuration
.\setup-env.ps1      # PowerShell
.\setup-env.bat      # Windows
```

---

## 🧪 Testing & Debugging Scripts

### Database Testing
- **check_db.py** - Check database connection
- **check_all_db.py** - Verify all database tables
- **direct_db_test.py** - Direct database query testing

### Application Testing
- **test_target_creation.py** - Test target creation functionality
- **fix_crud.py** - Fix CRUD operations issues

### Usage
```bash
# Check database
python scripts/check_db.py

# Test target creation
python scripts/test_target_creation.py

# Verify all tables
python scripts/check_all_db.py
```

---

## 📝 Script Organization

### Root Directory (Main Scripts Only)
```
ScanPilot/
├── start.bat           # Main Windows starter
├── start.ps1           # Main PowerShell starter
├── start.sh            # Main Linux/Mac starter
└── stop-dev.bat        # Stop servers
```

### Scripts Directory (Support Scripts)
```
scripts/
├── setup*.{bat,ps1,sh}     # Setup & configuration
├── start-*.bat              # Alternative starters
├── check_*.py               # Database checks
├── test_*.py                # Testing scripts
└── fix_*.py                 # Fix/utility scripts
```

---

## 🎯 Quick Reference

### For Normal Development
1. Use scripts from **root directory**: `.\start.bat` or `.\start.ps1`
2. Stop with: `.\stop-dev.bat`

### For Advanced Users
1. Run specific services: Use scripts in `scripts/` directory
2. Database debugging: Use `check_*.py` scripts
3. Testing: Use `test_*.py` scripts

### For First-Time Setup
1. Run setup: `.\scripts\setup.bat` (Windows) or `./scripts/setup.sh` (Linux/Mac)
2. Configure environment: `.\scripts\setup-env.ps1`
3. Start services: `.\start.bat` (from root)

---

## 🔧 Troubleshooting

### Script Not Found
- Make sure you're in the correct directory
- Use `.\script.bat` (Windows) or `./script.sh` (Linux/Mac)

### Permission Denied (Linux/Mac)
```bash
chmod +x scripts/*.sh
```

### PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**Tip**: Để workflow đơn giản nhất, chỉ cần dùng `.\start.bat` hoặc `.\start.ps1` từ root directory!
