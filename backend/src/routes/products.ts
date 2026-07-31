import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getBrandsAndFilters,
  getSearchSuggestions,
  createProductReview,
  markReviewHelpful,
  getRecommendations,
} from '../controllers/productController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/filters', getBrandsAndFilters);
router.get('/suggestions', getSearchSuggestions);
router.get('/recommendations', protect as any, getRecommendations as any);
router.get('/:slug', getProductBySlug);

// Product reviews (Authenticated/Public)
router.post('/:productId/reviews', protect as any, createProductReview as any);
router.post('/reviews/:reviewId/helpful', markReviewHelpful);

export default router;
