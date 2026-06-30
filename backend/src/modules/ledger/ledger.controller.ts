import { Request, Response } from 'express';
import { ledgerService } from './ledger.service';
import { ledgerSchema } from './ledger.schema';
import { sendSuccess } from '../../utils/response';

export const createLedger = async (req: Request, res: Response) => {
  const data = ledgerSchema.parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const userId = (req as any).user.id;
  
  const ledger = await ledgerService.createLedger(companyId, userId, data);

  return sendSuccess({
    res,
    statusCode: 201,
    message: 'Ledger created successfully',
    data: ledger,
  });
};

export const getLedgers = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const search = req.query.search as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  
  const result = await ledgerService.getLedgers(companyId, { search, limit, offset });

  return sendSuccess({
    res,
    message: 'Ledgers retrieved successfully',
    data: result.data,
    meta: {
      total: result.total
    }
  });
};

export const getLedgerById = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const ledgerId = req.params.id as string;
  
  const ledger = await ledgerService.getLedgerById(companyId, ledgerId);

  return sendSuccess({
    res,
    message: 'Ledger retrieved successfully',
    data: ledger,
  });
};

export const updateLedger = async (req: Request, res: Response) => {
  const data = ledgerSchema.partial().parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const ledgerId = req.params.id as string;
  
  const ledger = await ledgerService.updateLedger(companyId, ledgerId, data);

  return sendSuccess({
    res,
    message: 'Ledger updated successfully',
    data: ledger,
  });
};

export const deleteLedger = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const ledgerId = req.params.id as string;
  
  await ledgerService.deleteLedger(companyId, ledgerId);

  return sendSuccess({
    res,
    message: 'Ledger archived successfully',
  });
};
