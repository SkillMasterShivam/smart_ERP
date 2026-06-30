'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import { useCompany } from '@/context/CompanyContext';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

export default function SalesPage() {
  const { activeCompany } = useCompany();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (activeCompany) fetchVouchers();
  }, [activeCompany, debouncedSearch]);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/sales', {
        params: { search: debouncedSearch }
      });
      setVouchers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
      toast.error('Failed to load sales vouchers');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'voucher_date',
      header: 'Date',
      cell: ({ row }) => <span className="text-gray-600">{new Date(row.original.voucher_date).toLocaleDateString()}</span>
    },
    {
      accessorKey: 'voucher_number',
      header: 'Voucher No',
      cell: ({ row }) => <span className="font-medium">{row.original.voucher_number}</span>
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.party?.name || 'Unknown'}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const color = status === 'Draft' ? 'bg-slate-100 text-slate-700' : 
                      status === 'Posted' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700';
        return <Badge className={`${color} hover:${color} shadow-none`}>{status}</Badge>;
      }
    },
    {
      accessorKey: 'grand_total',
      header: () => <div className="text-right">Grand Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ₹{parseFloat(row.original.grand_total).toFixed(2)}
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/transactions/sales/${row.original.id}`}>
                {row.original.status === 'Draft' ? 'Edit' : 'View'}
              </Link>
            </Button>
          </div>
        )
      }
    }
  ];

  if (!activeCompany) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Vouchers</h1>
          <p className="text-sm text-gray-500">Manage outward supply and customer invoices.</p>
        </div>
        <Button asChild>
          <Link href="/transactions/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Sales
          </Link>
        </Button>
      </div>

      <div className="flex items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by voucher or PO number..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading vouchers...</div>
      ) : (
        <DataTable columns={columns} data={vouchers} />
      )}
    </div>
  );
}
