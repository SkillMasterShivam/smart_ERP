import { Router } from 'express';
import { 
  createUnit, getUnits, updateUnit, deleteUnit,
  createItem, getItems, getItemById, updateItem, deleteItem
} from './inventory.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireCompany } from '../../middlewares/tenant.middleware';

const router = Router();

// All inventory routes require authentication and a selected company
router.use(protect);
router.use(requireCompany);

// --- Units Routes ---
router.route('/units')
  .post(createUnit)
  .get(getUnits);

router.route('/units/:id')
  .put(updateUnit)
  .delete(deleteUnit);

// --- Items Routes ---
router.route('/items')
  .post(createItem)
  .get(getItems);

router.route('/items/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

export default router;
