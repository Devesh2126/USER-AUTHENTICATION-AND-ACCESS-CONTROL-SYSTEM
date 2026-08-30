import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Called on app load, and after login/register, to sync our state with
  // the real source of truth (the cookie-based session on the backend).
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
      return data.data;
    } catch (err) {
      setUser(null);
      // Re-throw if called during an active login flow
      if (err.response?.status === 403) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On first load: is there already a valid session cookie from a
  // previous visit? We don't know until we ask the backend.
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
