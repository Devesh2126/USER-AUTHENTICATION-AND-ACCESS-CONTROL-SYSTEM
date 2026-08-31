import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await refreshUser();
    return data;
  }

  async function register(email, password, name) {
    const { data } = await api.post('/auth/register', { email, password, name });
    if (!data.data?.requiresEmailConfirmation) {
      await refreshUser();
    }
    return data;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
