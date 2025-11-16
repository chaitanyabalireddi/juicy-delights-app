import { Request, Response } from 'express';
import Joi from 'joi';
import Warehouse from '@/models/Warehouse';
import { asyncHandler } from '@/middleware/errorHandler';

const warehouseSchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  distance: Joi.string().trim().allow(''),
  eta: Joi.string().trim().allow(''),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180)
  }).optional()
});

export const getWarehouses = asyncHandler(async (_req: Request, res: Response) => {
  const warehouses = await Warehouse.find().sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: { warehouses }
  });
});

export const createWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = warehouseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  const warehouse = await Warehouse.create(value);
  res.status(201).json({
    success: true,
    message: 'Warehouse created successfully',
    data: { warehouse }
  });
});

export const updateWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error, value } = warehouseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  const warehouse = await Warehouse.findByIdAndUpdate(id, value, { new: true });
  if (!warehouse) {
    return res.status(404).json({
      success: false,
      message: 'Warehouse not found'
    });
  }

  res.json({
    success: true,
    message: 'Warehouse updated successfully',
    data: { warehouse }
  });
});

export const deleteWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const warehouse = await Warehouse.findByIdAndDelete(id);
  if (!warehouse) {
    return res.status(404).json({
      success: false,
      message: 'Warehouse not found'
    });
  }

  res.json({
    success: true,
    message: 'Warehouse deleted successfully'
  });
});

