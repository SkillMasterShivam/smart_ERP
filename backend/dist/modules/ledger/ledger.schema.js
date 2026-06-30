"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerSchema = exports.BalanceTypeEnum = exports.LedgerTypeEnum = void 0;
const zod_1 = require("zod");
exports.LedgerTypeEnum = zod_1.z.enum([
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
exports.BalanceTypeEnum = zod_1.z.enum(['Dr', 'Cr']);
exports.ledgerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Ledger name must be at least 2 characters').max(255),
    code: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
    type: exports.LedgerTypeEnum,
    opening_balance: zod_1.z.number().min(0).default(0),
    balance_type: exports.BalanceTypeEnum,
    is_gst_applicable: zod_1.z.boolean().default(false),
    gst_no: zod_1.z
        .string()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format')
        .optional()
        .or(zod_1.z.literal('')),
    pan_no: zod_1.z
        .string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
        .optional()
        .or(zod_1.z.literal('')),
    contact_person: zod_1.z.string().max(100).optional(),
    phone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().optional(),
    state: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).default('India'),
});
