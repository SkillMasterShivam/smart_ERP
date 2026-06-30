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
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { activeCompany } = useCompany();
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (activeCompany) {
      fetchItems();
    }
  }, [activeCompany, debouncedSearch]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/inventory/items', {
        params: { search: debouncedSearch }
      });
      setItems(data.data || []);
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="text-gray-500 font-mono text-xs">{row.original.sku}</span>
    },
    {
      accessorKey: 'name',
      header: 'Item Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      )
    },
    {
      id: 'group',
      header: 'Stock Group',
      cell: ({ row }) => <Badge variant="outline">{row.original.group?.name || 'Unknown'}</Badge>
    },
    {
      id: 'quantity',
      header: () => <div className="text-right">Current Stock</div>,
      cell: ({ row }) => {
        const qty = parseFloat(row.original.current_quantity).toFixed(row.original.unit?.number_of_decimal_places || 0);
        const isLow = row.original.current_quantity <= row.original.reorder_level && row.original.reorder_level > 0;
        return (
          <div className="text-right font-medium flex items-center justify-end">
            {isLow && <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />}
            <span className={isLow ? 'text-amber-600' : ''}>
              {qty} {row.original.unit?.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'selling_price',
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => (
        <div className="text-right text-gray-500">
          ₹{parseFloat(row.original.selling_price).toFixed(2)}
        </div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/masters/inventory/${row.original.id}/edit`}>
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
          <h1 className="text-2xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-sm text-gray-500">Manage your products and stock levels.</p>
        </div>
        <Button asChild>
          <Link href="/masters/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      <div className="flex items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by name or SKU..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading items...</div>
      ) : (
        <DataTable columns={columns} data={items} />
      )}
    </div>
  );
}
