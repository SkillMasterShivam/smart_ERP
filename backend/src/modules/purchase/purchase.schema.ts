import { z } from 'zod';

export const purchaseVoucherItemSchema = z.object({
  item_id: z.string().uuid('Invalid item selected'),
  unit_id: z.string().uuid('Invalid unit selected'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  discount_amount: z.number().min(0).default(0),
  tax_percentage: z.number().min(0).max(100).default(0),
  tax_amount: z.number().min(0).default(0),
  net_amount: z.number().min(0)
});

export const purchaseVoucherSchema = z.object({
  reference_number: z.string().max(100).optional().or(z.literal('')),
  voucher_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  party_id: z.string().uuid('Please select a supplier'),
  
  subtotal: z.number().min(0),
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  grand_total: z.number().min(0),
  
  remarks: z.string().optional().or(z.literal('')),
  
  items: z.array(purchaseVoucherItemSchema).min(1, 'At least one item is required')
});

export type PurchaseVoucherInput = z.infer<typeof purchaseVoucherSchema>;
export type PurchaseVoucherItemInput = z.infer<typeof purchaseVoucherItemSchema>;
