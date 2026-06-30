'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '../lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Basic route protection
    if (!isLoading) {
      if (!user && !PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login');
      } else if (user && PUBLIC_ROUTES.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const checkAuth = async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    setUser(data.data.user);
    router.push('/dashboard');
  };

  const register = async (credentials: any) => {
    const { data } = await apiClient.post('/auth/register', credentials);
    // Usually, registration logs them in or requires email verification. Let's redirect to login for now.
    router.push('/login');
  };

  const logout = async () => {
    await apiClient.get('/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
