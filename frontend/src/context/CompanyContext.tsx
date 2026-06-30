'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '../lib/axios';
import { useAuth } from './AuthContext';

export interface Company {
  id: string;
  name: string;
  business_type?: string;
  gst_no?: string;
  pan_no?: string;
  fy_start: string;
  state?: string;
  country: string;
  address?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  currency: string;
  timezone: string;
}

interface CompanyContextType {
  activeCompany: Company | null;
  companies: Company[];
  isLoadingCompanies: boolean;
  selectCompany: (company: Company) => void;
  refreshCompanies: () => Promise<void>;
  clearCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // When user logs in, fetch their companies
  useEffect(() => {
    if (user) {
      refreshCompanies();
    } else {
      setCompanies([]);
      setActiveCompany(null);
      localStorage.removeItem('activeCompanyId');
      setIsLoadingCompanies(false);
    }
  }, [user]);

  // Handle active company state and redirection logic
  useEffect(() => {
    if (!user || isLoadingCompanies) return;

    // Public auth routes should not trigger company redirects
    const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (PUBLIC_ROUTES.includes(pathname)) return;

    const savedCompanyId = localStorage.getItem('activeCompanyId');

    if (companies.length === 0) {
      // User has no companies, force them to create one
      if (pathname !== '/companies/new') {
        router.push('/companies/new');
      }
    } else {
      // User has companies
      if (!activeCompany) {
        // Try to restore from localStorage
        const savedCompany = companies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setActiveCompany(savedCompany);
        } else {
          // No active company selected, force selection
          if (pathname !== '/companies' && pathname !== '/companies/new') {
            router.push('/companies');
          }
        }
      } else {
        // Active company exists, if they are on /companies (not creating new), we could redirect to dashboard, 
        // but it's often better to let them stay on the companies page if they navigated there to switch.
        // If they just logged in and hit root, go to dashboard.
        if (pathname === '/') {
          router.push('/dashboard');
        }
      }
    }
  }, [companies, activeCompany, isLoadingCompanies, pathname, router, user]);

  const refreshCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const { data } = await apiClient.get('/companies');
      setCompanies(data.data || []);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const selectCompany = (company: Company) => {
    setActiveCompany(company);
    localStorage.setItem('activeCompanyId', company.id);
    router.push('/dashboard');
  };

  const clearCompany = () => {
    setActiveCompany(null);
    localStorage.removeItem('activeCompanyId');
    router.push('/companies');
  };

  return (
    <CompanyContext.Provider value={{ activeCompany, companies, isLoadingCompanies, selectCompany, refreshCompanies, clearCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
