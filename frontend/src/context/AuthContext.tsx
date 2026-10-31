import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (token: string, sessionData: UserSession) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('vignan_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('vignan_auth_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch {
      // Token invalid or expired
      localStorage.removeItem('vignan_auth_token');
      localStorage.removeItem('vignan_user_session');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, sessionData: UserSession) => {
    localStorage.setItem('vignan_auth_token', newToken);
    localStorage.setItem('vignan_user_session', JSON.stringify(sessionData));
    setToken(newToken);
    setUser(sessionData);
  };

  const logout = () => {
    localStorage.removeItem('vignan_auth_token');
    localStorage.removeItem('vignan_user_session');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
