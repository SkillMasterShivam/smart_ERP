"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySchema = void 0;
const zod_1 = require("zod");
exports.companySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Company name must be at least 2 characters').max(255),
    business_type: zod_1.z.string().max(100).optional(),
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
    fy_start: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format (YYYY-MM-DD)'),
    state: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).default('India'),
    address: zod_1.z.string().optional(),
    pincode: zod_1.z.string().max(20).optional(),
    phone: zod_1.z.string().max(20).optional(),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    currency: zod_1.z.string().max(10).default('INR'),
    timezone: zod_1.z.string().max(50).default('Asia/Kolkata'),
});
