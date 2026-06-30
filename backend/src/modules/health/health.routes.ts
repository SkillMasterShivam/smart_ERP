import { Router } from 'express';
import { getHealthStatus, getServerInfo, getDbStatus } from './health.controller';

const router = Router();

router.get('/', getHealthStatus);
router.get('/info', getServerInfo);
router.get('/db', getDbStatus);

export default router;
