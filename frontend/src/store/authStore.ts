import { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  is_admin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Initialize from localStorage
const getInitialState = (): AuthState => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!(parsed.token && parsed.user)
      };
    }
  } catch (error) {
    console.log('Failed to load auth state from localStorage');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

export const useAuthStore = () => {
  const [state, setState] = useState<AuthState>(getInitialState());

  const login = (token: string, user: User) => {
    const newState = {
      user,
      token,
      isAuthenticated: true
    };
    
    setState(newState);
    localStorage.setItem('auth-storage', JSON.stringify(newState));
  };

  const logout = async () => {
    const currentToken = state.token;
    
    // Clear local state first
    const newState = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    
    setState(newState);
    localStorage.removeItem('auth-storage');
    
    // Try to call logout API to invalidate token on server
    if (currentToken) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8002'}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('Failed to call logout API, but local logout completed');
      }
    }
  };

  return {
    ...state,
    login,
    logout
  };
};