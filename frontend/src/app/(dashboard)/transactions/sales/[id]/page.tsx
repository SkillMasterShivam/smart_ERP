'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SalesForm } from '@/components/forms/sales-form';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditSalesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [voucher, setVoucher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const { data } = await apiClient.get(`/sales/${id}`);
      setVoucher(data.data);
    } catch (error) {
      toast.error('Failed to load voucher');
      router.push('/transactions/sales');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!window.confirm('Are you sure you want to Post this voucher? This will permanently decrease inventory.')) return;
    setIsProcessing(true);
    try {
      await apiClient.post(`/sales/${id}/post`);
      toast.success('Voucher Posted successfully. Inventory updated.');
      fetchVoucher(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to post voucher');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to Cancel this voucher? This will restore the inventory.')) return;
    setIsProcessing(true);
    try {
      await apiClient.post(`/sales/${id}/cancel`);
      toast.success('Voucher Cancelled successfully. Inventory restored.');
      fetchVoucher(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel voucher');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isDraft = voucher.status === 'Draft';
  const isPosted = voucher.status === 'Posted';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/transactions/sales" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sales: {voucher.voucher_number}
            </h1>
            <p className="text-sm text-gray-500">Status: <strong className={isDraft ? 'text-slate-600' : isPosted ? 'text-green-600' : 'text-red-600'}>{voucher.status}</strong></p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isDraft && (
            <Button onClick={handlePost} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Post Voucher
            </Button>
          )}
          {isPosted && (
            <Button onClick={handleCancel} variant="destructive" disabled={isProcessing}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Voucher
            </Button>
          )}
        </div>
      </div>

      <SalesForm initialData={voucher} isEdit={isDraft} />
    </div>
  );
}
