import { supabase } from '../../database/supabase';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { GroupInput } from './group.schema';

export const groupService = {
  
  // Recursively fetch all ancestors to detect circular references
  async _checkCircularReference(companyId: string, groupId: string, prospectiveParentId: string): Promise<void> {
    if (groupId === prospectiveParentId) {
      throw new BadRequestError('A group cannot be its own parent');
    }

    let currentParentId: string | null = prospectiveParentId;
    
    // Safety break at 50 depth to prevent infinite loop just in case
    let depth = 0;
    while (currentParentId && depth < 50) {
      const response: any = await supabase
        .from('Groups')
        .select('parent_id')
        .eq('id', currentParentId)
        .eq('company_id', companyId)
        .single();
        
      if (!response.data) break;
      const data: any = response.data;
      
      if (data.parent_id === groupId) {
        throw new BadRequestError('Circular reference detected. Cannot set this parent as it is a descendant of the current group.');
      }
      
      currentParentId = data.parent_id;
      depth++;
    }
  },

  async createGroup(companyId: string, userId: string, data: GroupInput) {
    // Check for duplicate active group name
    const { data: existingName } = await supabase
      .from('Groups')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', data.name)
      .eq('is_active', true)
      .single();

    if (existingName) {
      throw new BadRequestError('A group with this name already exists in this company');
    }

    // If parent_id provided, ensure it exists and matches nature if needed
    if (data.parent_id) {
      const { data: parentData, error: parentError } = await supabase
        .from('Groups')
        .select('id, nature')
        .eq('id', data.parent_id)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (parentError || !parentData) {
        throw new BadRequestError('Selected parent group does not exist or is inactive');
      }
      
      // Inherit nature from parent if not explicitly 'None' logic can be added here
      // For now we enforce user input or trust the frontend
    }

    const { data: newGroup, error } = await supabase
      .from('Groups')
      .insert([{ 
        ...data, 
        company_id: companyId,
        created_by: userId,
        is_system: false // Always false for user created groups
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return newGroup;
  },

  async getGroups(companyId: string, options: { search?: string, limit?: number, offset?: number, type?: string } = {}) {
    let query = supabase
      .from('Groups')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options.type) {
      query = query.eq('group_type', options.type);
    }

    if (options.limit !== undefined && options.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      data,
      total: count || 0
    };
  },
  
  async getGroupTree(companyId: string, groupType: string = 'Accounting') {
    // Fetch all active groups for the company of the specified type
    const { data: allGroups, error } = await supabase
      .from('Groups')
      .select('*')
      .eq('company_id', companyId)
      .eq('group_type', groupType)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Build hierarchy in memory (O(N) operation)
    const map = new Map<string, any>();
    const roots: any[] = [];

    // First pass: initialize map
    allGroups.forEach(group => {
      map.set(group.id, { ...group, children: [] });
    });

    // Second pass: construct tree
    allGroups.forEach(group => {
      if (group.parent_id && map.has(group.parent_id)) {
        map.get(group.parent_id).children.push(map.get(group.id));
      } else {
        roots.push(map.get(group.id));
      }
    });

    return roots;
  },

  async getGroupById(companyId: string, groupId: string) {
    const { data, error } = await supabase
      .from('Groups')
      .select('*')
      .eq('id', groupId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundError('Group not found');
    }

    return data;
  },

  async updateGroup(companyId: string, groupId: string, data: Partial<GroupInput>) {
    // Verify existence
    const existingGroup = await this.getGroupById(companyId, groupId);

    // Prevent modification of system groups
    if (existingGroup.is_system) {
      throw new ForbiddenError('System groups cannot be modified');
    }

    // Circular reference check
    if (data.parent_id) {
      await this._checkCircularReference(companyId, groupId, data.parent_id);
    }

    // Duplicate check
    if (data.name) {
      const { data: existingName } = await supabase
        .from('Groups')
        .select('id')
        .eq('company_id', companyId)
        .eq('name', data.name)
        .eq('is_active', true)
        .neq('id', groupId)
        .single();

      if (existingName) {
        throw new BadRequestError('A group with this name already exists in this company');
      }
    }

    const { data: updatedGroup, error } = await supabase
      .from('Groups')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return updatedGroup;
  },

  async deleteGroup(companyId: string, groupId: string) {
    const existingGroup = await this.getGroupById(companyId, groupId);

    if (existingGroup.is_system) {
      throw new ForbiddenError('System groups cannot be deleted');
    }

    // Check if it has active children
    const { data: children } = await supabase
      .from('Groups')
      .select('id')
      .eq('parent_id', groupId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(1);

    if (children && children.length > 0) {
      throw new BadRequestError('Cannot delete group because it has active child groups. Reassign or delete children first.');
    }

    // Future: Check if ledgers are attached to this group (once ledgers are integrated)

    const { error } = await supabase
      .from('Groups')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true };
  }
};
