import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => void;
  getLoginUrl: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Add token to axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const verifyToken = async (tok: string) => {
    try {
      const response = await axios.post('/api/auth/verify', { token: tok });
      setUser(response.data.user);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (code: string) => {
    try {
      const response = await axios.post('/api/auth/callback', { code });
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('authToken', newToken);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const getLoginUrl = () => {
    const issuerUrl = import.meta.env.VITE_OAUTH_ISSUER_URL;
    const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;

    if (!issuerUrl || !clientId || !redirectUri) {
      console.error('OAuth configuration missing in environment variables');
      return '';
    }

    const scope = encodeURIComponent('openid profile email');
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope,
      redirect_uri: redirectUri,
    });

    return `${issuerUrl}authorize/?${params}`;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getLoginUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
