import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getApiUrl } from '../utils/api';

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

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        await fetch(`${getApiUrl()}/api/v1/auth/logout`, {
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

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};