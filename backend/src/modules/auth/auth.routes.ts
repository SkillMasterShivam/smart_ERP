import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.use(protect);
router.get('/me', getMe);

export default router;
