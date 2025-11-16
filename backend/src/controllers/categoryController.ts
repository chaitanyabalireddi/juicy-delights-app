import { Request, Response } from 'express';
import Joi from 'joi';
import Category from '@/models/Category';
import { asyncHandler } from '@/middleware/errorHandler';

const categorySchema = Joi.object({
  name: Joi.string().max(80).trim().required(),
  slug: Joi.string().max(80).trim().lowercase(),
  description: Joi.string().max(200).allow(''),
  icon: Joi.string().max(20).allow(''),
  displayOrder: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true)
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = (req.query.includeInactive as string) === 'true';

  const categories = await Category.find(includeInactive ? {} : { isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.json({
    success: true,
    data: { categories }
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = categorySchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  const exists = await Category.findOne({ $or: [{ name: value.name }, { slug: value.slug }] });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }

  const category = await Category.create(value);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error, value } = categorySchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (value.slug) {
    const exists = await Category.findOne({ slug: value.slug, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Another category already uses this slug'
      });
    }
  }

  const category = await Category.findByIdAndUpdate(id, value, { new: true });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

