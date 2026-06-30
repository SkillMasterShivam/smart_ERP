import { z } from 'zod';

export const salesVoucherItemSchema = z.object({
  item_id: z.string().uuid('Please select an item'),
  unit_id: z.string().uuid('Please select a unit'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  discount_amount: z.number().min(0).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  tax_amount: z.number().min(0).optional(),
  net_amount: z.number().min(0)
});

export const salesVoucherSchema = z.object({
  reference_number: z.string().max(100).optional().or(z.literal('')),
  voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  party_id: z.string().uuid('Please select a customer'),
  
  subtotal: z.number().min(0),
  discount_amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  grand_total: z.number().min(0),
  
  remarks: z.string().optional().or(z.literal('')),
  
  items: z.array(salesVoucherItemSchema).min(1, 'At least one item is required')
});

export type SalesVoucherInput = z.infer<typeof salesVoucherSchema>;
export type SalesVoucherItemInput = z.infer<typeof salesVoucherItemSchema>;
