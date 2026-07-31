import { Router } from 'express';
import {
  createCheckoutPaymentIntent,
  placeOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  requestReturn,
} from '../controllers/orderController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect as any); // All order routes require authentication

router.post('/checkout-session', createCheckoutPaymentIntent as any);
router.post('/', placeOrder as any);
router.get('/my-orders', getMyOrders as any);
router.get('/:id', getOrderDetails as any);
router.post('/:id/cancel', cancelOrder as any);
router.post('/:id/return', requestReturn as any);

export default router;
