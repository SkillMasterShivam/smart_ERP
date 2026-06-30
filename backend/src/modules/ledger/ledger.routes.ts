import { Router } from 'express';
import { 
  createLedger, 
  getLedgers, 
  getLedgerById, 
  updateLedger, 
  deleteLedger 
} from './ledger.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireCompany } from '../../middlewares/tenant.middleware';

const router = Router();

// All ledger routes require authentication and a selected company
router.use(protect);
router.use(requireCompany);

router.route('/')
  .post(createLedger)
  .get(getLedgers);

router.route('/:id')
  .get(getLedgerById)
  .put(updateLedger)
  .delete(deleteLedger);

export default router;
