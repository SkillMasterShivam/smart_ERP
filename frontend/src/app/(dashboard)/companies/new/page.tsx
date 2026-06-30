'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import { useCompany } from '@/context/CompanyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  business_type: z.string().max(100).optional(),
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
  fy_start: z.string().min(1, 'Financial Year Start is required'),
  state: z.string().max(100).optional(),
  country: z.string().max(100),
  address: z.string().optional(),
  pincode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  currency: z.string().max(10),
  timezone: z.string().max(50),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { refreshCompanies, selectCompany } = useCompany();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    }
  });

  const onSubmit = async (data: CompanyForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/companies', data);
      toast.success('Company created successfully');
      await refreshCompanies();
      // Auto-select the newly created company
      selectCompany(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create company');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Company</h1>
        <Button variant="outline" asChild>
          <Link href="/companies">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Enter the primary information for your new company.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Input id="business_type" placeholder="e.g. IT Services, Retail" {...register('business_type')} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gst_no">GST Number</Label>
              <Input id="gst_no" {...register('gst_no')} className={errors.gst_no ? 'border-red-500' : ''} />
              {errors.gst_no && <p className="text-sm text-red-500">{errors.gst_no.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan_no">PAN Number</Label>
              <Input id="pan_no" {...register('pan_no')} className={errors.pan_no ? 'border-red-500' : ''} />
              {errors.pan_no && <p className="text-sm text-red-500">{errors.pan_no.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fy_start">Financial Year Start *</Label>
              <Input id="fy_start" type="date" {...register('fy_start')} className={errors.fy_start ? 'border-red-500' : ''} />
              {errors.fy_start && <p className="text-sm text-red-500">{errors.fy_start.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Company'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
