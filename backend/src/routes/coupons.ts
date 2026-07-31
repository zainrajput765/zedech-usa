import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController';

const router = Router();

router.get('/:code', validateCoupon);

export default router;
