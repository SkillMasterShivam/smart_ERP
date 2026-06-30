'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ItemForm } from '@/components/forms/item-form';
import { ArrowLeft, Loader2, Trash } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await apiClient.get(`/inventory/items/${id}`);
        setItem(data.data);
      } catch (error) {
        toast.error('Failed to load item');
        router.push('/masters/inventory');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to archive this item?')) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/inventory/items/${id}`);
      toast.success('Item archived successfully');
      router.push('/masters/inventory');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to archive item');
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/masters/inventory" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Stock Item</h1>
            <p className="text-sm text-gray-500">Update item pricing, group, or details.</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          <Trash className="h-4 w-4 mr-2" />
          Archive
        </Button>
      </div>

      <ItemForm initialData={item} isEdit={true} />
    </div>
  );
}
