import { Request, Response } from 'express';
import { purchaseService } from './purchase.service';
import { purchaseVoucherSchema } from './purchase.schema';
import { sendSuccess } from '../../utils/response';

export const createVoucher = async (req: Request, res: Response) => {
  const data = purchaseVoucherSchema.parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const userId = (req as any).user.id;
  
  const voucher = await purchaseService.createVoucher(companyId, userId, data);
  return sendSuccess({ res, statusCode: 201, message: 'Purchase Voucher created as Draft', data: voucher });
};

export const getVouchers = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  
  const result = await purchaseService.getVouchers(companyId, { search, status, limit, offset });
  return sendSuccess({ res, message: 'Vouchers retrieved successfully', data: result.data, meta: { total: result.total } });
};

export const getVoucherById = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const voucherId = req.params.id as string;
  
  const voucher = await purchaseService.getVoucherById(companyId, voucherId);
  return sendSuccess({ res, message: 'Voucher retrieved successfully', data: voucher });
};

export const updateDraftVoucher = async (req: Request, res: Response) => {
  const data = purchaseVoucherSchema.parse(req.body); // Use full schema as we replace items entirely
  const companyId = req.headers['x-company-id'] as string;
  const voucherId = req.params.id as string;
  
  await purchaseService.updateDraftVoucher(companyId, voucherId, data);
  return sendSuccess({ res, message: 'Draft Voucher updated successfully' });
};

export const postVoucher = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const voucherId = req.params.id as string;
  const userId = (req as any).user.id;
  
  await purchaseService.postVoucher(companyId, voucherId, userId);
  return sendSuccess({ res, message: 'Voucher Posted successfully. Inventory updated.' });
};

export const cancelVoucher = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const voucherId = req.params.id as string;
  const userId = (req as any).user.id;
  
  await purchaseService.cancelVoucher(companyId, voucherId, userId);
  return sendSuccess({ res, message: 'Voucher Cancelled successfully. Inventory reversed.' });
};
