'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import { useCompany } from '@/context/CompanyContext';
import { TreeView, TreeNode } from '@/components/ui/tree-view';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, List, Network } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupsPage() {
  const { activeCompany } = useCompany();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [flatData, setFlatData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeCompany) {
      fetchGroups();
    }
  }, [activeCompany]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // Fetch Tree
      const treeRes = await apiClient.get('/groups/tree');
      setTreeData(treeRes.data.data || []);
      
      // Fetch Flat
      const flatRes = await apiClient.get('/groups');
      setFlatData(flatRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch groups', error);
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this group?')) return;
    try {
      await apiClient.delete(`/groups/${id}`);
      toast.success('Group archived successfully');
      fetchGroups(); // Refresh both views
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to archive group');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Group Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 flex items-center">
          {row.original.name}
          {row.original.is_system && (
            <Badge variant="secondary" className="ml-2 text-[10px] h-5">System</Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'nature',
      header: 'Nature',
      cell: ({ row }) => (
        <span className="text-gray-500">{row.original.nature !== 'None' ? row.original.nature : '-'}</span>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/masters/groups/${row.original.id}/edit`}>
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
          <h1 className="text-2xl font-bold tracking-tight">Accounting Groups</h1>
          <p className="text-sm text-gray-500">Manage your chart of accounts hierarchy.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 p-1 rounded-md border">
            <button 
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm flex items-center transition-colors ${viewMode === 'tree' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Network className="w-4 h-4 mr-2" />
              Hierarchy
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm flex items-center transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </button>
          </div>
          <Button asChild>
            <Link href="/masters/groups/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading groups...</div>
      ) : viewMode === 'tree' ? (
        <TreeView data={treeData} onDelete={handleDelete} basePath="/masters/groups" />
      ) : (
        <DataTable columns={columns} data={flatData} />
      )}
    </div>
  );
}
