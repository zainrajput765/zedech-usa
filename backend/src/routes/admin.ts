import { Router } from 'express';
import {
  getDashboardStats,
  adminAddProduct,
  adminEditProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetCustomers,
  adminDeleteCustomer,
  adminGetCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminUpdateCMSSetting,
  adminCreateCategory,
} from '../controllers/adminController';
import { protect, admin } from '../middlewares/auth';

const router = Router();

// Apply admin protection to all routes in this subrouter
router.use(protect as any);
router.use(admin as any);

router.get('/stats', getDashboardStats);

// Product Admin CRUD
router.post('/products', adminAddProduct);
router.put('/products/:id', adminEditProduct);
router.delete('/products/:id', adminDeleteProduct);

// Category Admin
router.post('/categories', adminCreateCategory);

// Order Admin
router.get('/orders', adminGetOrders);
router.put('/orders/:id', adminUpdateOrderStatus);

// Customers Admin
router.get('/customers', adminGetCustomers);
router.delete('/customers/:id', adminDeleteCustomer);

// Coupons Admin
router.get('/coupons', adminGetCoupons);
router.post('/coupons', adminCreateCoupon);
router.delete('/coupons/:id', adminDeleteCoupon);

// CMS settings admin
router.put('/cms/:key', adminUpdateCMSSetting);

export default router;
