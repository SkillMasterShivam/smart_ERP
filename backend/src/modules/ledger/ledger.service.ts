import { supabase } from '../../database/supabase';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { LedgerInput } from './ledger.schema';

export const ledgerService = {
  async createLedger(companyId: string, userId: string, data: LedgerInput) {
    // Check for duplicate active ledger name
    const { data: existingName } = await supabase
      .from('Ledgers')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', data.name)
      .eq('is_active', true)
      .single();

    if (existingName) {
      throw new BadRequestError('A ledger with this name already exists in this company');
    }

    if (data.code) {
      const { data: existingCode } = await supabase
        .from('Ledgers')
        .select('id')
        .eq('company_id', companyId)
        .eq('code', data.code)
        .eq('is_active', true)
        .single();

      if (existingCode) {
        throw new BadRequestError('A ledger with this code already exists in this company');
      }
    }

    const { data: newLedger, error } = await supabase
      .from('Ledgers')
      .insert([{ 
        ...data, 
        company_id: companyId,
        created_by: userId
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return newLedger;
  },

  async getLedgers(companyId: string, options: { search?: string, limit?: number, offset?: number } = {}) {
    let query = supabase
      .from('Ledgers')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
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

  async getLedgerById(companyId: string, ledgerId: string) {
    const { data, error } = await supabase
      .from('Ledgers')
      .select('*')
      .eq('id', ledgerId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundError('Ledger not found');
    }

    return data;
  },

  async updateLedger(companyId: string, ledgerId: string, data: Partial<LedgerInput>) {
    // Verify existence
    await this.getLedgerById(companyId, ledgerId);

    // If changing name, check for duplicates
    if (data.name) {
      const { data: existingName } = await supabase
        .from('Ledgers')
        .select('id')
        .eq('company_id', companyId)
        .eq('name', data.name)
        .eq('is_active', true)
        .neq('id', ledgerId)
        .single();

      if (existingName) {
        throw new BadRequestError('A ledger with this name already exists in this company');
      }
    }

    if (data.code) {
      const { data: existingCode } = await supabase
        .from('Ledgers')
        .select('id')
        .eq('company_id', companyId)
        .eq('code', data.code)
        .eq('is_active', true)
        .neq('id', ledgerId)
        .single();

      if (existingCode) {
        throw new BadRequestError('A ledger with this code already exists in this company');
      }
    }

    const { data: updatedLedger, error } = await supabase
      .from('Ledgers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', ledgerId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return updatedLedger;
  },

  async deleteLedger(companyId: string, ledgerId: string) {
    await this.getLedgerById(companyId, ledgerId);

    const { error } = await supabase
      .from('Ledgers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', ledgerId)
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true };
  }
};
