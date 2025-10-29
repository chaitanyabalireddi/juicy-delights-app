import express from 'express';
import Joi from 'joi';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema
} from '@/controllers/orderController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';

const router = express.Router();

// Customer routes
router.post('/', authenticate, validate(createOrderSchema), createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, validateParams(Joi.object({ id: Joi.string().required() })), getOrder);
router.get('/:id/tracking', authenticate, validateParams(Joi.object({ id: Joi.string().required() })), getOrderTracking);
router.put('/:id/cancel', authenticate, validate(cancelOrderSchema), cancelOrder);

// Admin/Delivery routes
router.put('/:id/status', authenticate, authorize('admin', 'delivery'), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
