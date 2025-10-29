import express from 'express';
import {
  createPaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  stripeWebhook,
  processRefund,
  getPaymentMethods,
  createPaymentIntentSchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  processRefundSchema
} from '@/controllers/paymentController';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';

const router = express.Router();

// Public routes
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.get('/methods', getPaymentMethods);
router.post('/stripe/intent', authenticate, validate(createPaymentIntentSchema), createPaymentIntent);
router.post('/razorpay/order', authenticate, validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/razorpay/verify', authenticate, validate(verifyRazorpayPaymentSchema), verifyRazorpayPayment);
router.post('/refund', authenticate, validate(processRefundSchema), processRefund);

export default router;
