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

export const getActiveCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiryDate: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Self-healing: If there are no active coupons in database, seed default ones automatically!
    if (coupons.length === 0) {
      const defaultCoupons = [
        {
          code: 'WELCOME10',
          discountType: 'PERCENTAGE' as any,
          discountValue: 10,
          maxUses: 100,
          usedCount: 0,
          isActive: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        {
          code: 'LUXURY50',
          discountType: 'FIXED' as any,
          discountValue: 50,
          maxUses: 50,
          usedCount: 0,
          isActive: true,
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
        }
      ];

      for (const couponData of defaultCoupons) {
        await prisma.coupon.upsert({
          where: { code: couponData.code },
          update: couponData,
          create: couponData
        });
      }

      coupons = await prisma.coupon.findMany({
        where: {
          isActive: true,
          expiryDate: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};
