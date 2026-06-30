'use client';

import { LedgerForm } from '@/components/forms/ledger-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLedgerPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/masters/ledgers" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Ledger</h1>
          <p className="text-sm text-gray-500">Add a new account to your chart of accounts.</p>
        </div>
      </div>

      <LedgerForm />
    </div>
  );
}
