import { Request, Response } from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { asyncHandler } from '@/middleware/errorHandler';
import { config } from '@/config';
import Joi from 'joi';

// Initialize payment gateways
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16'
});

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret
});

// Create payment intent (Stripe)
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const customerId = (req as any).user._id;

  const order = await Order.findOne({
    _id: orderId,
    customer: customerId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.paymentStatus !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Order payment is not pending'
    });
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // Convert to cents
    currency: 'inr',
    metadata: {
      orderId: order._id.toString(),
      customerId: customerId
    }
  });

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { order: orderId },
    {
      gatewayTransactionId: paymentIntent.id,
      status: 'processing'
    },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  });
});

// Create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const customerId = (req as any).user._id;

  const order = await Order.findOne({
    _id: orderId,
    customer: customerId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.paymentStatus !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Order payment is not pending'
    });
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100), // Convert to paise
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      customerId: customerId
    }
  });

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { order: orderId },
    {
      gatewayOrderId: razorpayOrder.id,
      status: 'processing'
    },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: config.razorpay.keyId
    }
  });
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentId, signature } = req.body;

  // Verify signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature'
    });
  }

  // Update payment and order
  const payment = await Payment.findOneAndUpdate(
    { gatewayOrderId: orderId },
    {
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      status: 'completed'
    },
    { new: true }
  );

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Update order status
  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: 'paid',
    status: 'confirmed'
  });

  res.json({
    success: true,
    message: 'Payment verified successfully'
  });
});

// Stripe webhook handler
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  
  const payment = await Payment.findOneAndUpdate(
    { gatewayTransactionId: paymentIntent.id },
    {
      status: 'completed',
      metadata: {
        cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
        cardBrand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand
      }
    },
    { new: true }
  );

  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'paid',
      status: 'confirmed'
    });
  }
};

// Handle failed payment
const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  const payment = await Payment.findOneAndUpdate(
    { gatewayTransactionId: paymentIntent.id },
    { status: 'failed' },
    { new: true }
  );

  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'failed',
      status: 'cancelled'
    });
  }
};

// Process refund
export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId, amount, reason } = req.body;
  const userId = (req as any).user._id;

  const payment = await Payment.findOne({
    _id: paymentId,
    customer: userId,
    status: 'completed'
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found or not eligible for refund'
    });
  }

  let refundResult;

  if (payment.gateway === 'stripe') {
    const refund = await stripe.refunds.create({
      payment_intent: payment.gatewayTransactionId,
      amount: Math.round(amount * 100)
    });
    refundResult = refund;
  } else if (payment.gateway === 'razorpay') {
    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      amount: Math.round(amount * 100),
      notes: {
        reason: reason
      }
    });
    refundResult = refund;
  } else {
    return res.status(400).json({
      success: false,
      message: 'Refund not supported for this payment method'
    });
  }

  // Update payment record
  await payment.processRefund(amount, reason);

  // Update order status
  await Order.findByIdAndUpdate(payment.order, {
    status: 'refunded',
    paymentStatus: 'refunded'
  });

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: { refundId: refundResult.id }
  });
});

// Get payment methods
export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or other cards',
      icon: '💳',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps like Google Pay, PhonePe',
      icon: '📱',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: '🏦',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay using Paytm, PhonePe wallet',
      icon: '💰',
      enabled: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: '💵',
      enabled: true
    }
  ];

  res.json({
    success: true,
    data: { paymentMethods }
  });
});

// Validation schemas
export const createPaymentIntentSchema = Joi.object({
  orderId: Joi.string().required()
});

export const createRazorpayOrderSchema = Joi.object({
  orderId: Joi.string().required()
});

export const verifyRazorpayPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentId: Joi.string().required(),
  signature: Joi.string().required()
});

export const processRefundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  reason: Joi.string().max(200).required()
});
