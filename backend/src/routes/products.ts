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
  updateProduct,
  createProduct,
  deleteProduct,
  getProductsSchema,
  updateStockSchema,
  updateProductSchema,
  createProductSchema
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

// Admin routes - specific routes must come before general routes
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), createProduct);
router.put('/:id/stock', authenticate, authorize('admin'), validate(updateStockSchema), updateStock);
router.put('/:id', authenticate, authorize('admin'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
