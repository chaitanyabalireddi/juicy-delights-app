import express from 'express';
import Joi from 'joi';
import {
  assignDeliveryPerson,
  updateLocation,
  updateDeliveryStatus,
  getDeliveryTracking,
  getActiveDeliveries,
  acceptDelivery,
  markPickedUp,
  markDelivered,
  rateDelivery,
  assignDeliveryPersonSchema,
  updateLocationSchema,
  updateDeliveryStatusSchema,
  markDeliveredSchema,
  rateDeliverySchema
} from '@/controllers/deliveryController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams } from '@/middleware/validation';

const router = express.Router();

// Admin routes
router.post('/assign', authenticate, authorize('admin'), validate(assignDeliveryPersonSchema), assignDeliveryPerson);

// Delivery person routes
router.get('/active', authenticate, authorize('delivery'), getActiveDeliveries);
router.put('/:deliveryId/accept', authenticate, authorize('delivery'), validateParams(Joi.object({ deliveryId: Joi.string().required() })), acceptDelivery);
router.put('/:deliveryId/picked-up', authenticate, authorize('delivery'), validateParams(Joi.object({ deliveryId: Joi.string().required() })), markPickedUp);
router.put('/:deliveryId/delivered', authenticate, authorize('delivery'), validate(markDeliveredSchema), markDelivered);
router.put('/:deliveryId/location', authenticate, authorize('delivery'), validate(updateLocationSchema), updateLocation);
router.put('/:deliveryId/status', authenticate, authorize('delivery'), validate(updateDeliveryStatusSchema), updateDeliveryStatus);

// Customer routes
router.get('/:orderId/tracking', authenticate, validateParams(Joi.object({ orderId: Joi.string().required() })), getDeliveryTracking);
router.post('/:deliveryId/rate', authenticate, validate(rateDeliverySchema), rateDelivery);

export default router;
