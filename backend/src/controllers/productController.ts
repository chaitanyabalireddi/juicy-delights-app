import { Request, Response } from 'express';
import Product from '@/models/Product';
import { asyncHandler } from '@/middleware/errorHandler';
import Joi from 'joi';

// Get all products with filtering and pagination
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    category,
    subcategory,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isFeatured,
    isOrganic,
    isImported,
    season
  } = req.query;

  const query: any = { isActive: true };

  // Apply filters
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (isOrganic !== undefined) query.isOrganic = isOrganic === 'true';
  if (isImported !== undefined) query.isImported = isImported === 'true';
  if (season) query.season = { $in: Array.isArray(season) ? season : [season] };

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Search filter
  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    query.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } }
    ];
  }

  // Sort options
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get single product
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not available'
    });
  }

  res.json({
    success: true,
    data: { product }
  });
});

// Get featured products
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const products = await Product.find({
    isActive: true,
    isFeatured: true
  })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: { products }
  });
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find({ category, isActive: true })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments({ category, isActive: true })
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Search products
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const query = {
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q as string, 'i')] } },
      { category: { $regex: q, $options: 'i' } },
      { subcategory: { $regex: q, $options: 'i' } }
    ]
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        subcategories: { $addToSet: '$subcategory' }
      }
    },
    {
      $project: {
        name: '$_id',
        count: 1,
        subcategories: {
          $filter: {
            input: '$subcategories',
            cond: { $ne: ['$$this', null] }
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: { categories }
  });
});

// Update product stock (admin only)
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { available, reserved, minThreshold } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      'stock.available': available,
      'stock.reserved': reserved,
      'stock.minThreshold': minThreshold
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: { product }
  });
});

// Validation schemas
export const getProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string(),
  subcategory: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  search: Joi.string(),
  sortBy: Joi.string().valid('name', 'price', 'rating', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  isFeatured: Joi.boolean(),
  isOrganic: Joi.boolean(),
  isImported: Joi.boolean(),
  season: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
});

export const updateStockSchema = Joi.object({
  available: Joi.number().integer().min(0).required(),
  reserved: Joi.number().integer().min(0).default(0),
  minThreshold: Joi.number().integer().min(0).default(5)
});
