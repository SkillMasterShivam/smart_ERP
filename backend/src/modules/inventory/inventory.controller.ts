import { Request, Response } from 'express';
import { unitService, itemService } from './inventory.service';
import { unitSchema, itemSchema } from './inventory.schema';
import { sendSuccess } from '../../utils/response';

// -- Units Controllers --

export const createUnit = async (req: Request, res: Response) => {
  const data = unitSchema.parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const userId = (req as any).user.id;
  
  const unit = await unitService.createUnit(companyId, userId, data);
  return sendSuccess({ res, statusCode: 201, message: 'Unit created successfully', data: unit });
};

export const getUnits = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const units = await unitService.getUnits(companyId);
  return sendSuccess({ res, message: 'Units retrieved successfully', data: units });
};

export const updateUnit = async (req: Request, res: Response) => {
  const data = unitSchema.partial().parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const unitId = req.params.id as string;
  
  const unit = await unitService.updateUnit(companyId, unitId, data);
  return sendSuccess({ res, message: 'Unit updated successfully', data: unit });
};

export const deleteUnit = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const unitId = req.params.id as string;
  
  await unitService.deleteUnit(companyId, unitId);
  return sendSuccess({ res, message: 'Unit archived successfully' });
};

// -- Items Controllers --

export const createItem = async (req: Request, res: Response) => {
  const data = itemSchema.parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const userId = (req as any).user.id;
  
  const item = await itemService.createItem(companyId, userId, data);
  return sendSuccess({ res, statusCode: 201, message: 'Item created successfully', data: item });
};

export const getItems = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const search = req.query.search as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  const lowStockOnly = req.query.low_stock === 'true';
  
  const result = await itemService.getItems(companyId, { search, limit, offset, lowStockOnly });
  return sendSuccess({ res, message: 'Items retrieved successfully', data: result.data, meta: { total: result.total } });
};

export const getItemById = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const itemId = req.params.id as string;
  
  const item = await itemService.getItemById(companyId, itemId);
  return sendSuccess({ res, message: 'Item retrieved successfully', data: item });
};

export const updateItem = async (req: Request, res: Response) => {
  const data = itemSchema.partial().parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const itemId = req.params.id as string;
  
  const item = await itemService.updateItem(companyId, itemId, data);
  return sendSuccess({ res, message: 'Item updated successfully', data: item });
};

export const deleteItem = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const itemId = req.params.id as string;
  
  await itemService.deleteItem(companyId, itemId);
  return sendSuccess({ res, message: 'Item archived successfully' });
};
