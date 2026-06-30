'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const ledgerSchema = z.object({
  name: z.string().min(2, 'Ledger name must be at least 2 characters').max(255),
  code: z.string().max(50).optional().or(z.literal('')),
  type: z.enum([
    'Customer', 'Supplier', 'Bank', 'Cash', 'Income', 'Expense', 'Asset', 'Liability', 'Equity', 'Tax', 'Other'
  ]),
  opening_balance: z.number().min(0),
  balance_type: z.enum(['Dr', 'Cr']),
  is_gst_applicable: z.boolean().optional(),
  gst_no: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format')
    .optional()
    .or(z.literal('')),
  pan_no: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .optional()
    .or(z.literal('')),
  contact_person: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

type LedgerFormValues = z.infer<typeof ledgerSchema>;

interface LedgerFormProps {
  initialData?: LedgerFormValues & { id?: string };
  isEdit?: boolean;
}

export function LedgerForm({ initialData, isEdit = false }: LedgerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LedgerFormValues>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: initialData || {
      type: 'Customer',
      balance_type: 'Dr',
      opening_balance: 0,
      country: 'India',
    }
  });

  const onSubmit = async (data: LedgerFormValues) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await apiClient.put(`/ledgers/${initialData.id}`, data);
        toast.success('Ledger updated successfully');
      } else {
        await apiClient.post('/ledgers', data);
        toast.success('Ledger created successfully');
      }
      router.push('/masters/ledgers');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save ledger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Primary details for this ledger.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ledger Name *</Label>
            <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Ledger Code (Optional)</Label>
            <Input id="code" {...register('code')} />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Ledger Type *</Label>
            <select
              id="type"
              {...register('type')}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Bank">Bank Account</option>
              <option value="Cash">Cash Account</option>
              <option value="Income">Direct/Indirect Income</option>
              <option value="Expense">Direct/Indirect Expense</option>
              <option value="Asset">Fixed/Current Asset</option>
              <option value="Liability">Current Liability</option>
              <option value="Equity">Capital / Equity</option>
              <option value="Tax">Duties & Taxes</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opening Balance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="opening_balance">Amount</Label>
            <Input 
              id="opening_balance" 
              type="number" 
              step="0.01" 
              {...register('opening_balance', { valueAsNumber: true })} 
              disabled={isEdit} // Disabling editing opening balance for now to prepare for strict accounting rules
            />
            {errors.opening_balance && <p className="text-sm text-red-500">{errors.opening_balance.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="balance_type">Dr/Cr</Label>
            <select
              id="balance_type"
              {...register('balance_type')}
              disabled={isEdit}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Dr">Debit (Dr)</option>
              <option value="Cr">Credit (Cr)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gst_no">GST Number</Label>
            <Input id="gst_no" {...register('gst_no')} />
            {errors.gst_no && <p className="text-sm text-red-500">{errors.gst_no.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pan_no">PAN Number</Label>
            <Input id="pan_no" {...register('pan_no')} />
            {errors.pan_no && <p className="text-sm text-red-500">{errors.pan_no.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input id="contact_person" {...register('contact_person')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/masters/ledgers">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Ledger' : 'Create Ledger'}
        </Button>
      </div>
    </form>
  );
}
