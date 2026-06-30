import { Router } from 'express';
import { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany } from './company.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

// All company routes require authentication
router.use(protect);

router.post('/', createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
