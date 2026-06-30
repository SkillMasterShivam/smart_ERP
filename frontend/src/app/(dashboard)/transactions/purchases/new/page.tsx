'use client';

import { PurchaseForm } from '@/components/forms/purchase-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPurchasePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/transactions/purchases" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Purchase Voucher</h1>
          <p className="text-sm text-gray-500">Record a new inward supply from a vendor.</p>
        </div>
      </div>

      <PurchaseForm />
    </div>
  );
}
