'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';

const itemFormSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(255),
  sku: z.string().min(2, 'SKU is required').max(100),
  hsn_code: z.string().max(50).optional().or(z.literal('')),
  barcode: z.string().max(255).optional().or(z.literal('')),
  
  group_id: z.string().uuid('Please select a stock group'),
  unit_id: z.string().uuid('Please select a unit of measure'),
  
  purchase_price: z.number().min(0),
  selling_price: z.number().min(0),
  gst_percentage: z.number().min(0).max(100),
  
  opening_quantity: z.number().min(0),
  opening_value: z.number().min(0),
  
  min_stock_level: z.number().min(0),
  max_stock_level: z.number().min(0),
  reorder_level: z.number().min(0),
  
  description: z.string().optional().or(z.literal(''))
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ItemForm({ initialData, isEdit = false }: ItemFormProps) {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    if (activeCompany) {
      // Fetch Stock Groups
      apiClient.get('/groups?type=Stock')
        .then(res => setGroups(res.data.data || []))
        .catch(err => console.error('Failed to load groups', err));
        
      // Fetch Units
      apiClient.get('/inventory/units')
        .then(res => setUnits(res.data.data || []))
        .catch(err => console.error('Failed to load units', err));
    }
  }, [activeCompany]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: initialData || {
      purchase_price: 0,
      selling_price: 0,
      gst_percentage: 0,
      opening_quantity: 0,
      opening_value: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      reorder_level: 0,
    }
  });

  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await apiClient.put(`/inventory/items/${initialData.id}`, data);
        toast.success('Item updated successfully');
      } else {
        await apiClient.post('/inventory/items', data);
        toast.success('Item created successfully');
      }
      router.push('/masters/inventory');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto">
      
      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Primary details for this stock item.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sku">SKU / Item Code *</Label>
            <Input id="sku" {...register('sku')} className={errors.sku ? 'border-red-500' : ''} />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_id">Stock Group *</Label>
            <select
              id="group_id"
              {...register('group_id')}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${errors.group_id ? 'border-red-500' : 'border-slate-200'}`}
            >
              <option value="">-- Select Group --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {errors.group_id && <p className="text-sm text-red-500">{errors.group_id.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit_id">Unit of Measure *</Label>
            <select
              id="unit_id"
              {...register('unit_id')}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${errors.unit_id ? 'border-red-500' : 'border-slate-200'}`}
            >
              <option value="">-- Select Unit --</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.formal_name})</option>
              ))}
            </select>
            {errors.unit_id && <p className="text-sm text-red-500">{errors.unit_id.message}</p>}
            <p className="text-xs text-gray-400">
              Need a new unit? <Link href="/masters/units" className="text-blue-500 underline">Manage Units</Link>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsn_code">HSN / SAC Code</Label>
            <Input id="hsn_code" {...register('hsn_code')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" {...register('barcode')} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Taxation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Standard Purchase Price</Label>
            <Input id="purchase_price" type="number" step="0.01" {...register('purchase_price', { valueAsNumber: true })} />
            {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selling_price">Standard Selling Price</Label>
            <Input id="selling_price" type="number" step="0.01" {...register('selling_price', { valueAsNumber: true })} />
            {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_percentage">GST Percentage (%)</Label>
            <Input id="gst_percentage" type="number" step="0.1" {...register('gst_percentage', { valueAsNumber: true })} />
            {errors.gst_percentage && <p className="text-sm text-red-500">{errors.gst_percentage.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels & Opening Stock</CardTitle>
          <CardDescription>Only set opening stock if there are no existing transactions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="opening_quantity">Opening Quantity</Label>
            <Input id="opening_quantity" type="number" step="0.0001" {...register('opening_quantity', { valueAsNumber: true })} disabled={isEdit} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="opening_value">Opening Value (Total)</Label>
            <Input id="opening_value" type="number" step="0.01" {...register('opening_value', { valueAsNumber: true })} disabled={isEdit} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorder_level">Reorder Level (Alert threshold)</Label>
            <Input id="reorder_level" type="number" step="0.0001" {...register('reorder_level', { valueAsNumber: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
            <Input id="min_stock_level" type="number" step="0.0001" {...register('min_stock_level', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pb-10">
        <Button variant="outline" type="button" asChild>
          <Link href="/masters/inventory">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
