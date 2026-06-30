'use client';

import { useState, useEffect, useMemo } from 'react';
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

const groupFormSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(255),
  code: z.string().max(50).optional().or(z.literal('')),
  group_type: z.enum(['Accounting', 'Stock']),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  nature: z.enum(['Asset', 'Liability', 'Income', 'Expense', 'None']),
  affects_gross_profit: z.boolean().optional(),
  description: z.string().optional().or(z.literal('')),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  initialData?: any;
  isEdit?: boolean;
}

// Helper to flatten a tree for the parent dropdown
const flattenTree = (nodes: any[], depth = 0, excludeId?: string): any[] => {
  let result: any[] = [];
  for (const node of nodes) {
    // If we are editing, don't allow selecting ourselves or our descendants as parent
    if (excludeId && node.id === excludeId) continue;
    
    result.push({
      id: node.id,
      name: '—'.repeat(depth) + (depth > 0 ? ' ' : '') + node.name,
      nature: node.nature,
      originalNode: node
    });
    
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, depth + 1, excludeId));
    }
  }
  return result;
};

export function GroupForm({ initialData, isEdit = false }: GroupFormProps) {
  const router = useRouter();
  const { activeCompany } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [allGroupsTree, setAllGroupsTree] = useState<any[]>([]);

  useEffect(() => {
    if (activeCompany) {
      // Fetch the tree to populate parent options
      apiClient.get('/groups/tree')
        .then(res => setAllGroupsTree(res.data.data || []))
        .catch(err => console.error('Failed to load group tree', err));
    }
  }, [activeCompany]);

  const flatGroups = useMemo(() => {
    return flattenTree(allGroupsTree, 0, isEdit ? initialData?.id : undefined);
  }, [allGroupsTree, isEdit, initialData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialData || {
      group_type: 'Accounting',
      nature: 'None',
      affects_gross_profit: false,
    }
  });

  const selectedParentId = watch('parent_id');
  
  // Auto-inherit nature if parent changes
  useEffect(() => {
    if (selectedParentId) {
      const parent = flatGroups.find(g => g.id === selectedParentId);
      if (parent && parent.originalNode.nature !== 'None') {
        setValue('nature', parent.originalNode.nature);
      }
    }
  }, [selectedParentId, flatGroups, setValue]);

  const onSubmit = async (data: GroupFormValues) => {
    setIsLoading(true);
    // Convert empty string parent_id to null/undefined
    const payload = {
      ...data,
      parent_id: data.parent_id === '' ? null : data.parent_id
    };

    try {
      if (isEdit && initialData?.id) {
        await apiClient.put(`/groups/${initialData.id}`, payload);
        toast.success('Group updated successfully');
      } else {
        await apiClient.post('/groups', payload);
        toast.success('Group created successfully');
      }
      router.push('/masters/groups');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save group');
    } finally {
      setIsLoading(false);
    }
  };

  const isSystem = initialData?.is_system;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      {isSystem && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>System Group:</strong> This is a default accounting group. Core settings cannot be modified.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
          <CardDescription>Define the structure of this accounting group.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input 
              id="name" 
              {...register('name')} 
              className={errors.name ? 'border-red-500' : ''} 
              disabled={isSystem}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Group Code (Optional)</Label>
            <Input id="code" {...register('code')} disabled={isSystem} />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Under (Parent Group)</Label>
            <select
              id="parent_id"
              {...register('parent_id')}
              disabled={isSystem}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Primary (Top Level) --</option>
              {flatGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nature">Nature of Group</Label>
            <select
              id="nature"
              {...register('nature')}
              disabled={isSystem}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="None">None (Depends on Parent)</option>
              <option value="Asset">Assets</option>
              <option value="Liability">Liabilities</option>
              <option value="Income">Income</option>
              <option value="Expense">Expenses</option>
            </select>
            {errors.nature && <p className="text-sm text-red-500">{errors.nature.message}</p>}
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center space-x-2 mt-4 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('affects_gross_profit')} 
                disabled={isSystem}
                className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-950 disabled:opacity-50"
              />
              <span className="text-sm font-medium leading-none">Affects Gross Profit (Direct Income/Expense)</span>
            </label>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" asChild>
          <Link href="/masters/groups">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading || isSystem}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
}
