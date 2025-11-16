import express from 'express';
import Joi from 'joi';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/controllers/categoryController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateParams } from '@/middleware/validation';

const router = express.Router();

router.get('/', getCategories);

router.post('/', authenticate, authorize('admin'), createCategory);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateParams(Joi.object({ id: Joi.string().required() })),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateParams(Joi.object({ id: Joi.string().required() })),
  deleteCategory
);

export default router;

