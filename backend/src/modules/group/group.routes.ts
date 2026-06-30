import { Router } from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroupTree,
  getGroupById, 
  updateGroup, 
  deleteGroup 
} from './group.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireCompany } from '../../middlewares/tenant.middleware';

const router = Router();

// All group routes require authentication and a selected company
router.use(protect);
router.use(requireCompany);

// Tree route must come before /:id to prevent string matching issues
router.route('/tree')
  .get(getGroupTree);

router.route('/')
  .post(createGroup)
  .get(getGroups);

router.route('/:id')
  .get(getGroupById)
  .put(updateGroup)
  .delete(deleteGroup);

export default router;
