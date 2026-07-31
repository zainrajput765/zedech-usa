import { Request, Response, NextFunction } from 'express';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (!code) {
      return next(new AppError('Coupon code is required', 400));
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase().trim() },
    });

    if (!coupon) {
      return next(new AppError('Invalid coupon code', 404));
    }

    if (!coupon.isActive) {
      return next(new AppError('This coupon is no longer active', 400));
    }

    if (coupon.expiryDate < new Date()) {
      return next(new AppError('This coupon has expired', 400));
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return next(new AppError('This coupon has reached its maximum use limit', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully.',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    next(error);
  }
};
