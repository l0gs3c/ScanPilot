## 🔐 Authentication Implementation with Context7

### Example: JWT Authentication Research
```bash
# Comprehensive JWT research with FastAPI
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/fastapi/fastapi" \
  --topic "jwt authentication security" \
  --tokens 2000

# Result: 55KB of FastAPI JWT documentation including:
# - Token generation with expiration
# - Token verification and validation
# - OAuth2PasswordBearer integration
# - Security best practices
# - Error handling patterns
# - HTTPException responses
```

### Real Implementation Example
Based on Context7 research, ScanPilot implements:

#### Backend JWT Authentication (FastAPI)
```python
# Research command used:
# mcp_context7_get-library-docs --context7CompatibleLibraryID "/fastapi/fastapi" --topic "jwt security"

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

# Security Configuration (from Context7 best practices)
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # openssl rand -hex 32
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - automatically extracts Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class TokenData(BaseModel):
    username: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Generate JWT with expiration (Context7 pattern)
    - Copies data to avoid mutation
    - Uses timezone-aware datetime
    - Adds 'exp' claim automatically
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency for protected endpoints (Context7 pattern)
    - Validates JWT signature and expiration
    - Returns 401 with WWW-Authenticate header
    - Extracts username from 'sub' claim
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    
    return user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 token endpoint (Context7 standard)
    - Authenticates user credentials
    - Returns JWT access token
    - Includes token_type: "bearer"
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoint example
@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
```

**Key Patterns from Context7**:
1. ✅ `OAuth2PasswordBearer` auto-extracts token from Authorization header
2. ✅ `HTTPException` with `WWW-Authenticate` header for OAuth2 compliance
3. ✅ `timezone.utc` instead of deprecated `utcnow()`
4. ✅ Pydantic models for request/response validation
5. ✅ Dependency injection for reusable auth logic

#### Frontend Authentication Context (React)
```typescript
// Research command used:
// mcp_context7_get-library-docs --context7CompatibleLibraryID "/websites/react_dev" --topic "context authentication"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  username: string
  email: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

// Create context with undefined default (Context7 pattern)
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const isAuthenticated = user !== null
  
  // Check authentication on mount (Context7 useEffect pattern)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            localStorage.removeItem('access_token')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('access_token')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])  // Empty dependency array - run once on mount
  
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      
      // Get user info with new token
      const userResponse = await fetch('/api/v1/users/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }
  
  // Context.Provider pattern from Context7
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook with error checking (Context7 best practice)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Usage in components
export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Log in</button>
    </form>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <LoginForm />
  }
  
  return <>{children}</>
}
```

**React Patterns from Context7**:
1. ✅ **Context API** - Global state management without prop drilling
2. ✅ **Custom Hooks** - Reusable logic with `useAuth()`
3. ✅ **useState** - Local state for user and loading
4. ✅ **useEffect** - Side effects for token verification on mount
5. ✅ **Error Boundaries** - Throw error if hook used outside Provider
6. ✅ **TypeScript** - Type-safe context with interfaces
7. ✅ **localStorage** - Token persistence across sessions

## 🛠️ Authentication Development Workflow with Context7

### 1. Research Phase
```bash
# Start with general authentication concepts
mcp_context7_get-library-docs --library "/owasp/owasp" --topic "authentication security" --tokens 4000

# Research specific technology implementations
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "security authentication" --tokens 5000
mcp_context7_get-library-docs --library "/facebook/react" --topic "authentication hooks" --tokens 4000
```

### 2. Implementation Phase  
```bash
# Research JWT implementation details
mcp_context7_get-library-docs --library "/auth0/node-jsonwebtoken" --topic "implementation examples" --tokens 3000

# Research password hashing
mcp_context7_get-library-docs --library "/kelektiv/bcrypt" --topic "password hashing" --tokens 2000
```

### 3. Testing & Security Phase
```bash
# Research security vulnerabilities
mcp_context7_get-library-docs --library "/owasp/owasp" --topic "jwt vulnerabilities" --tokens 3000

# Research testing authentication flows
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "testing authentication" --tokens 3000
```

### 4. Deployment Security
```bash
# Research production security practices
mcp_context7_get-library-docs --library "/auth0/node-jsonwebtoken" --topic "production security" --tokens 3000

# Research HTTPS and CORS configuration
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "cors security https" --tokens 3000
```

## 📊 Context7 Impact on Authentication Implementation

### Before Context7
- ❌ Manual documentation lookup
- ❌ Outdated Stack Overflow solutions
- ❌ Trial and error implementation
- ❌ Security vulnerabilities from poor examples

### After Context7
- ✅ Real-time access to latest documentation
- ✅ Official implementation patterns
- ✅ Security best practices included
- ✅ Comprehensive error handling examples
- ✅ 44KB of JWT documentation in seconds
- ✅ FastAPI security patterns readily available
- ✅ React authentication context examples

**Result**: Robust authentication system implemented in hours instead of days!

# 🌟 Overview

Context7 MCP (Model Context Protocol) is integrated into ScanPilot to provide real-time access to up-to-date documentation for all libraries, frameworks, and security tools used in the project.

## 🚀 Setup Context7 MCP

### 1. VS Code Configuration
Add this to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@upstash/context7-mcp", "--api-key", "ctx7sk-501af85b-62e2-4dbe-ab92-2bce98083bf8"]
      }
    }
  }
}
```

### 2. Verify Installation
```bash
# Test Context7 connectivity
mcp_context7_resolve-library-id --library "react"
```

## 📚 ScanPilot Stack Documentation

### Frontend Stack Research

#### React Development
```bash
# Core React concepts
mcp_context7_get-library-docs --library "/facebook/react" --topic "hooks" --tokens 5000

# React Router for navigation
mcp_context7_get-library-docs --library "/remix-run/react-router" --topic "routing" --tokens 3000

# State management patterns
mcp_context7_get-library-docs --library "/facebook/react" --topic "state-management" --tokens 4000
```

#### Styling & UI
```bash
# Tailwind CSS utilities and best practices
mcp_context7_get-library-docs --library "/tailwindlabs/tailwindcss" --topic "utilities" --tokens 4000

# Component design patterns
mcp_context7_get-library-docs --library "/tailwindlabs/tailwindcss" --topic "components" --tokens 3000

# Responsive design
mcp_context7_get-library-docs --library "/tailwindlabs/tailwindcss" --topic "responsive" --tokens 2000
```

#### Build Tools
```bash
# Vite configuration and optimization
mcp_context7_get-library-docs --library "/vitejs/vite" --topic "configuration" --tokens 3000

# TypeScript integration
mcp_context7_get-library-docs --library "/microsoft/TypeScript" --topic "react" --tokens 4000
```

### Backend Stack Research

#### FastAPI Development
```bash
# FastAPI fundamentals
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "tutorial" --tokens 6000

# Dependency injection
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "dependencies" --tokens 4000

# Security and authentication
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "security" --tokens 5000

# WebSocket implementation
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "websockets" --tokens 3000
```

#### Database & ORM
```bash
# SQLAlchemy ORM patterns
mcp_context7_get-library-docs --library "/sqlalchemy/sqlalchemy" --topic "orm" --tokens 5000

# Database migrations with Alembic
mcp_context7_get-library-docs --library "/sqlalchemy/alembic" --topic "migrations" --tokens 3000

# PostgreSQL optimization
mcp_context7_get-library-docs --library "/postgres/postgres" --topic "performance" --tokens 4000
```

#### Task Queue & Caching
```bash
# Celery for background tasks
mcp_context7_get-library-docs --library "/celery/celery" --topic "background-tasks" --tokens 4000

# Redis caching strategies
mcp_context7_get-library-docs --library "/redis/redis" --topic "caching" --tokens 3000
```

### Security Tools Research

#### Network Scanning
```bash
# Nmap scanning techniques
mcp_context7_get-library-docs --library "/nmap/nmap" --topic "scanning-techniques" --tokens 4000

# Port scanning best practices
mcp_context7_get-library-docs --library "/nmap/nmap" --topic "port-scanning" --tokens 3000
```

#### Web Application Testing
```bash
# Directory bruteforcing with DirSearch
mcp_context7_get-library-docs --library "/maurosoria/dirsearch" --topic "directory-bruteforce" --tokens 3000

# Nikto web vulnerability scanning
mcp_context7_get-library-docs --library "/sullo/nikto" --topic "web-scanning" --tokens 3000

# OWASP testing methodology
mcp_context7_get-library-docs --library "/owasp/owasp" --topic "web-testing" --tokens 5000
```

#### Vulnerability Assessment
```bash
# Nuclei template engine
mcp_context7_get-library-docs --library "/projectdiscovery/nuclei" --topic "templates" --tokens 4000

# Subdomain enumeration
mcp_context7_get-library-docs --library "/projectdiscovery/subfinder" --topic "subdomain-enumeration" --tokens 3000
```

## 🔧 Development Workflows with Context7

### 1. Research Before Coding
```bash
# Before adding new features, research the libraries
mcp_context7_resolve-library-id --library "new-dependency"
mcp_context7_get-library-docs --library "/org/new-dependency" --topic "getting-started"
```

### 2. Debugging with Documentation
```bash
# When encountering errors, get troubleshooting guides
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "debugging"
mcp_context7_get-library-docs --library "/facebook/react" --topic "troubleshooting"
```

### 3. Performance Optimization
```bash
# Research optimization strategies
mcp_context7_get-library-docs --library "/vitejs/vite" --topic "performance"
mcp_context7_get-library-docs --library "/postgres/postgres" --topic "optimization"
mcp_context7_get-library-docs --library "/redis/redis" --topic "performance"
```

### 4. Security Best Practices
```bash
# Stay updated on security practices
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "security"
mcp_context7_get-library-docs --library "/owasp/owasp" --topic "best-practices"
```

## 📊 Team Collaboration with Context7

### Code Review Enhancement
- Use Context7 to verify API usage patterns during reviews
- Reference official documentation for implementation decisions
- Share Context7 queries in PR comments for context

### Knowledge Sharing
```bash
# Create team knowledge base with Context7 research
mcp_context7_get-library-docs --library "/facebook/react" --topic "patterns" > docs/react-patterns.md
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "best-practices" > docs/fastapi-best-practices.md
```

### Onboarding New Developers
```bash
# Standardized onboarding research commands
./scripts/context7-onboarding.sh
```

## 🛠️ Custom Context7 Scripts

### Frontend Research Script
```bash
#!/bin/bash
# research-frontend.sh
echo "Researching frontend stack..."
mcp_context7_get-library-docs --library "/facebook/react" --topic "hooks" --tokens 3000
mcp_context7_get-library-docs --library "/tailwindlabs/tailwindcss" --topic "utilities" --tokens 2000
mcp_context7_get-library-docs --library "/vitejs/vite" --topic "configuration" --tokens 2000
```

### Backend Research Script
```bash
#!/bin/bash
# research-backend.sh
echo "Researching backend stack..."
mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "tutorial" --tokens 4000
mcp_context7_get-library-docs --library "/sqlalchemy/sqlalchemy" --topic "orm" --tokens 3000
mcp_context7_get-library-docs --library "/celery/celery" --topic "background-tasks" --tokens 2000
```

### Security Tools Research Script
```bash
#!/bin/bash
# research-security.sh
echo "Researching security tools..."
mcp_context7_get-library-docs --library "/nmap/nmap" --topic "scanning" --tokens 3000
mcp_context7_get-library-docs --library "/projectdiscovery/nuclei" --topic "templates" --tokens 3000
mcp_context7_get-library-docs --library "/owasp/owasp" --topic "methodology" --tokens 2000
```

## 🎯 Context7 Tips & Tricks

### Optimize Token Usage
- Use specific topics instead of general queries
- Set appropriate token limits (2000-6000 for focused research)
- Cache frequently used documentation locally

### Research Patterns
1. **Explore**: Start with general topics to understand scope
2. **Focus**: Drill down into specific features you need
3. **Compare**: Research alternatives before making decisions
4. **Validate**: Cross-reference with official docs

### Integration with IDE
- Use Context7 results in code comments
- Create documentation snippets from Context7 output
- Build custom VS Code snippets from research results

## 🚨 Troubleshooting Context7

### Common Issues
```bash
# If Context7 server is not responding
npx @upstash/context7-mcp --api-key your-key

# Test connectivity
mcp_context7_resolve-library-id --library "test"

# Clear VS Code MCP cache
# Restart VS Code after MCP configuration changes
```

### Error Resolution
1. **Authentication**: Verify API key is correct
2. **Network**: Check internet connectivity
3. **VS Code**: Restart after configuration changes
4. **Rate Limits**: Space out requests if hitting limits

---

## 📈 Measuring Context7 Impact

Track how Context7 improves your development:
- ⏱️ Reduced documentation lookup time
- 🐛 Faster debugging with targeted guides
- 📚 Better code quality through best practices
- 🚀 Accelerated feature development
- 🎯 More informed architectural decisions

**Start using Context7 MCP today to supercharge your ScanPilot development experience!**