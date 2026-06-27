"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import { setCookie, deleteCookie, getCookie } from '@/lib/cookies';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({ username: 'User' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/auth/login', { username, password });
      const { access_token } = response;
      
      // Store token in cookies for 7 days
      setCookie('token', access_token, 7);
      
      const userData = { username };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.detail || 'Failed to sign in. Please verify your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiPost('/auth/signup', { username, password });
      
      // Auto login after successful signup
      await login(username, password);
    } catch (err: any) {
      setError(err.detail || 'Registration failed. Username may already exist.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    deleteCookie('token');
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
    router.refresh();
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
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
