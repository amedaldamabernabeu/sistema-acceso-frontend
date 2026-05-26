'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getMe } from '../../services/api';

type User = any | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // init token from localStorage
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (t) setToken(t);
    setLoading(false);
  }, []);

  const fetchUser = useCallback(async (t: string | null) => {
    if (!t) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      // api interceptor debe adjuntar Authorization desde localStorage
      const res = await getMe();
      if (res.data?.active === false) {
        setToken(null);
        setUser(null);
        return;
      }
      setUser(res.data);
    } catch (err) {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // when token changes, persist and fetch user
  useEffect(() => {
    if (token) {
      // persist token antes de llamar fetch (asi el interceptor lo puede usar)
      localStorage.setItem('token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUser]);

  // listen storage events (sync across tabs)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (tok: string) => {
    setToken(tok);
    // fetchUser será llamado por el effect que escucha token
  };

  const logout = () => {
    setToken(null);
  };

  const refreshUser = async () => {
    await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
