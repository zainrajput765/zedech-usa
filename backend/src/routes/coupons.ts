import { Router } from 'express';
import { validateCoupon, getActiveCoupons } from '../controllers/couponController';

const router = Router();

router.get('/', getActiveCoupons);
router.get('/:code', validateCoupon);

export default router;
