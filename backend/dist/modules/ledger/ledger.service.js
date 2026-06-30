"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerService = void 0;
const supabase_1 = require("../../database/supabase");
const errors_1 = require("../../utils/errors");
exports.ledgerService = {
    async createLedger(companyId, userId, data) {
        // Check for duplicate active ledger name
        const { data: existingName } = await supabase_1.supabase
            .from('Ledgers')
            .select('id')
            .eq('company_id', companyId)
            .eq('name', data.name)
            .eq('is_active', true)
            .single();
        if (existingName) {
            throw new errors_1.BadRequestError('A ledger with this name already exists in this company');
        }
        if (data.code) {
            const { data: existingCode } = await supabase_1.supabase
                .from('Ledgers')
                .select('id')
                .eq('company_id', companyId)
                .eq('code', data.code)
                .eq('is_active', true)
                .single();
            if (existingCode) {
                throw new errors_1.BadRequestError('A ledger with this code already exists in this company');
            }
        }
        const { data: newLedger, error } = await supabase_1.supabase
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
    async getLedgers(companyId, options = {}) {
        let query = supabase_1.supabase
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
    async getLedgerById(companyId, ledgerId) {
        const { data, error } = await supabase_1.supabase
            .from('Ledgers')
            .select('*')
            .eq('id', ledgerId)
            .eq('company_id', companyId)
            .eq('is_active', true)
            .single();
        if (error || !data) {
            throw new errors_1.NotFoundError('Ledger not found');
        }
        return data;
    },
    async updateLedger(companyId, ledgerId, data) {
        // Verify existence
        await this.getLedgerById(companyId, ledgerId);
        // If changing name, check for duplicates
        if (data.name) {
            const { data: existingName } = await supabase_1.supabase
                .from('Ledgers')
                .select('id')
                .eq('company_id', companyId)
                .eq('name', data.name)
                .eq('is_active', true)
                .neq('id', ledgerId)
                .single();
            if (existingName) {
                throw new errors_1.BadRequestError('A ledger with this name already exists in this company');
            }
        }
        if (data.code) {
            const { data: existingCode } = await supabase_1.supabase
                .from('Ledgers')
                .select('id')
                .eq('company_id', companyId)
                .eq('code', data.code)
                .eq('is_active', true)
                .neq('id', ledgerId)
                .single();
            if (existingCode) {
                throw new errors_1.BadRequestError('A ledger with this code already exists in this company');
            }
        }
        const { data: updatedLedger, error } = await supabase_1.supabase
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
    async deleteLedger(companyId, ledgerId) {
        await this.getLedgerById(companyId, ledgerId);
        const { error } = await supabase_1.supabase
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
