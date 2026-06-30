import { supabase } from '../../database/supabase';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { PurchaseVoucherInput } from './purchase.schema';

export const purchaseService = {
  
  async generateVoucherNumber(companyId: string): Promise<string> {
    // Generate a simple auto-incrementing number for the company based on existing count
    // In a full production app, this would use a sequence table or year-based format.
    const { count } = await supabase
      .from('Vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('voucher_type', 'Purchase');
      
    const nextNum = (count || 0) + 1;
    return `PUR-${new Date().getFullYear()}-${nextNum.toString().padStart(4, '0')}`;
  },

  async createVoucher(companyId: string, userId: string, data: PurchaseVoucherInput) {
    // 1. Verify Supplier
    const { data: supplier } = await supabase
      .from('Ledgers')
      .select('id')
      .eq('id', data.party_id)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    if (!supplier) throw new BadRequestError('Supplier not found or inactive');

    const voucherNumber = await this.generateVoucherNumber(companyId);

    // 2. We use Supabase JS client to insert Voucher and Items. 
    // Since we are inserting into multiple tables, we should ideally use a transaction or RPC.
    // We will do a manual 2-step insert here because Draft creation does not mutate inventory. 
    // If step 2 fails, we should rollback step 1.

    // Insert Voucher Header
    const { data: voucher, error: vError } = await supabase
      .from('Vouchers')
      .insert([{
        company_id: companyId,
        voucher_type: 'Purchase',
        voucher_number: voucherNumber,
        reference_number: data.reference_number,
        voucher_date: data.voucher_date,
        party_id: data.party_id,
        status: 'Draft',
        subtotal: data.subtotal,
        discount_amount: data.discount_amount,
        tax_amount: data.tax_amount,
        grand_total: data.grand_total,
        remarks: data.remarks,
        created_by: userId
      }])
      .select()
      .single();

    if (vError) throw new Error(`Failed to create voucher header: ${vError.message}`);

    // Insert Items
    const itemsData = data.items.map(item => ({
      voucher_id: voucher.id,
      item_id: item.item_id,
      unit_id: item.unit_id,
      quantity: item.quantity,
      rate: item.rate,
      discount_amount: item.discount_amount || 0,
      tax_percentage: item.tax_percentage || 0,
      tax_amount: item.tax_amount || 0,
      net_amount: item.net_amount
    }));

    const { error: iError } = await supabase
      .from('Voucher_Items')
      .insert(itemsData);

    if (iError) {
      // Manual rollback if items fail
      await supabase.from('Vouchers').delete().eq('id', voucher.id);
      throw new Error(`Failed to create voucher items: ${iError.message}`);
    }

    return voucher;
  },

  async getVouchers(companyId: string, options: { search?: string, status?: string, limit?: number, offset?: number } = {}) {
    let query = supabase
      .from('Vouchers')
      .select(`
        *,
        party:Ledgers(id, name)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .eq('voucher_type', 'Purchase')
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.search) {
      query = query.or(`voucher_number.ilike.%${options.search}%,reference_number.ilike.%${options.search}%`);
    }

    if (options.limit !== undefined && options.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw new Error(`Database error: ${error.message}`);
    
    return { data, total: count || 0 };
  },

  async getVoucherById(companyId: string, voucherId: string) {
    const { data: voucher, error } = await supabase
      .from('Vouchers')
      .select(`
        *,
        party:Ledgers(id, name),
        items:Voucher_Items(
          *,
          item:Items(id, name, sku),
          unit:Units(id, name)
        )
      `)
      .eq('id', voucherId)
      .eq('company_id', companyId)
      .eq('voucher_type', 'Purchase')
      .single();

    if (error || !voucher) throw new NotFoundError('Voucher not found');
    return voucher;
  },

  async updateDraftVoucher(companyId: string, voucherId: string, data: PurchaseVoucherInput) {
    // 1. Verify existing voucher is Draft
    const existing = await this.getVoucherById(companyId, voucherId);
    if (existing.status !== 'Draft') {
      throw new BadRequestError('Only Draft vouchers can be edited');
    }

    // 2. Update Header
    const { error: vError } = await supabase
      .from('Vouchers')
      .update({
        reference_number: data.reference_number,
        voucher_date: data.voucher_date,
        party_id: data.party_id,
        subtotal: data.subtotal,
        discount_amount: data.discount_amount,
        tax_amount: data.tax_amount,
        grand_total: data.grand_total,
        remarks: data.remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', voucherId);
      
    if (vError) throw new Error(`Failed to update header: ${vError.message}`);

    // 3. Delete old items and insert new ones
    await supabase.from('Voucher_Items').delete().eq('voucher_id', voucherId);

    const itemsData = data.items.map(item => ({
      voucher_id: voucherId,
      item_id: item.item_id,
      unit_id: item.unit_id,
      quantity: item.quantity,
      rate: item.rate,
      discount_amount: item.discount_amount || 0,
      tax_percentage: item.tax_percentage || 0,
      tax_amount: item.tax_amount || 0,
      net_amount: item.net_amount
    }));

    const { error: iError } = await supabase
      .from('Voucher_Items')
      .insert(itemsData);

    if (iError) throw new Error(`Failed to update items: ${iError.message}`);

    return { success: true };
  },

  async postVoucher(companyId: string, voucherId: string, userId: string) {
    const existing = await this.getVoucherById(companyId, voucherId);
    if (existing.status !== 'Draft') {
      throw new BadRequestError('Only Draft vouchers can be posted');
    }

    // Call Supabase RPC
    const { data, error } = await supabase.rpc('post_purchase_voucher', {
      p_voucher_id: voucherId,
      p_user_id: userId
    });

    if (error) throw new Error(`Transaction failed: ${error.message}`);
    return { success: true };
  },

  async cancelVoucher(companyId: string, voucherId: string, userId: string) {
    const existing = await this.getVoucherById(companyId, voucherId);
    if (existing.status !== 'Posted') {
      throw new BadRequestError('Only Posted vouchers can be cancelled to reverse inventory');
    }

    // Call Supabase RPC
    const { data, error } = await supabase.rpc('cancel_purchase_voucher', {
      p_voucher_id: voucherId,
      p_user_id: userId
    });

    if (error) throw new Error(`Cancellation failed: ${error.message}`);
    return { success: true };
  }
};
