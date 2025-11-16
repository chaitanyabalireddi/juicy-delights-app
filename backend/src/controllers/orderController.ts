import { Request, Response } from 'express';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Payment from '@/models/Payment';
import Delivery from '@/models/Delivery';
import User from '@/models/User';
import { asyncHandler } from '@/middleware/errorHandler';
import { sendOrderConfirmationEmail, sendDeliveryUpdateEmail } from '@/utils/email';
import { sendOrderConfirmationSMS, sendDeliveryUpdateSMS } from '@/utils/sms';
import { config } from '@/config';
import Joi from 'joi';

// Create new order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, deliveryType, deliveryAddress, pickupLocation, paymentMethod, notes } = req.body;
  const customerId = (req as any).user._id;

  // Validate items and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.name} is not available`
      });
    }

    if (product.stock.available < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.name}. Available: ${product.stock.available}`
      });
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
      image: product.images[0]
    });
  }

  // Calculate fees
  const deliveryFee = deliveryType === 'delivery' ? 20 : 0;
  const serviceFee = deliveryType === 'pickup' ? 10 : 0;
  const total = subtotal + deliveryFee + serviceFee;

  // Create order
  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    deliveryType,
    deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
    pickupLocation: deliveryType === 'pickup' ? pickupLocation : undefined,
    paymentMethod,
    notes,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        'stock.available': -item.quantity,
        'stock.reserved': item.quantity
      }
    });
  }

  // Create payment record
  const payment = await Payment.create({
    order: order._id,
    customer: customerId,
    amount: total,
    paymentMethod,
    gateway: paymentMethod === 'cod' ? 'cod' : 'stripe', // Default to Stripe for online payments
    status: 'pending'
  });

  // Send confirmation notifications
  const customer = await User.findById(customerId);
  if (customer && !config.email.disabled) {
    try {
      await sendOrderConfirmationEmail(customer.email, customer.name, order.orderNumber, total);
      await sendOrderConfirmationSMS(customer.phone, order.orderNumber, total);
    } catch (error) {
      console.error('Notification sending failed:', error);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status
      }
    }
  });
});

// Get user orders
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { page = 1, limit = 10, status } = req.query;

  const query: any = {};
  if (user.role !== 'admin') {
    query.customer = user._id;
  }
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('deliveryPerson', 'name phone')
      .populate('customer', 'name email phone')
      .lean(),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalOrders: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get single order
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const query: any = { _id: id };
  if (user.role !== 'admin') {
    query.customer = user._id;
  }

  const order = await Order.findOne(query)
    .populate('deliveryPerson', 'name phone')
    .populate('customer', 'name email phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: { order }
  });
});

// Update order status (admin/delivery person)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = (req as any).user._id;
  const userRole = (req as any).user.role;

  const order = await Order.findById(id).populate('customer');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check permissions
  if (userRole === 'delivery' && order.deliveryPerson?.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only update orders assigned to you'
    });
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { 
      status,
      notes: notes || order.notes,
      ...(status === 'delivered' && { actualDelivery: new Date() })
    },
    { new: true }
  );

  // Send notifications
  if (order.customer && !config.email.disabled) {
    try {
      await sendDeliveryUpdateEmail(
        order.customer.email,
        order.customer.name,
        order.orderNumber,
        status
      );
      await sendDeliveryUpdateSMS(
        order.customer.phone,
        order.orderNumber,
        status
      );
    } catch (error) {
      console.error('Notification sending failed:', error);
    }
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order: updatedOrder }
  });
});

// Cancel order
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = (req as any).user._id;
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: id,
    customer: customerId
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  // Update order status
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { 
      status: 'cancelled',
      notes: reason || order.notes
    },
    { new: true }
  );

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        'stock.available': item.quantity,
        'stock.reserved': -item.quantity
      }
    });
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: updatedOrder }
  });
});

// Get order tracking info
export const getOrderTracking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = (req as any).user._id;

  const order = await Order.findOne({
    _id: id,
    customer: customerId
  })
    .populate('deliveryPerson', 'name phone')
    .populate('customer', 'name phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Get delivery tracking if available
  const delivery = await Delivery.findOne({ order: id });

  res.json({
    success: true,
    data: {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusTimeline: order.statusTimeline,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery
      },
      delivery: delivery ? {
        status: delivery.status,
        currentLocation: delivery.currentLocation,
        estimatedArrival: delivery.estimatedArrival,
        progressPercentage: delivery.progressPercentage,
        timeRemaining: delivery.timeRemaining
      } : null
    }
  });
});

// Validation schemas
const coordinateSchema = Joi.object({
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180)
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().min(0.1).required()
    })
  ).min(1).required(),
  deliveryType: Joi.string().valid('delivery', 'pickup').required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().default('India'),
    coordinates: coordinateSchema.optional(),
    instructions: Joi.string().max(200)
  }).unknown(true).when('deliveryType', {
    is: 'delivery',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  pickupLocation: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    coordinates: coordinateSchema.optional(),
    phone: Joi.string()
  }).unknown(true).when('deliveryType', {
    is: 'pickup',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  paymentMethod: Joi.string().valid('card', 'upi', 'netbanking', 'wallet', 'cod').required(),
  notes: Joi.string().max(500)
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'refunded').required(),
  notes: Joi.string().max(500)
});

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(200)
});
