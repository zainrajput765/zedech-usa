import prisma from '../models/db';

export const getAIRecommendations = async (userId?: string, limit: number = 4) => {
  // If user is logged in, we can look up their order history to recommend categories
  let preferredCategoryId: string | null = null;

  if (userId) {
    const lastOrder = await prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { orderItems: { include: { product: true } } },
    });

    if (lastOrder && lastOrder.orderItems.length > 0) {
      preferredCategoryId = lastOrder.orderItems[0].product.categoryId;
    }
  }

  // Fetch recommended products
  const products = await prisma.product.findMany({
    where: preferredCategoryId ? { categoryId: preferredCategoryId } : undefined,
    take: limit,
    orderBy: [
      { isBestSeller: 'desc' },
      { ratings: 'desc' }
    ],
  });

  // Fallback if no order history or not enough products in the same category
  if (products.length < limit) {
    const additionalProducts = await prisma.product.findMany({
      where: {
        id: {
          notIn: products.map((p) => p.id),
        },
      },
      take: limit - products.length,
      orderBy: { isTrending: 'desc' },
    });
    return [...products, ...additionalProducts];
  }

  return products;
};

export const getFrequentlyBoughtTogether = async (productId: string) => {
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!currentProduct) return [];

  // Suggest products from either the same brand or complementary category
  const suggested = await prisma.product.findMany({
    where: {
      id: { not: productId },
      OR: [
        { categoryId: currentProduct.categoryId },
        { brand: currentProduct.brand }
      ]
    },
    take: 2,
    orderBy: { isBestSeller: 'desc' },
  });

  return suggested;
};
