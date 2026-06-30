import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  business_type: z.string().max(100).optional(),
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
  fy_start: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format (YYYY-MM-DD)'),
  state: z.string().max(100).optional(),
  country: z.string().max(100).default('India'),
  address: z.string().optional(),
  pincode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  currency: z.string().max(10).default('INR'),
  timezone: z.string().max(50).default('Asia/Kolkata'),
});

export type CompanyInput = z.infer<typeof companySchema>;
