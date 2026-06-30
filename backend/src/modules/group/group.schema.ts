import { z } from 'zod';

export const GroupNatureEnum = z.enum([
  'Asset',
  'Liability',
  'Income',
  'Expense',
  'None'
]);

export const GroupTypeEnum = z.enum([
  'Accounting',
  'Stock'
]);

export const groupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(255),
  code: z.string().max(50).optional().or(z.literal('')),
  group_type: GroupTypeEnum.default('Accounting'),
  parent_id: z.string().uuid().optional().nullable(),
  nature: GroupNatureEnum,
  affects_gross_profit: z.boolean().default(false),
  description: z.string().optional(),
});

export type GroupInput = z.infer<typeof groupSchema>;
