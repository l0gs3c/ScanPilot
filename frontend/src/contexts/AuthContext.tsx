import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  user_id: number
  username: string
  is_admin: boolean
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const API_BASE = 'http://localhost:8000'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for stored token on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('scanpilot_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token with backend
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Setup axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
      setToken(token)
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('scanpilot_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE}/api/v1/auth/login`, {
        username,
        password
      })

      const { access_token, token_type, user_id, username: responseUsername, is_admin } = response.data
      
      // Create user object from response
      const userData: User = {
        user_id,
        username: responseUsername,
        is_admin,
        is_active: true
      }
      
      // Store token in localStorage
      localStorage.setItem('scanpilot_token', access_token)
      
      // Update state
      setToken(access_token)
      setUser(userData)
      
      console.log('✅ Login successful:', userData.username)
      return true
    } catch (error) {
      console.error('❌ Login failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await axios.post(`${API_BASE}/api/v1/auth/logout`)
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local state regardless
      localStorage.removeItem('scanpilot_token')
      setToken(null) 
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
      console.log('👋 Logged out successfully')
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}