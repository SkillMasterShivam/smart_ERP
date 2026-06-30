'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/axios';
import { useCompany } from '@/context/CompanyContext';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const unitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  formal_name: z.string().max(255).optional(),
  number_of_decimal_places: z.number().int().min(0).max(4)
});

type UnitFormValues = z.infer<typeof unitSchema>;

export default function UnitsPage() {
  const { activeCompany } = useCompany();
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { number_of_decimal_places: 0 }
  });

  useEffect(() => {
    if (activeCompany) fetchUnits();
  }, [activeCompany]);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/inventory/units');
      setUnits(data.data || []);
    } catch (error) {
      toast.error('Failed to load units');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UnitFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/inventory/units', data);
      toast.success('Unit created successfully');
      reset();
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Archive this unit?')) return;
    try {
      await apiClient.delete(`/inventory/units/${id}`);
      toast.success('Unit archived successfully');
      fetchUnits();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Cannot archive unit in use');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Symbol',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'formal_name',
      header: 'Formal Name',
    },
    {
      accessorKey: 'number_of_decimal_places',
      header: 'Decimals',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ];

  if (!activeCompany) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Units of Measure (UOM)</h1>
        <p className="text-sm text-gray-500">Manage units for your inventory items.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg bg-white p-4 shadow-sm h-fit">
          <h2 className="font-semibold text-lg mb-4">Add New Unit</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Symbol * (e.g. PCS)</Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formal_name">Formal Name</Label>
              <Input id="formal_name" {...register('formal_name')} placeholder="e.g. Pieces" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_decimal_places">Decimal Places</Label>
              <Input id="number_of_decimal_places" type="number" min="0" max="4" {...register('number_of_decimal_places', { valueAsNumber: true })} />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Unit
            </Button>
          </form>
        </div>

        <div className="md:col-span-2">
          {isLoading ? (
            <div className="text-center py-10">Loading units...</div>
          ) : (
            <DataTable columns={columns} data={units} />
          )}
        </div>
      </div>
    </div>
  );
}
