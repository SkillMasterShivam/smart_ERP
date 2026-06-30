import { Router } from 'express';
import { 
  createVoucher, getVouchers, getVoucherById, 
  updateDraftVoucher, postVoucher, cancelVoucher
} from './purchase.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireCompany } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(protect);
router.use(requireCompany);

router.route('/')
  .post(createVoucher)
  .get(getVouchers);

router.route('/:id')
  .get(getVoucherById)
  .put(updateDraftVoucher);

router.post('/:id/post', postVoucher);
router.post('/:id/cancel', cancelVoucher);

export default router;
