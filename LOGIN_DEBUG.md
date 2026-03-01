# 🔍 Login Issue - Debugging Guide

## Issue: UI bị treo ở "Loading ScanPilot..."

---

## ✅ Đã thực hiện Fix

### 1. **Improved Frontend Error Handling** ([LoginPage.tsx](frontend/src/pages/LoginPage.tsx))

**Context7 Best Practices Applied**: React error handling with comprehensive logging

**Changes**:
```typescript
// ✅ Added detailed console logging
console.log('🔑 Login attempt started');
console.log('🎯 API_URL:', API_URL);
console.log('👤 Username:', username);

// ✅ Better error catching
catch (error) {
  console.error('🛑 Login error (network/CORS?):', error);
  console.error('Error details:', {
    name: (error as Error).name,
    message: (error as Error).message,
    stack: (error as Error).stack,
  });
}
```

**Benefits**:
- See exact API URL being called
- Identify CORS vs network errors
- Better error messages for users

### 2. **Enhanced Backend Logging** ([backend/main.py](backend/main.py))

**Context7 Best Practices Applied**: FastAPI debugging and request logging

**Changes**:
```python
# ✅ Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    if settings.DEBUG:
        print(f"\n➡️  {request.method} {request.url}")
        print(f"   Headers: {dict(request.headers)}")
        print(f"   Client: {request.client}")
    
    response = await call_next(request)
    print(f"⬅️  Response: {response.status_code}")
    return response

# ✅ Login endpoint logging
@app.post("/api/v1/auth/login")
async def login(user_credentials: UserLogin):
    print(f"🔑 Login attempt for user: {user_credentials.username}")
    # ... authentication logic
    print(f"✅ Login successful for user: {user['username']}")
```

**Benefits**:
- See all incoming requests
- Track authentication flow
- Identify CORS issues

### 3. **Improved CORS Configuration** ([backend/app/core/config.py](backend/app/core/config.py))

**Changes**:
```python
# ✅ Extended CORS origins
BACKEND_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",      # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:5173",
    # ... and more
]

# ✅ CORS logging in development
def get_cors_origins(self):
    if self.ENVIRONMENT == "development":
        print(f"⚙️  CORS Origins configured: {len(origins)} origins")
        for origin in origins:
            print(f"  - {origin}")
    return origins
```

**Benefits**:
- Support all common development ports
- See configured CORS origins on startup
- Easier to debug CORS issues

---

## 🧪 How to Test & Debug

### Step 1: Check Browser Console (F12)

**Open Developer Tools** (`F12` or Right-click → Inspect)

**Go to Console tab**, you should see:
```
🔧 API Configuration: {
  API_URL: "http://localhost:8000/api/v1",
  API_BASE_URL: "http://localhost:8000",
  ...
}
```

**When you click Login**, you should see:
```
🔑 Login attempt started
🎯 API_URL: http://localhost:8000/api/v1
👤 Username: admin
🚀 Sending request to: http://localhost:8000/api/v1/auth/login
📦 Response status: 200
📦 Response ok: true
✅ Login successful, data: {...}
✅ User logged in, navigating to dashboard...
```

**If there's an error**, you'll see:
```
🛑 Login error (network/CORS?): TypeError: Failed to fetch
Error details: {
  name: "TypeError",
  message: "Failed to fetch",
  ...
}
```

### Step 2: Check Backend Terminal

**Backend logs should show**:
```
➡️  POST http://localhost:8000/api/v1/auth/login
   Headers: {'content-type': 'application/json', ...}
   Client: ('127.0.0.1', 12345)
🔑 Login attempt for user: admin
✅ Login successful for user: admin
⬅️  Response: 200
```

**If backend doesn't show request**, CORS is likely blocking it.

### Step 3: Check Network Tab

1. Open **Network tab** in DevTools
2. Click **Login**
3. Look for `auth/login` request

**Expected**:
- **Status**: `200 OK`
- **Type**: `xhr` or `fetch`
- **Response**: JSON with `access_token`

**If CORS error**:
- **Status**: `(failed)` or CORS error
- **Console**: `Access to fetch... has been blocked by CORS policy`

---

## 🔧 Common Issues & Solutions

### Issue 1: "Failed to fetch" Error

**Symptoms**:
```
🛑 Login error (network/CORS?): TypeError: Failed to fetch
```

**Causes**:
- Backend not running
- Wrong API URL
- CORS blocking request
- Network firewall

**Solutions**:
```bash
# 1. Verify backend is running
curl http://localhost:8000/

# 2. Check API URL in browser console
# Should be: http://localhost:8000/api/v1

# 3. Check CORS origins in backend startup logs
# Should include your frontend URL (e.g., http://localhost:3000)

# 4. Restart servers
# Stop all terminals (Ctrl+C)
python backend/main.py
npm run dev  # in frontend directory
```

### Issue 2: CORS Error

**Symptoms**:
```
Access to fetch at 'http://localhost:8000/api/v1/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:
1. **Check backend startup logs**:
   ```
   ⚙️  CORS Origins configured: 12 origins
     - http://localhost:3000
     - http://localhost:3001
     ...
   ```

2. **If your port is missing**, update [.env](.env):
   ```bash
   BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:YOUR_PORT",...]
   ```

3. **Restart backend** (it should auto-reload, but manual restart ensures it)

### Issue 3: 401 Unauthorized

**Symptoms**:
```
❌ Login failed: 401 {detail: "Incorrect username or password"}
```

**Solution**:
- **Default credentials**:
  - Username: `admin`
  - Password: `admin123`

- **Check .env**:
  ```bash
  CREDENTIAL_ROOT_USER=admin
  CREDENTIAL_ROOT_PASSWORD=admin123
  ```

### Issue 4: UI Treo (Hangs) - isLoading never resets

**Causes**:
- Request never completes
- No response from backend
- Error not caught properly

**Solution**:
- **Check console** for errors
- **Check network tab** for stuck requests
- **Verify backend is responding**: `curl localhost:8000/`

**Our fix** - Added `finally` block:
```typescript
finally {
  console.log('🏁 Login attempt finished');
  setIsLoading(false);  // Always reset loading state
}
```

---

## 🚀 Quick Verification Steps

### 1. Test Backend Directly

**PowerShell**:
```powershell
$body = @{username="admin"; password="admin123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected Result**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": 1,
  "username": "admin",
  "is_admin": true
}
```

### 2. Check API Documentation

**Open**: http://localhost:8000/docs

**Try the login endpoint**:
1. Expand `POST /api/v1/auth/login`
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Click "Execute"
5. Should get 200 response with token

### 3. Test Frontend

1. **Open**: http://localhost:3000
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Click "Get Started" → Enter credentials**
5. **Watch console logs** for debugging info

---

## 📊 Environment Configuration

### Backend (.env)
```bash
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
ENVIRONMENT=development
DEBUG=True
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001",...]
```

### Frontend (frontend/.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_PORT=3000
```

**Important**: Frontend port may auto-increment (3000 → 3001 → 3002) if port is busy.

---

## 📝 Context7 Documentation Used

1. **React Error Handling** (47KB from /websites/react_dev)
   - Try-catch with async/await
   - Error boundaries
   - Loading states
   - Debugging techniques

2. **FastAPI Debugging** (53KB from /fastapi/fastapi)
   - Request logging middleware
   - CORS troubleshooting
   - Error handling patterns
   - Development best practices

Total: **100KB of latest debugging best practices**

---

## ✅ Next Steps

1. **Try logging in again** with improved logging
2. **Check browser console** (F12) for detailed logs
3. **Check backend terminal** for request logs
4. **If still issues**, share:
   - Browser console logs
   - Backend terminal logs
   - Network tab screenshot

---

**Last Updated**: February 23, 2026
**Fixed By**: Comprehensive logging & error handling improvements with Context7 best practices
