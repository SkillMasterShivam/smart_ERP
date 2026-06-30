import { z } from 'zod';

export const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(50),
  formal_name: z.string().max(255).optional().or(z.literal('')),
  number_of_decimal_places: z.number().int().min(0).max(4).default(0)
});

export const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(255),
  sku: z.string().min(2, 'SKU is required').max(100),
  hsn_code: z.string().max(50).optional().or(z.literal('')),
  barcode: z.string().max(255).optional().or(z.literal('')),
  
  group_id: z.string().uuid('Invalid group selected'),
  unit_id: z.string().uuid('Invalid unit selected'),
  
  purchase_price: z.number().min(0).default(0),
  selling_price: z.number().min(0).default(0),
  gst_percentage: z.number().min(0).max(100).default(0),
  
  opening_quantity: z.number().min(0).default(0),
  opening_value: z.number().min(0).default(0),
  
  min_stock_level: z.number().min(0).default(0),
  max_stock_level: z.number().min(0).default(0),
  reorder_level: z.number().min(0).default(0),
  
  description: z.string().optional().or(z.literal(''))
});

export type UnitInput = z.infer<typeof unitSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
