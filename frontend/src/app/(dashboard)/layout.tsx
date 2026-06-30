'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: isAuthLoading } = useAuth();
  const { isLoadingCompanies } = useCompany();
  const pathname = usePathname();

  // If loading auth or company state, show minimal loader
  if (isAuthLoading || isLoadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // The Company Selection / Creation pages should probably not have the full ERP sidebar, 
  // since the user hasn't fully "entered" the ERP yet.
  const isCompanyManagementPage = pathname.startsWith('/companies');

  if (isCompanyManagementPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr] bg-gray-50">
      <Sidebar />
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
