'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LedgerForm } from '@/components/forms/ledger-form';
import { ArrowLeft, Loader2, Trash } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditLedgerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ledger, setLedger] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const { data } = await apiClient.get(`/ledgers/${id}`);
        setLedger(data.data);
      } catch (error) {
        toast.error('Failed to load ledger');
        router.push('/masters/ledgers');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLedger();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to archive this ledger?')) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/ledgers/${id}`);
      toast.success('Ledger archived successfully');
      router.push('/masters/ledgers');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to archive ledger');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/masters/ledgers" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Ledger</h1>
            <p className="text-sm text-gray-500">Update ledger details.</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          <Trash className="h-4 w-4 mr-2" />
          Archive
        </Button>
      </div>

      <LedgerForm initialData={ledger} isEdit={true} />
    </div>
  );
}
