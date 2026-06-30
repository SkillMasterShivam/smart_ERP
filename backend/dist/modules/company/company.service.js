"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const supabase_1 = require("../../database/supabase");
const errors_1 = require("../../utils/errors");
exports.companyService = {
    async createCompany(userId, data) {
        // Check for duplicate active company name for this user
        const { data: existing } = await supabase_1.supabase
            .from('Companies')
            .select('id')
            .eq('user_id', userId)
            .eq('name', data.name)
            .eq('is_active', true)
            .single();
        if (existing) {
            throw new errors_1.BadRequestError('You already have an active company with this name');
        }
        // Clean up empty strings for unique constraints if any, though not strictly required here
        const { data: newCompany, error } = await supabase_1.supabase
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
    async getCompanies(userId) {
        const { data, error } = await supabase_1.supabase
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
    async getCompanyById(userId, companyId) {
        const { data, error } = await supabase_1.supabase
            .from('Companies')
            .select('*')
            .eq('id', companyId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();
        if (error || !data) {
            throw new errors_1.NotFoundError('Company not found or unauthorized');
        }
        return data;
    },
    async updateCompany(userId, companyId, data) {
        // Verify ownership first
        await this.getCompanyById(userId, companyId);
        // If changing name, check for duplicates
        if (data.name) {
            const { data: existing } = await supabase_1.supabase
                .from('Companies')
                .select('id')
                .eq('user_id', userId)
                .eq('name', data.name)
                .eq('is_active', true)
                .neq('id', companyId)
                .single();
            if (existing) {
                throw new errors_1.BadRequestError('You already have another active company with this name');
            }
        }
        const { data: updatedCompany, error } = await supabase_1.supabase
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
    async deleteCompany(userId, companyId) {
        // Verify ownership first
        await this.getCompanyById(userId, companyId);
        // Soft delete
        const { error } = await supabase_1.supabase
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
