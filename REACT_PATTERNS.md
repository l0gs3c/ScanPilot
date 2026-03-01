# ⚛️ React Patterns Guide

## 🎯 Overview
ScanPilot frontend được xây dựng với React 18 và TypeScript, sử dụng modern patterns được nghiên cứu từ Context7 MCP.

## 📚 Context7 Research
```bash
# Get React documentation
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/react_dev" \
  --topic "hooks context state management authentication" \
  --tokens 2000

# Result: 46KB of React documentation including:
# - Hooks (useState, useEffect, useContext)
# - Context API for global state
# - Custom hooks patterns
# - Best practices
# - Performance optimization
```

## 🎣 React Hooks

### useState - Local State Management
```typescript
// From Context7 documentation
import { useState } from 'react'

function LoginForm() {
  // State for form inputs
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await login(username, password)
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
```

**Pattern Highlights**:
- ✅ Controlled components with `value` + `onChange`
- ✅ Loading states for better UX
- ✅ Error handling with state
- ✅ Disable inputs during submission

### useEffect - Side Effects
```typescript
// From Context7 patterns
import { useState, useEffect } from 'react'

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Effect runs when userId changes
  useEffect(() => {
    let cancelled = false
    
    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()
        
        // Only update state if not cancelled
        if (!cancelled) {
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchUser()
    
    // Cleanup function - runs before next effect or unmount
    return () => {
      cancelled = true
    }
  }, [userId]) // Dependency array - re-run when userId changes
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>
  
  return <div>{user.name}</div>
}
```

**useEffect Best Practices** (từ Context7):
1. ✅ Always include cleanup function for async operations
2. ✅ Specify dependencies in dependency array
3. ✅ Use cancellation flags for async requests
4. ✅ Empty array `[]` = run once on mount
5. ✅ No array = run after every render

## 🌐 Context API - Global State

### Creating Context with Multiple Contexts
```typescript
// Context7 pattern for multiple independent contexts
import { createContext, useContext, useState, ReactNode } from 'react'

// Theme Context
const ThemeContext = createContext<'light' | 'dark'>('light')

// Auth Context
interface User {
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Root App with multiple providers
export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [user, setUser] = useState<User | null>(null)
  
  const authValue = {
    user,
    isAuthenticated: user !== null,
    login: async (username: string, password: string) => {
      // Login implementation
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      setUser(data.user)
    },
    logout: () => setUser(null)
  }
  
  return (
    <ThemeContext.Provider value={theme}>
      <AuthContext.Provider value={authValue}>
        <div className={`app-${theme}`}>
          <Header />
          <MainContent />
          <ThemeToggle 
            theme={theme} 
            onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}

// Custom hooks for consuming contexts
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

**Context Pattern Benefits**:
- ✅ No prop drilling
- ✅ Type-safe with TypeScript
- ✅ Custom hooks for easy consumption
- ✅ Error checking for proper usage
- ✅ Multiple independent contexts

### Context with Reducer Pattern
```typescript
// Advanced pattern for complex state
import { createContext, useContext, useReducer, ReactNode } from 'react'

interface State {
  scans: Scan[]
  selectedScan: Scan | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_SCANS'; payload: Scan[] }
  | { type: 'SELECT_SCAN'; payload: Scan }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }

function scanReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCANS':
      return { ...state, scans: action.payload, loading: false }
    case 'SELECT_SCAN':
      return { ...state, selectedScan: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

const ScanContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | undefined>(undefined)

export function ScanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, {
    scans: [],
    selectedScan: null,
    loading: false,
    error: null
  })
  
  return (
    <ScanContext.Provider value={{ state, dispatch }}>
      {children}
    </ScanContext.Provider>
  )
}

export function useScan() {
  const context = useContext(ScanContext)
  if (!context) {
    throw new Error('useScan must be used within ScanProvider')
  }
  return context
}
```

## 🔧 Custom Hooks

### useLocalStorage - Persistent State
```typescript
import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })
  
  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])
  
  return [storedValue, setStoredValue] as const
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [language, setLanguage] = useLocalStorage('language', 'en')
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
```

### useFetch - Data Fetching Hook
```typescript
import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchToggle, setRefetchToggle] = useState(false)
  
  useEffect(() => {
    let cancelled = false
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const json = await response.json()
        
        if (!cancelled) {
          setData(json)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      cancelled = true
    }
  }, [url, refetchToggle])
  
  const refetch = () => setRefetchToggle(prev => !prev)
  
  return { data, loading, error, refetch }
}

// Usage
function ScanList() {
  const { data: scans, loading, error, refetch } = useFetch<Scan[]>('/api/scans')
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {scans?.map(scan => <ScanCard key={scan.id} scan={scan} />)}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

## 🎨 Component Patterns

### Compound Components
```typescript
// Pattern for flexible component composition
interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')
  
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === id
  
  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')
  
  const { activeTab } = context
  if (activeTab !== id) return null
  
  return <div className="tab-panel">{children}</div>
}

// Compound components as properties
Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panel = TabPanel

// Usage
function ScanDetails() {
  return (
    <Tabs defaultTab="overview">
      <Tabs.List>
        <Tabs.Tab id="overview">Overview</Tabs.Tab>
        <Tabs.Tab id="results">Results</Tabs.Tab>
        <Tabs.Tab id="logs">Logs</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panel id="overview">
        <OverviewContent />
      </Tabs.Panel>
      <Tabs.Panel id="results">
        <ResultsContent />
      </Tabs.Panel>
      <Tabs.Panel id="logs">
        <LogsContent />
      </Tabs.Panel>
    </Tabs>
  )
}
```

## 🚀 Performance Optimization

### React.memo - Prevent Unnecessary Re-renders
```typescript
import { memo } from 'react'

// Without memo - re-renders on every parent render
function ScanCard({ scan }: { scan: Scan }) {
  return <div>{scan.name}</div>
}

// With memo - only re-renders when scan changes
const ScanCardMemo = memo(function ScanCard({ scan }: { scan: Scan }) {
  return <div>{scan.name}</div>
})

// Custom comparison function
const ScanCardMemoCustom = memo(
  function ScanCard({ scan }: { scan: Scan }) {
    return <div>{scan.name}</div>
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.scan.id === nextProps.scan.id
  }
)
```

### useCallback - Memoize Functions
```typescript
import { useState, useCallback } from 'react'

function ScanList() {
  const [scans, setScans] = useState<Scan[]>([])
  
  // Without useCallback - new function on every render
  const handleDelete = (id: string) => {
    setScans(scans => scans.filter(s => s.id !== id))
  }
  
  // With useCallback - same function reference
  const handleDeleteMemo = useCallback((id: string) => {
    setScans(scans => scans.filter(s => s.id !== id))
  }, []) // Empty deps - function never changes
  
  return (
    <div>
      {scans.map(scan => (
        <ScanCard
          key={scan.id}
          scan={scan}
          onDelete={handleDeleteMemo} // Same reference every render
        />
      ))}
    </div>
  )
}
```

## 📖 Context7 Commands Used

```bash
# React hooks documentation
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/react_dev" \
  --topic "hooks useState useEffect useContext" \
  --tokens 2000

# Context API patterns
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/react_dev" \
  --topic "context api createContext provider" \
  --tokens 1500

# Custom hooks
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/react_dev" \
  --topic "custom hooks patterns" \
  --tokens 1500

# Performance optimization
mcp_context7_get-library-docs \
  --context7CompatibleLibraryID "/websites/react_dev" \
  --topic "performance memo useCallback useMemo" \
  --tokens 1500
```

## ✅ Best Practices (từ Context7)

1. ✅ **Use TypeScript** for type safety
2. ✅ **Custom hooks** for reusable logic
3. ✅ **Context API** for global state
4. ✅ **useEffect cleanup** for async operations
5. ✅ **Controlled components** for forms
6. ✅ **Error boundaries** for error handling
7. ✅ **React.memo** for expensive components
8. ✅ **Loading states** for better UX

---

**⚛️ Built with React 18 + Context7 MCP**
