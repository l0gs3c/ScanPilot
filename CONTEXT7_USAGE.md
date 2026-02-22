## 🔐 Authentication Implementation with Context7

### Example: JWT Authentication Research
```bash
# Comprehensive JWT research
mcp_context7_get-library-docs --library "/auth0/node-jsonwebtoken" --topic "jwt authentication security" --tokens 3000

# Result: 44KB of JWT documentation including:
# - Token generation and verification
# - Security best practices
# - Error handling patterns
# - Debugging techniques
```

### Real Implementation Example
Based on Context7 research, ScanPilot implements:

#### Backend JWT Authentication (FastAPI)
```python
# Research command used:
# mcp_context7_get-library-docs --library "/tiangolo/fastapi" --topic "security authentication jwt"

from fastapi.security import HTTPBearer
import jwt
from passlib.context import CryptContext

def create_access_token(data: dict):
    # Implementation based on Context7 JWT docs
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=8)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Token verification pattern from Context7 research
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        return get_user(username)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Frontend Authentication Context (React)
```typescript
// Research command used:
// mcp_context7_get-library-docs --library "/facebook/react" --topic "authentication context"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  
  // Implementation patterns from Context7 React docs
  useEffect(() => {
    const storedToken = localStorage.getItem('scanpilot_token')
    if (storedToken) {
      verifyToken(storedToken)
    }
  }, [])
  
  const login = async (username: string, password: string) => {
    // Login implementation based on Context7 research
    const response = await axios.post('/api/v1/auth/login', { username, password })
    const { access_token, user} = response.data
    localStorage.setItem('scanpilot_token', access_token)
    setToken(access_token)
    setUser(user)
  }
}
```

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