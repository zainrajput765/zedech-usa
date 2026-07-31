import { Router } from 'express';
import { getCMSSetting } from '../controllers/cmsController';

const router = Router();

router.get('/:key', getCMSSetting);

export default router;
