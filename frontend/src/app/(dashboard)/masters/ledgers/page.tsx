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

type Ledger = {
  id: string;
  name: string;
  code: string | null;
  type: string;
  opening_balance: number;
  balance_type: 'Dr' | 'Cr';
  is_active: boolean;
};

export default function LedgersPage() {
  const { activeCompany } = useCompany();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (activeCompany) {
      fetchLedgers();
    }
  }, [activeCompany, debouncedSearch]);

  const fetchLedgers = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/ledgers', {
        params: { search: debouncedSearch }
      });
      setLedgers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch ledgers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Ledger>[] = [
    {
      accessorKey: 'name',
      header: 'Ledger Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      )
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="text-gray-500">{row.original.code || '-'}</span>
    },
    {
      accessorKey: 'type',
      header: 'Group / Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>
    },
    {
      accessorKey: 'opening_balance',
      header: () => <div className="text-right">Opening Balance</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.original.opening_balance.toString()).toFixed(2);
        return (
          <div className="text-right font-medium">
            {amount} {row.original.balance_type}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/masters/ledgers/${row.original.id}/edit`}>
                Edit
              </Link>
            </Button>
          </div>
        )
      }
    }
  ];

  if (!activeCompany) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-gray-500">Manage your ledgers and opening balances.</p>
        </div>
        <Button asChild>
          <Link href="/masters/ledgers/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Ledger
          </Link>
        </Button>
      </div>

      <div className="flex items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search ledgers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading ledgers...</div>
      ) : (
        <DataTable columns={columns} data={ledgers} />
      )}
    </div>
  );
}
