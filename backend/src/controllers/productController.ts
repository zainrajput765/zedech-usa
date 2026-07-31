import { Request, Response, NextFunction } from 'express';
import prisma from '../models/db';
import { AppError } from '../middlewares/errorHandler';
import { getAIRecommendations, getFrequentlyBoughtTogether } from '../services/aiService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category, // category slug
      brand,
      minPrice,
      maxPrice,
      rating,
      color,
      size,
      sort,
    } = req.query;

    const skipNum = (Number(page) - 1) * Number(limit);
    const takeNum = Number(limit);

    // Build Prisma query filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { brand: { contains: String(search), mode: 'insensitive' } },
        { tags: { has: String(search).toLowerCase() } },
      ];
    }

    if (category) {
      // Find category ID by slug
      const foundCategory = await prisma.category.findUnique({
        where: { slug: String(category) },
      });
      if (foundCategory) {
        where.categoryId = foundCategory.id;
      } else {
        // If category is not found, return empty results
        return res.status(200).json({
          success: true,
          products: [],
          pagination: { page: Number(page), limit: takeNum, totalPages: 0, totalProducts: 0 },
        });
      }
    }

    if (brand) {
      where.brand = { equals: String(brand), mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (rating) {
      where.ratings = { gte: Number(rating) };
    }

    if (color) {
      where.colors = { has: String(color) };
    }

    if (size) {
      where.sizes = { has: String(size) };
    }

    // Build Sorting
    let orderBy: any = { createdAt: 'desc' }; // default newest
    if (sort) {
      switch (String(sort)) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'best_selling':
          orderBy = { isBestSeller: 'desc' };
          break;
        case 'top_rated':
          orderBy = { ratings: 'desc' };
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProducts / takeNum);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: takeNum,
        totalPages,
        totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Fetch complementary frequently bought together items
    const complementary = await getFrequentlyBoughtTogether(product.id);

    res.status(200).json({
      success: true,
      product,
      frequentlyBoughtTogether: complementary,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandsAndFilters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      select: { brand: true, colors: true, sizes: true },
    });

    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    const colors = Array.from(new Set(products.flatMap((p) => p.colors)));
    const sizes = Array.from(new Set(products.flatMap((p) => p.sizes)));

    res.status(200).json({
      success: true,
      brands,
      colors,
      sizes,
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const searchStr = String(q).trim();

    // Fetch names and brands matching queries for instant suggestions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchStr, mode: 'insensitive' } },
          { brand: { contains: searchStr, mode: 'insensitive' } },
          { tags: { has: searchStr.toLowerCase() } },
        ],
      },
      take: 6,
      select: { id: true, name: true, slug: true, brand: true, price: true, images: true },
    });

    res.status(200).json({
      success: true,
      suggestions: products,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Authentication required to review', 401));

    const { productId } = req.params;
    const { rating, comment, title, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be an integer between 1 and 5', 400));
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.user.id },
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: Number(rating),
        comment,
        title,
        images: images || [],
      },
    });

    // Update product overall ratings and count
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const numReviews = allReviews.length;
    const ratings = allReviews.reduce((sum, item) => sum + item.rating, 0) / numReviews;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratings: Math.round(ratings * 10) / 10,
        numReviews,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const markReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return next(new AppError('Review not found', 404));

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { helpful: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      helpful: updatedReview.helpful,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const recommendations = await getAIRecommendations(userId);
    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};
