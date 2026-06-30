'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCompany } from '@/context/CompanyContext';

const itemSchema = z.object({
  item_id: z.string().uuid('Please select an item'),
  unit_id: z.string().uuid('Please select a unit'),
  quantity: z.number().positive('Quantity must be > 0'),
  rate: z.number().min(0),
  discount_amount: z.number().min(0).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  tax_amount: z.number().min(0).optional(),
  net_amount: z.number().min(0)
});

const voucherSchema = z.object({
  reference_number: z.string().max(100).optional(),
  voucher_date: z.string(),
  party_id: z.string().uuid('Please select a supplier'),
  
  subtotal: z.number().min(0),
  discount_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  grand_total: z.number().min(0),
  
  remarks: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required')
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

interface PurchaseFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function PurchaseForm({ initialData, isEdit = false }: PurchaseFormProps) {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  
  // Master data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    if (activeCompany) {
      // Assuming 'Sundry Creditors' or similar are fetched here
      apiClient.get('/ledgers')
        .then(res => setSuppliers(res.data.data.filter((l: any) => l.type === 'Sundry Creditors' || l.group?.name?.includes('Creditor'))))
        .catch(console.error);

      apiClient.get('/inventory/items')
        .then(res => setInventoryItems(res.data.data || []))
        .catch(console.error);
    }
  }, [activeCompany]);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: initialData || {
      voucher_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
      items: [{
        item_id: '', unit_id: '', quantity: 1, rate: 0, discount_amount: 0, tax_percentage: 0, tax_amount: 0, net_amount: 0
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchDiscount = watch('discount_amount') || 0;

  // Auto calculate line totals and grand totals
  useEffect(() => {
    let newSubtotal = 0;
    let newTaxTotal = 0;

    watchItems.forEach((item, index) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const itemDisc = Number(item.discount_amount) || 0;
      const taxPct = Number(item.tax_percentage) || 0;

      const baseAmount = (qty * rate) - itemDisc;
      const taxAmt = baseAmount * (taxPct / 100);
      const net = baseAmount + taxAmt;

      // Update line level calculated fields if they differ to prevent infinite loops
      if (item.tax_amount !== taxAmt) setValue(`items.${index}.tax_amount`, taxAmt, { shouldValidate: false });
      if (item.net_amount !== net) setValue(`items.${index}.net_amount`, net, { shouldValidate: false });

      newSubtotal += baseAmount;
      newTaxTotal += taxAmt;
    });

    const newGrandTotal = newSubtotal + newTaxTotal - watchDiscount;

    setValue('subtotal', newSubtotal);
    setValue('tax_amount', newTaxTotal);
    setValue('grand_total', newGrandTotal);
  }, [JSON.stringify(watchItems), watchDiscount, setValue]);

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = inventoryItems.find(i => i.id === itemId);
    if (selectedItem) {
      setValue(`items.${index}.unit_id`, selectedItem.unit_id);
      setValue(`items.${index}.rate`, selectedItem.purchase_price || 0);
      setValue(`items.${index}.tax_percentage`, selectedItem.gst_percentage || 0);
    }
  };

  const onSubmit = async (data: VoucherFormValues) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await apiClient.put(`/purchases/${initialData.id}`, data);
        toast.success('Draft updated successfully');
      } else {
        await apiClient.post('/purchases', data);
        toast.success('Purchase voucher created as Draft');
      }
      router.push('/transactions/purchases');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const isPosted = initialData?.status === 'Posted' || initialData?.status === 'Cancelled';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isPosted && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-yellow-700">
          This voucher has been {initialData?.status} and cannot be edited.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voucher Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="party_id">Supplier *</Label>
                <select
                  id="party_id"
                  disabled={isPosted}
                  {...register('party_id')}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.party_id && <p className="text-sm text-red-500">{errors.party_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucher_date">Date *</Label>
                <Input type="date" id="voucher_date" disabled={isPosted} {...register('voucher_date')} />
                {errors.voucher_date && <p className="text-sm text-red-500">{errors.voucher_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number">Supplier Invoice No.</Label>
                <Input id="reference_number" disabled={isPosted} {...register('reference_number')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Items</CardTitle>
              {!isPosted && (
                <Button type="button" variant="outline" size="sm" onClick={() => append({ item_id: '', unit_id: '', quantity: 1, rate: 0, discount_amount: 0, tax_percentage: 0, tax_amount: 0, net_amount: 0 })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {errors.items?.root && <p className="text-sm text-red-500 mb-4">{errors.items.root.message}</p>}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 w-24">Qty</th>
                      <th className="px-4 py-3 w-32">Rate</th>
                      <th className="px-4 py-3 w-24">GST %</th>
                      <th className="px-4 py-3 text-right w-32">Amount</th>
                      {!isPosted && <th className="px-4 py-3 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="border-b">
                        <td className="p-2">
                          <select
                            disabled={isPosted}
                            {...register(`items.${index}.item_id`)}
                            onChange={(e) => {
                              register(`items.${index}.item_id`).onChange(e);
                              handleItemSelect(index, e.target.value);
                            }}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:opacity-50"
                          >
                            <option value="">-- Item --</option>
                            {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <Input type="number" step="0.0001" disabled={isPosted} {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                        </td>
                        <td className="p-2">
                          <Input type="number" step="0.01" disabled={isPosted} {...register(`items.${index}.rate`, { valueAsNumber: true })} />
                        </td>
                        <td className="p-2">
                          <Input type="number" step="0.1" disabled={isPosted} {...register(`items.${index}.tax_percentage`, { valueAsNumber: true })} />
                        </td>
                        <td className="p-2 text-right align-middle font-medium">
                          ₹{watchItems[index]?.net_amount?.toFixed(2) || '0.00'}
                        </td>
                        {!isPosted && (
                          <td className="p-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-0 h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks / Notes</Label>
            <Input id="remarks" disabled={isPosted} {...register('remarks')} />
          </div>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Voucher Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">₹{watch('subtotal')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Global Discount</span>
                <div className="w-24">
                  <Input type="number" step="0.01" disabled={isPosted} {...register('discount_amount', { valueAsNumber: true })} className="h-8 text-right" />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax Amount (GST)</span>
                <span className="font-medium">₹{watch('tax_amount')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between">
                <span className="font-semibold text-lg">Grand Total</span>
                <span className="font-bold text-lg text-primary">₹{watch('grand_total')?.toFixed(2) || '0.00'}</span>
              </div>
            </CardContent>
            {!isPosted && (
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update Draft' : 'Save as Draft'}
                </Button>
                <Button variant="outline" type="button" className="w-full" asChild>
                  <Link href="/transactions/purchases">Cancel</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}
