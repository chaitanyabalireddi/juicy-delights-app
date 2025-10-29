import { Request, Response } from 'express';
import Delivery from '@/models/Delivery';
import Order from '@/models/Order';
import User from '@/models/User';
import { asyncHandler } from '@/middleware/errorHandler';
import { sendDeliveryPersonAssignedSMS } from '@/utils/sms';
import Joi from 'joi';

// Assign delivery person to order
export const assignDeliveryPerson = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, deliveryPersonId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.deliveryType !== 'delivery') {
    return res.status(400).json({
      success: false,
      message: 'Order is not for delivery'
    });
  }

  const deliveryPerson = await User.findById(deliveryPersonId);
  if (!deliveryPerson || deliveryPerson.role !== 'delivery') {
    return res.status(404).json({
      success: false,
      message: 'Delivery person not found'
    });
  }

  // Create delivery record
  const delivery = await Delivery.create({
    order: orderId,
    deliveryPerson: deliveryPersonId,
    estimatedArrival: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
  });

  // Update order
  await Order.findByIdAndUpdate(orderId, {
    deliveryPerson: deliveryPersonId,
    status: 'out-for-delivery'
  });

  // Send notification to customer
  const customer = await User.findById(order.customer);
  if (customer) {
    try {
      await sendDeliveryPersonAssignedSMS(
        customer.phone,
        order.orderNumber,
        deliveryPerson.name,
        deliveryPerson.phone
      );
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  res.json({
    success: true,
    message: 'Delivery person assigned successfully',
    data: { delivery }
  });
});

// Update delivery location
export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { lat, lng, address } = req.body;
  const deliveryPersonId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPerson: deliveryPersonId
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not assigned to you'
    });
  }

  // Update location
  await delivery.updateLocation(lat, lng, address);

  res.json({
    success: true,
    message: 'Location updated successfully'
  });
});

// Update delivery status
export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { status } = req.body;
  const deliveryPersonId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPerson: deliveryPersonId
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not assigned to you'
    });
  }

  // Update status
  delivery.status = status;
  if (status === 'delivered') {
    delivery.actualArrival = new Date();
  }
  await delivery.save();

  // Update order status
  await Order.findByIdAndUpdate(delivery.order, {
    status: status === 'delivered' ? 'delivered' : 'out-for-delivery',
    actualDelivery: status === 'delivered' ? new Date() : undefined
  });

  res.json({
    success: true,
    message: 'Delivery status updated successfully',
    data: { delivery }
  });
});

// Get delivery tracking info
export const getDeliveryTracking = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
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

  const delivery = await Delivery.findOne({ order: orderId })
    .populate('deliveryPerson', 'name phone');

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery tracking not available'
    });
  }

  res.json({
    success: true,
    data: {
      delivery: {
        status: delivery.status,
        progressPercentage: delivery.progressPercentage,
        currentLocation: delivery.currentLocation,
        estimatedArrival: delivery.estimatedArrival,
        timeRemaining: delivery.timeRemaining,
        deliveryPerson: delivery.deliveryPerson,
        route: delivery.route
      }
    }
  });
});

// Get delivery person's active deliveries
export const getActiveDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const deliveryPersonId = (req as any).user._id;

  const deliveries = await Delivery.find({
    deliveryPerson: deliveryPersonId,
    status: { $in: ['assigned', 'accepted', 'picked-up', 'in-transit'] }
  })
    .populate('order', 'orderNumber items total deliveryAddress customer')
    .populate('order.customer', 'name phone')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { deliveries }
  });
});

// Accept delivery assignment
export const acceptDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const deliveryPersonId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPerson: deliveryPersonId,
    status: 'assigned'
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not assigned to you'
    });
  }

  delivery.status = 'accepted';
  await delivery.save();

  res.json({
    success: true,
    message: 'Delivery accepted successfully',
    data: { delivery }
  });
});

// Mark delivery as picked up
export const markPickedUp = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const deliveryPersonId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPerson: deliveryPersonId
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not assigned to you'
    });
  }

  delivery.status = 'picked-up';
  await delivery.save();

  res.json({
    success: true,
    message: 'Delivery marked as picked up',
    data: { delivery }
  });
});

// Mark delivery as delivered
export const markDelivered = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { deliveryProof } = req.body;
  const deliveryPersonId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPerson: deliveryPersonId
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not assigned to you'
    });
  }

  delivery.status = 'delivered';
  delivery.actualArrival = new Date();
  delivery.deliveryProof = {
    image: deliveryProof.image,
    signature: deliveryProof.signature,
    notes: deliveryProof.notes,
    timestamp: new Date()
  };
  await delivery.save();

  // Update order status
  await Order.findByIdAndUpdate(delivery.order, {
    status: 'delivered',
    actualDelivery: new Date()
  });

  res.json({
    success: true,
    message: 'Delivery marked as delivered',
    data: { delivery }
  });
});

// Rate delivery
export const rateDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.params;
  const { rating, feedback } = req.body;
  const customerId = (req as any).user._id;

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    'order.customer': customerId,
    status: 'delivered'
  });

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: 'Delivery not found or not eligible for rating'
    });
  }

  delivery.customerRating = {
    rating,
    feedback,
    timestamp: new Date()
  };
  await delivery.save();

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: { delivery }
  });
});

// Validation schemas
export const assignDeliveryPersonSchema = Joi.object({
  orderId: Joi.string().required(),
  deliveryPersonId: Joi.string().required()
});

export const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  address: Joi.string().required()
});

export const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string().valid('assigned', 'accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled').required()
});

export const markDeliveredSchema = Joi.object({
  deliveryProof: Joi.object({
    image: Joi.string().required(),
    signature: Joi.string(),
    notes: Joi.string().max(200)
  }).required()
});

export const rateDeliverySchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  feedback: Joi.string().max(500)
});
