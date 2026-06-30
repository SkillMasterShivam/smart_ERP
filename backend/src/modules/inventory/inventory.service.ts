import { supabase } from '../../database/supabase';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { UnitInput, ItemInput } from './inventory.schema';

export const unitService = {
  async createUnit(companyId: string, userId: string, data: UnitInput) {
    const { data: existingName } = await supabase
      .from('Units')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', data.name)
      .eq('is_active', true)
      .single();

    if (existingName) {
      throw new BadRequestError('A unit with this name already exists');
    }

    const { data: unit, error } = await supabase
      .from('Units')
      .insert([{ ...data, company_id: companyId, created_by: userId }])
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return unit;
  },

  async getUnits(companyId: string) {
    const { data, error } = await supabase
      .from('Units')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  },

  async getUnitById(companyId: string, unitId: string) {
    const { data, error } = await supabase
      .from('Units')
      .select('*')
      .eq('id', unitId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new NotFoundError('Unit not found');
    return data;
  },

  async updateUnit(companyId: string, unitId: string, data: Partial<UnitInput>) {
    await this.getUnitById(companyId, unitId);

    if (data.name) {
      const { data: existingName } = await supabase
        .from('Units')
        .select('id')
        .eq('company_id', companyId)
        .eq('name', data.name)
        .eq('is_active', true)
        .neq('id', unitId)
        .single();

      if (existingName) {
        throw new BadRequestError('A unit with this name already exists');
      }
    }

    const { data: unit, error } = await supabase
      .from('Units')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', unitId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return unit;
  },

  async deleteUnit(companyId: string, unitId: string) {
    await this.getUnitById(companyId, unitId);

    // Check if unit is in use by any items
    const { data: items } = await supabase
      .from('Items')
      .select('id')
      .eq('unit_id', unitId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(1);

    if (items && items.length > 0) {
      throw new BadRequestError('Cannot delete unit because it is used by active items.');
    }

    const { error } = await supabase
      .from('Units')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', unitId)
      .eq('company_id', companyId);

    if (error) throw new Error(`Database error: ${error.message}`);
    return { success: true };
  }
};

export const itemService = {
  async createItem(companyId: string, userId: string, data: ItemInput) {
    // Validate SKU uniqueness
    const { data: existingSku } = await supabase
      .from('Items')
      .select('id')
      .eq('company_id', companyId)
      .eq('sku', data.sku)
      .eq('is_active', true)
      .single();

    if (existingSku) throw new BadRequestError('An item with this SKU already exists');

    // Validate Group
    const { data: group } = await supabase
      .from('Groups')
      .select('id, group_type')
      .eq('id', data.group_id)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (!group) throw new BadRequestError('Selected group does not exist');
    if (group.group_type !== 'Stock') throw new BadRequestError('Items can only belong to Stock groups');

    // Validate Unit
    await unitService.getUnitById(companyId, data.unit_id);

    // Opening quantity sets current quantity at inception
    const initialQuantity = data.opening_quantity;

    const { data: item, error } = await supabase
      .from('Items')
      .insert([{ 
        ...data, 
        current_quantity: initialQuantity,
        company_id: companyId, 
        created_by: userId 
      }])
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return item;
  },

  async getItems(companyId: string, options: { search?: string, limit?: number, offset?: number, lowStockOnly?: boolean } = {}) {
    let query = supabase
      .from('Items')
      .select(`
        *,
        group:Groups(id, name),
        unit:Units(id, name, formal_name)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`);
    }

    if (options.limit !== undefined && options.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw new Error(`Database error: ${error.message}`);
    
    let filteredData = data;
    
    // JS filter for low stock since Supabase complex comparisons on same row columns are tricky
    if (options.lowStockOnly) {
      filteredData = data.filter(item => item.current_quantity <= item.reorder_level);
    }

    return {
      data: filteredData,
      total: count || 0
    };
  },

  async getItemById(companyId: string, itemId: string) {
    const { data, error } = await supabase
      .from('Items')
      .select(`
        *,
        group:Groups(id, name),
        unit:Units(id, name, formal_name)
      `)
      .eq('id', itemId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new NotFoundError('Item not found');
    return data;
  },

  async updateItem(companyId: string, itemId: string, data: Partial<ItemInput>) {
    await this.getItemById(companyId, itemId);

    if (data.sku) {
      const { data: existingSku } = await supabase
        .from('Items')
        .select('id')
        .eq('company_id', companyId)
        .eq('sku', data.sku)
        .eq('is_active', true)
        .neq('id', itemId)
        .single();

      if (existingSku) throw new BadRequestError('An item with this SKU already exists');
    }

    if (data.group_id) {
      const { data: group } = await supabase
        .from('Groups')
        .select('id, group_type')
        .eq('id', data.group_id)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (!group) throw new BadRequestError('Selected group does not exist');
      if (group.group_type !== 'Stock') throw new BadRequestError('Items can only belong to Stock groups');
    }

    if (data.unit_id) {
      await unitService.getUnitById(companyId, data.unit_id);
    }
    
    // We strictly do NOT update current_quantity here (that's for voucher logic)
    // However, if the opening_quantity is updated, we theoretically should adjust the current_quantity by the diff.
    // For simplicity in Day 8 foundation, we will allow updating opening_quantity directly only if no transactions exist.
    // That validation will be enforced when Vouchers are introduced.

    const { data: item, error } = await supabase
      .from('Items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return item;
  },

  async deleteItem(companyId: string, itemId: string) {
    await this.getItemById(companyId, itemId);
    
    // In the future, check if item is used in any active vouchers

    const { error } = await supabase
      .from('Items')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('company_id', companyId);

    if (error) throw new Error(`Database error: ${error.message}`);
    return { success: true };
  }
};
