import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors';
import { companyService } from '../modules/company/company.service';

/**
 * Middleware to ensure a valid company ID is provided and belongs to the user.
 * This should be used for all ERP modules (ledgers, inventory, etc.) 
 * AFTER the `protect` middleware.
 */
export const requireCompany = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const companyId = req.headers['x-company-id'] as string;

  if (!companyId) {
    throw new BadRequestError('x-company-id header is required');
  }

  try {
    // Verify ownership and existence
    const company = await companyService.getCompanyById(user.id, companyId);
    
    // Attach company to request for downstream controllers
    (req as any).company = company;
    next();
  } catch (error) {
    // getCompanyById throws NotFoundError which maps to 404, 
    // but in context of middleware, we can treat it as Forbidden or bad request.
    throw new ForbiddenError('Unauthorized to access this company or company does not exist');
  }
};
