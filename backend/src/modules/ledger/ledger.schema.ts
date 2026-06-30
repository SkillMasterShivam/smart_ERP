import { z } from 'zod';

export const LedgerTypeEnum = z.enum([
  'Customer',
  'Supplier',
  'Bank',
  'Cash',
  'Income',
  'Expense',
  'Asset',
  'Liability',
  'Equity',
  'Tax',
  'Other'
]);

export const BalanceTypeEnum = z.enum(['Dr', 'Cr']);

export const ledgerSchema = z.object({
  name: z.string().min(2, 'Ledger name must be at least 2 characters').max(255),
  code: z.string().max(50).optional().or(z.literal('')),
  type: LedgerTypeEnum,
  opening_balance: z.number().min(0).default(0),
  balance_type: BalanceTypeEnum,
  is_gst_applicable: z.boolean().default(false),
  gst_no: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format')
    .optional()
    .or(z.literal('')),
  pan_no: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .optional()
    .or(z.literal('')),
  contact_person: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).default('India'),
});

export type LedgerInput = z.infer<typeof ledgerSchema>;
