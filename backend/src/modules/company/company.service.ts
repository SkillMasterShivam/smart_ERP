import { supabase } from '../../database/supabase';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { CompanyInput } from './company.schema';

export const companyService = {
  async createCompany(userId: string, data: CompanyInput) {
    // Check for duplicate active company name for this user
    const { data: existing } = await supabase
      .from('Companies')
      .select('id')
      .eq('user_id', userId)
      .eq('name', data.name)
      .eq('is_active', true)
      .single();

    if (existing) {
      throw new BadRequestError('You already have an active company with this name');
    }

    // Clean up empty strings for unique constraints if any, though not strictly required here
    const { data: newCompany, error } = await supabase
      .from('Companies')
      .insert([{ 
        ...data, 
        user_id: userId,
        created_by: userId
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return newCompany;
  },

  async getCompanies(userId: string) {
    const { data, error } = await supabase
      .from('Companies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  async getCompanyById(userId: string, companyId: string) {
    const { data, error } = await supabase
      .from('Companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new NotFoundError('Company not found or unauthorized');
    }

    return data;
  },

  async updateCompany(userId: string, companyId: string, data: Partial<CompanyInput>) {
    // Verify ownership first
    await this.getCompanyById(userId, companyId);

    // If changing name, check for duplicates
    if (data.name) {
      const { data: existing } = await supabase
        .from('Companies')
        .select('id')
        .eq('user_id', userId)
        .eq('name', data.name)
        .eq('is_active', true)
        .neq('id', companyId)
        .single();

      if (existing) {
        throw new BadRequestError('You already have another active company with this name');
      }
    }

    const { data: updatedCompany, error } = await supabase
      .from('Companies')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', companyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return updatedCompany;
  },

  async deleteCompany(userId: string, companyId: string) {
    // Verify ownership first
    await this.getCompanyById(userId, companyId);

    // Soft delete
    const { error } = await supabase
      .from('Companies')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', companyId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true };
  }
};
