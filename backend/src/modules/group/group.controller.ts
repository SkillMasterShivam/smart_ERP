import { Request, Response } from 'express';
import { groupService } from './group.service';
import { groupSchema } from './group.schema';
import { sendSuccess } from '../../utils/response';

export const createGroup = async (req: Request, res: Response) => {
  const data = groupSchema.parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const userId = (req as any).user.id;
  
  const group = await groupService.createGroup(companyId, userId, data);

  return sendSuccess({
    res,
    statusCode: 201,
    message: 'Group created successfully',
    data: group,
  });
};

export const getGroups = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const search = req.query.search as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
  const type = req.query.type as string;
  
  const result = await groupService.getGroups(companyId, { search, limit, offset, type });

  return sendSuccess({
    res,
    message: 'Groups retrieved successfully',
    data: result.data,
    meta: {
      total: result.total
    }
  });
};

export const getGroupTree = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const type = (req.query.type as string) || 'Accounting';
  
  const tree = await groupService.getGroupTree(companyId, type);

  return sendSuccess({
    res,
    message: 'Group tree retrieved successfully',
    data: tree,
  });
};

export const getGroupById = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const groupId = req.params.id as string;
  
  const group = await groupService.getGroupById(companyId, groupId);

  return sendSuccess({
    res,
    message: 'Group retrieved successfully',
    data: group,
  });
};

export const updateGroup = async (req: Request, res: Response) => {
  const data = groupSchema.partial().parse(req.body);
  const companyId = req.headers['x-company-id'] as string;
  const groupId = req.params.id as string;
  
  const group = await groupService.updateGroup(companyId, groupId, data);

  return sendSuccess({
    res,
    message: 'Group updated successfully',
    data: group,
  });
};

export const deleteGroup = async (req: Request, res: Response) => {
  const companyId = req.headers['x-company-id'] as string;
  const groupId = req.params.id as string;
  
  await groupService.deleteGroup(companyId, groupId);

  return sendSuccess({
    res,
    message: 'Group archived successfully',
  });
};
