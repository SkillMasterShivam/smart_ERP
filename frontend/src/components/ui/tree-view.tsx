'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export interface TreeNode {
  id: string;
  name: string;
  code?: string | null;
  nature?: string;
  children?: TreeNode[];
  is_system?: boolean;
}

interface TreeViewProps {
  data: TreeNode[];
  onDelete?: (id: string) => void;
  basePath: string;
}

const TreeNodeItem = ({ 
  node, 
  level, 
  onDelete, 
  basePath 
}: { 
  node: TreeNode; 
  level: number; 
  onDelete?: (id: string) => void;
  basePath: string;
}) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Open top levels by default
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="w-full">
      <div 
        className={`flex items-center group hover:bg-gray-50 py-1.5 pr-2 rounded-md ${level === 0 ? 'mt-1' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none ${!hasChildren ? 'invisible' : ''}`}
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        <div className="flex items-center flex-1 min-w-0 cursor-pointer select-none" onClick={() => hasChildren && setIsOpen(!isOpen)}>
          {isOpen && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-700 truncate">{node.name}</span>
          {node.code && (
            <span className="ml-2 text-xs text-gray-400">({node.code})</span>
          )}
          {node.nature && (
            <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
              {node.nature}
            </span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${basePath}/${node.id}/edit`} className="flex items-center cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {!node.is_system && onDelete && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={() => onDelete(node.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isOpen && hasChildren && (
        <div className="w-full">
          {node.children!.map((child) => (
            <TreeNodeItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onDelete={onDelete}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView = ({ data, onDelete, basePath }: TreeViewProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg bg-gray-50">
        No groups found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="p-4 bg-gray-50/80 border-b flex font-medium text-sm text-gray-500">
        <div className="flex-1 ml-6">Group Name</div>
        <div className="w-12 text-center">Actions</div>
      </div>
      <div className="p-2 py-3 overflow-x-auto">
        <div className="min-w-[400px]">
          {data.map((node) => (
            <TreeNodeItem 
              key={node.id} 
              node={node} 
              level={0} 
              onDelete={onDelete}
              basePath={basePath}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
