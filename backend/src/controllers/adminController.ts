import { Request, Response, NextFunction } from 'express';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';
import { PaymentStatus, OrderStatus, Role, DiscountType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Gather counts
    const productsCount = await prisma.product.count();
    const customersCount = await prisma.user.count({ where: { role: Role.CUSTOMER } });
    const ordersCount = await prisma.order.count();

    // 2. Gather revenue (sum of PAID orders)
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
      select: { totalPrice: true },
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 3. Gather recent sales
    const recentSales = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // 4. Gather simple monthly sales metrics for charting
    // To make this Postgres-compatible and SQLite-compatible: we fetch orders from the last 7 days and group them in JS code.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersLastWeek = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, totalPrice: true, paymentStatus: true },
    });

    // Group by day of week
    const weekdayMap: { [key: string]: { sales: number; orders: number } } = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      weekdayMap[label] = { sales: 0, orders: 0 };
    }

    ordersLastWeek.forEach(order => {
      const label = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (weekdayMap[label]) {
        weekdayMap[label].orders += 1;
        if (order.paymentStatus === PaymentStatus.PAID) {
          weekdayMap[label].sales += order.totalPrice;
        }
      }
    });

    const chartData = Object.keys(weekdayMap).reverse().map(key => ({
      day: key,
      sales: Math.round(weekdayMap[key].sales),
      orders: weekdayMap[key].orders,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersCount,
        productsCount,
        customersCount,
      },
      recentSales,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};

// --- Product CRUD ---

export const adminAddProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      categoryId,
      brand,
      sku,
      countInStock,
      images,
      colors,
      sizes,
      tags,
    } = req.body;

    if (!name || !price || !categoryId || !brand || !sku) {
      return next(new AppError('Required fields missing', 400));
    }

    const skuExists = await prisma.product.findUnique({ where: { sku } });
    if (skuExists) {
      return next(new AppError('A product with this SKU already exists', 400));
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId,
        brand,
        sku,
        countInStock: Number(countInStock) || 0,
        images: images || [],
        colors: colors || [],
        sizes: sizes || [],
        tags: tags || [],
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const adminEditProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return next(new AppError('Product not found', 404));

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (data.price) data.price = Number(data.price);
    if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
    if (data.countInStock) data.countInStock = Number(data.countInStock);

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return next(new AppError('Product not found', 404));

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- Order Admin Operations ---

export const adminGetOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
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

export const adminUpdateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, carrier } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return next(new AppError('Order not found', 404));

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || order.orderStatus,
        paymentStatus: paymentStatus || order.paymentStatus,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
        carrier: carrier !== undefined ? carrier : order.carrier,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Order Status Updated',
        message: `Your order #${order.id.substring(0, 8)} status is now: ${orderStatus || order.orderStatus}`,
      },
    });

    res.status(200).json({
      success: true,
      order: updated,
    });
  } catch (error) {
    next(error);
  }
};

// --- Customers Operations ---

export const adminGetCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        loyaltyPoints: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({ where: { id, role: Role.CUSTOMER } });
    if (!user) return next(new AppError('Customer not found', 404));

    // Cascade deletion through transaction
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.review.deleteMany({ where: { userId: id } }),
      prisma.address.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Customer and related records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- Coupon CRUD ---

export const adminGetCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, discountValue, expiryDate, maxUses } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return next(new AppError('Required coupon parameters missing', 400));
    }

    const exists = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase().trim() } });
    if (exists) return next(new AppError('A coupon with this code already exists', 400));

    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase().trim(),
        discountType: discountType as DiscountType,
        discountValue: Number(discountValue),
        expiryDate: new Date(expiryDate),
        maxUses: maxUses ? Number(maxUses) : null,
      },
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.status(200).json({
      success: true,
      message: 'Coupon code deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- CMS Operations ---

export const adminUpdateCMSSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return next(new AppError('CMS value object is required', 400));
    }

    const updated = await prisma.cMSSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.status(200).json({
      success: true,
      cms: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) return next(new AppError('Category name is required', 400));

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const categoryExists = await prisma.category.findUnique({ where: { name } });
    if (categoryExists) return next(new AppError('Category already exists', 400));

    const category = await prisma.category.create({
      data: { name, slug },
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const adminUploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return next(new AppError('No image base64 data provided', 400));
    }

    // Split base64 header from content
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return next(new AppError('Invalid base64 string format', 400));
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const ext = matches[1].split('/')[1] || 'png';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, imageBuffer);

    // Return URL of uploaded file
    const port = process.env.PORT || 5000;
    const fileUrl = `http://localhost:${port}/uploads/${safeFileName}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};
