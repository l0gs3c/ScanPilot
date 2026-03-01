# ScanPilot - Portable Configuration

## ✅ Relative Paths Implementation

Project này đã được cấu hình để sử dụng **đường dẫn tương đối (relative paths)** thay vì đường dẫn tuyệt đối (absolute paths). Điều này có nghĩa là:

- ✅ Project có thể được di chuyển sang bất kỳ máy tính nào
- ✅ Project có thể được đặt ở bất kỳ folder nào
- ✅ Không có hardcoded paths như `E:\ScanPilot`
- ✅ Hoạt động trên Windows, Linux, MacOS

## 📁 Cấu Trúc Thư Mục

```
ScanPilot/                    ← PROJECT ROOT (cwd khi backend chạy)
├── backend/
│   ├── main.py               ← Entry point, tự động chuyển cwd về project root
│   └── app/
│       ├── services/
│       │   └── scan_service.py   ← Sử dụng relative paths
│       └── api/
│           └── v1/
│               └── scans.py       ← Sử dụng relative paths
├── storage/                  ← Storage root (RELATIVE)
│   ├── scans.json
│   └── targets/
│       ├── targets.json
│       └── <target_folders>/
├── wordlist/
│   └── common.txt
└── tools/
    └── dirsearch-0.4.3/
```

## 🔧 Cách Hoạt Động

### 1. Main Entry Point (`backend/main.py`)

```python
if __name__ == "__main__":
    # Tự động chuyển working directory về project root
    current_dir = Path(__file__).resolve().parent
    project_root = current_dir.parent  # Go up from backend/ to project root
    
    # Add to Python path
    sys.path.insert(0, str(project_root))
    
    # Change working directory
    os.chdir(project_root)
    
    # Now all relative paths work from project root
    uvicorn.run("backend.main:app", ...)
```

### 2. Storage Paths (`scan_service.py`, `scans.py`)

```python
# ❌ CŨ - Absolute paths:
# SCANS_JSON_PATH = PROJECT_ROOT / "storage" / "scans.json"
# TARGETS_BASE_PATH = PROJECT_ROOT / "storage" / "targets"

# ✅ MỚI - Relative paths:
SCANS_JSON_PATH = Path("storage") / "scans.json"
TARGETS_BASE_PATH = Path("storage") / "targets"
TARGETS_JSON_PATH = Path("storage") / "targets" / "targets.json"
```

### 3. Command Execution

```python
# Subprocess chạy với cwd="." (project root)
self.process = await asyncio.create_subprocess_exec(
    *cmd,
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.STDOUT,
    cwd="."  # Current working directory (project root)
)
```

## 🚀 Cách Khởi Động

### Cách 1: Từ Backend Folder

```powershell
cd backend
python main.py
```

**Lưu ý**: `main.py` sẽ tự động chuyển `cwd` về project root!

### Cách 2: Từ Project Root

```powershell
# Sử dụng script có sẵn
.\start-backend-from-root.ps1
```

### Cách 3: Manual từ Project Root

```powershell
cd ScanPilot  # Đảm bảo đang ở project root
python -m backend.main
```

## 🧪 Kiểm Tra

### Verify Working Directory

```powershell
# Backend đang chạy, kiểm tra trong log
# Bạn sẽ thấy dòng:
📁 Working Directory: E:\ScanPilot  # (hoặc đường dẫn khác tùy máy)
```

### Verify Relative Paths

```powershell
# Test với Python
python -c "from pathlib import Path; import os; print(f'CWD: {os.getcwd()}'); p = Path('storage/targets/targets.json'); print(f'Path: {p}'); print(f'Absolute: {p.is_absolute()}'); print(f'Exists: {p.exists()}')"

# Output mong muốn:
# CWD: E:\ScanPilot
# Path: storage\targets\targets.json
# Absolute: False
# Exists: True
```

## 📋 Files Đã Được Cập Nhật

### 1. `backend/main.py`
- Thêm logic chuyển `cwd` về project root khi startup
- Thêm `sys.path` để import module `backend`
- Đổi uvicorn app path từ `"main:app"` → `"backend.main:app"`

### 2. `backend/app/services/scan_service.py`
- Xóa imports từ `sqlalchemy` và `app.models`
- Đổi tất cả paths sang relative:
  - `SCANS_JSON_PATH = Path("storage") / "scans.json"`
  - `TARGETS_BASE_PATH = Path("storage") / "targets"`
- Subprocess `cwd` từ `PROJECT_ROOT` → `"."`
- Tất cả `output_file` paths giữ nguyên relative

### 3. `backend/app/api/v1/scans.py`
- Xóa logic tính `PROJECT_ROOT`
- Đổi sang relative: `TARGETS_JSON_PATH = Path("storage") / "targets" / "targets.json"`

### 4. `start-backend-from-root.ps1` (MỚI)
- Script startup đảm bảo chạy từ project root

## ⚠️ Điều Kiện Hoạt Động

### ✅ CÁC ĐIỀU KIỆN CẦN

1. **Backend PHẢI chạy từ project root hoặc `backend/` folder**
   - ✅ `cd backend && python main.py` → `main.py` tự chuyển về root
   - ✅ `cd ScanPilot && python -m backend.main` → Đã ở root
   - ❌ `cd some/other/path && python /path/to/backend/main.py` → SẼ LỖI

2. **Cấu trúc thư mục phải giữ nguyên**
   ```
   ScanPilot/
   ├── backend/
   ├── storage/
   ├── wordlist/
   └── tools/
   ```

3. **Các tools (subfinder, nuclei, dirsearch) phải có trong PATH hoặc trong `tools/`**

### ❌ CÁC TRƯỜNG HỢP KHÔNG HOẠT ĐỘNG

- Chạy backend từ folder khác project root mà không có logic chuyển cwd
- Di chuyển chỉ folder `backend/` mà không có `storage/`, `wordlist/`
- Rename các folder `storage`, `wordlist`, `tools`

## 🎯 Testing Checklist

- [ ] Stop backend cũ
- [ ] Di chuyển project sang folder mới (test portability)
- [ ] `cd backend && python main.py`
- [ ] Check log: `📁 Working Directory: <new_path>`
- [ ] Test API: `GET /api/v1/targets` → trả về 3 targets
- [ ] Create scan: `POST /api/v1/scans/` → thành công
- [ ] Check `storage/scans.json` → có scan mới
- [ ] Check scan command không chứa absolute path hardcoded

## 📚 Context7 Library Docs

Tài liệu về pathlib (dùng để xây dựng relative paths):
- Library: Universal Pathlib
- Context7 ID: `/fsspec/universal_pathlib`

## 💡 Best Practices

1. **Luôn sử dụng `Path()` object** thay vì string concatenation
2. **Không bao giờ hardcode absolute paths** như `"E:\ScanPilot\..."`
3. **Test project ở nhiều locations** để đảm bảo portability
4. **Document working directory requirements** rõ ràng
5. **Sử dụng `.gitignore`** để không commit machine-specific paths

## 🔗 Related Documentation

- [Python pathlib](https://docs.python.org/3/library/pathlib.html)
- [os.chdir()](https://docs.python.org/3/library/os.html#os.chdir)
- [sys.path](https://docs.python.org/3/library/sys.html#sys.path)
