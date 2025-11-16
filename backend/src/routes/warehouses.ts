import express from 'express';
import Joi from 'joi';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '@/controllers/warehouseController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateParams } from '@/middleware/validation';

const router = express.Router();

router.get('/', getWarehouses);

router.post('/', authenticate, authorize('admin'), createWarehouse);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateParams(Joi.object({ id: Joi.string().required() })),
  updateWarehouse
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateParams(Joi.object({ id: Joi.string().required() })),
  deleteWarehouse
);

export default router;

