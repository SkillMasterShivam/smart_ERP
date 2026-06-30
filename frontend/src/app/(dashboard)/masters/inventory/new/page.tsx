'use client';

import { ItemForm } from '@/components/forms/item-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewItemPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/masters/inventory" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Stock Item</h1>
          <p className="text-sm text-gray-500">Create a new product or material in your inventory.</p>
        </div>
      </div>

      <ItemForm />
    </div>
  );
}
