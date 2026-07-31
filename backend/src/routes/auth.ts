import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
  updateProfile,
} from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect as any, getMe as any);
router.put('/profile', protect as any, updateProfile as any);

export default router;
