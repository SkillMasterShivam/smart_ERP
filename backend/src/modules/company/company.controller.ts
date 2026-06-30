import { Request, Response } from 'express';
import { companySchema } from './company.schema';
import { companyService } from './company.service';
import { sendSuccess } from '../../utils/response';

export const createCompany = async (req: Request, res: Response) => {
  const data = companySchema.parse(req.body);
  const userId = (req as any).user.id;
  
  const company = await companyService.createCompany(userId, data);

  return sendSuccess({
    res,
    statusCode: 201,
    message: 'Company created successfully',
    data: company,
  });
};

export const getCompanies = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const companies = await companyService.getCompanies(userId);

  return sendSuccess({
    res,
    message: 'Companies retrieved successfully',
    data: companies,
  });
};

export const getCompanyById = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const companyId = req.params.id as string;
  
  const company = await companyService.getCompanyById(userId, companyId);

  return sendSuccess({
    res,
    message: 'Company retrieved successfully',
    data: company,
  });
};

export const updateCompany = async (req: Request, res: Response) => {
  // Use partial schema for updates
  const data = companySchema.partial().parse(req.body);
  const userId = (req as any).user.id;
  const companyId = req.params.id as string;
  
  const company = await companyService.updateCompany(userId, companyId, data);

  return sendSuccess({
    res,
    message: 'Company updated successfully',
    data: company,
  });
};

export const deleteCompany = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const companyId = req.params.id as string;
  
  await companyService.deleteCompany(userId, companyId);

  return sendSuccess({
    res,
    message: 'Company deleted successfully',
  });
};
