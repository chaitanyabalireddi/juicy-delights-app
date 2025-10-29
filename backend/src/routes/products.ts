import express from 'express';
import Joi from 'joi';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getCategories,
  updateStock,
  getProductsSchema,
  updateStockSchema
} from '@/controllers/productController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';

const router = express.Router();

// Public routes
router.get('/', validateQuery(getProductsSchema), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', validateParams(Joi.object({ id: Joi.string().required() })), getProduct);

// Admin routes
router.put('/:id/stock', authenticate, authorize('admin'), validate(updateStockSchema), updateStock);

export default router;
