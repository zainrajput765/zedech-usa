import { Response, NextFunction } from 'express';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';
import { createPaymentIntent } from '../services/stripeService';
import { PaymentStatus, OrderStatus } from '@prisma/client';

export const createCheckoutPaymentIntent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { items, couponCode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('No checkout items found', 400));
    }

    // 1. Calculate pricing
    let itemsPrice = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return next(new AppError(`Product not found: ${item.name}`, 404));
      }
      if (product.variationStock) {
        const variants = product.variationStock as any[];
        const variant = variants.find((v: any) =>
          (v.color || '') === (item.color || '') &&
          (v.size || '') === (item.size || '')
        );
        if (!variant) {
          return next(new AppError(`Selected variation not found for product: ${product.name}`, 400));
        }
        if (variant.countInStock < item.quantity) {
          return next(new AppError(`Insufficient stock for variation: ${product.name} (${item.color || ''} / ${item.size || ''})`, 400));
        }
      } else {
        if (product.countInStock < item.quantity) {
          return next(new AppError(`Insufficient stock for: ${product.name}`, 400));
        }
      }
      itemsPrice += product.price * item.quantity;
    }

    const shippingPrice = itemsPrice >= 150 ? 0 : 15;
    const taxPrice = Math.round((itemsPrice * 0.08) * 100) / 100; // 8% sales tax

    let discountPrice = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.expiryDate > new Date()) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountPrice = Math.round((itemsPrice * (coupon.discountValue / 100)) * 100) / 100;
          } else if (coupon.discountType === 'FIXED') {
            discountPrice = Math.min(coupon.discountValue, itemsPrice);
          } else if (coupon.discountType === 'FREE_SHIPPING') {
            discountPrice = shippingPrice;
          }
        }
      }
    }

    const totalPrice = Math.max(0, Math.round((itemsPrice + shippingPrice + taxPrice - discountPrice) * 100) / 100);

    // 2. Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(totalPrice);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      stripePaymentIntentId: paymentIntent.id,
      summary: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountPrice,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const placeOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const {
      orderItems,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      stripePaymentIntentId,
      couponCode,
    } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return next(new AppError('No order items found', 400));
    }

    // 1. Calculate pricing & Validate stock
    let itemsPrice = 0;
    const itemsToCreate: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      color: string | null;
      size: string | null;
      image: string | null;
    }> = [];

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return next(new AppError(`Product not found: ${item.name}`, 404));
      }

      if (product.variationStock) {
        const variants = product.variationStock as any[];
        const variant = variants.find((v: any) =>
          (v.color || '') === (item.color || '') &&
          (v.size || '') === (item.size || '')
        );
        if (!variant) {
          return next(new AppError(`Selected variation not found for product: ${product.name}`, 400));
        }
        if (variant.countInStock < item.quantity) {
          return next(new AppError(`Insufficient stock for variation: ${product.name} (${item.color || ''} / ${item.size || ''})`, 400));
        }
      } else {
        if (product.countInStock < item.quantity) {
          return next(new AppError(`Insufficient stock for ${product.name}`, 400));
        }
      }

      itemsPrice += product.price * item.quantity;

      itemsToCreate.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        color: item.color || null,
        size: item.size || null,
        image: product.images[0] || null,
      });
    }

    const shippingPrice = itemsPrice >= 150 ? 0 : 15;
    const taxPrice = Math.round((itemsPrice * 0.08) * 100) / 100;

    let discountPrice = 0;
    let couponToUpdate = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.expiryDate > new Date()) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          couponToUpdate = coupon;
          if (coupon.discountType === 'PERCENTAGE') {
            discountPrice = Math.round((itemsPrice * (coupon.discountValue / 100)) * 100) / 100;
          } else if (coupon.discountType === 'FIXED') {
            discountPrice = Math.min(coupon.discountValue, itemsPrice);
          } else if (coupon.discountType === 'FREE_SHIPPING') {
            discountPrice = shippingPrice;
          }
        }
      }
    }

    const totalPrice = Math.max(0, Math.round((itemsPrice + shippingPrice + taxPrice - discountPrice) * 100) / 100);

    // 2. Perform transaction: Create Order, Deduct inventory, Update coupon count, Award loyalty points
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          shippingAddress,
          billingAddress,
          shippingMethod,
          paymentMethod,
          paymentStatus: stripePaymentIntentId && !stripePaymentIntentId.startsWith('pi_mock') ? PaymentStatus.PAID : PaymentStatus.PENDING,
          orderStatus: OrderStatus.PROCESSING,
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountPrice,
          totalPrice,
          stripePaymentIntentId,
          couponCode,
          orderItems: {
            create: itemsToCreate,
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Deduct inventory
      for (const item of orderItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new AppError(`Product not found during checkout: ${item.productId}`, 404);
        }

        if (product.variationStock) {
          const variants = [...(product.variationStock as any[])];
          const variantIdx = variants.findIndex((v: any) =>
            (v.color || '') === (item.color || '') &&
            (v.size || '') === (item.size || '')
          );
          if (variantIdx !== -1) {
            variants[variantIdx].countInStock = Math.max(0, variants[variantIdx].countInStock - item.quantity);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: {
              variationStock: variants,
              countInStock: {
                decrement: item.quantity,
              },
              isBestSeller: {
                set: true,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              countInStock: {
                decrement: item.quantity,
              },
              isBestSeller: {
                set: true,
              },
            },
          });
        }
      }

      // Update coupon count
      if (couponToUpdate) {
        await tx.coupon.update({
          where: { id: couponToUpdate.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Add Loyalty Points (1 point for every $10 spent)
      const pointsEarned = Math.floor(totalPrice / 10);
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: req.user!.id },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        });
      }

      // Create system notification
      await tx.notification.create({
        data: {
          userId: req.user!.id,
          title: 'Order Confirmed!',
          message: `Your order #${newOrder.id.substring(0, 8)} has been placed successfully.`,
        },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check permissions (Owner or Admin)
    if (req.user?.role !== 'ADMIN' && order.userId !== req.user?.id) {
      return next(new AppError('Unauthorized to view this order', 403));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) return next(new AppError('Order not found', 404));
    if (order.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return next(new AppError('Unauthorized to modify this order', 403));
    }

    if (order.orderStatus !== OrderStatus.PENDING && order.orderStatus !== OrderStatus.PROCESSING) {
      return next(new AppError('Cannot cancel order. It has already been shipped or processed.', 400));
    }

    // Revert inventory & update status
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { orderStatus: OrderStatus.CANCELLED },
      });

      // Restore product stock
      for (const item of order.orderItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && product.variationStock) {
          const variants = [...(product.variationStock as any[])];
          const variantIdx = variants.findIndex((v: any) =>
            (v.color || '') === (item.color || '') &&
            (v.size || '') === (item.size || '')
          );
          if (variantIdx !== -1) {
            variants[variantIdx].countInStock += item.quantity;
          }
          await tx.product.update({
            where: { id: item.productId },
            data: {
              variationStock: variants,
              countInStock: {
                increment: item.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              countInStock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) return next(new AppError('Order not found', 404));
    if (order.userId !== req.user?.id) return next(new AppError('Unauthorized', 403));

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      return next(new AppError('Can only request returns on delivered items', 400));
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus: OrderStatus.RETURNED },
    });

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully. Processing refund.',
      order: updated,
    });
  } catch (error) {
    next(error);
  }
};
