import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  badge?: string;
  unit: 'kg' | 'piece' | 'dozen' | 'pack';
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  origin: string;
  season: string[];
  isOrganic: boolean;
  isImported: boolean;
  stock: {
    available: number;
    reserved: number;
    minThreshold: number;
  };
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fruits', 'vegetables', 'dried-fruits', 'juices', 'gift-packs']
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  badge: {
    type: String,
    enum: ['seasonal', 'imported', 'organic', 'sale', 'new', 'popular']
  },
  unit: {
    type: String,
    enum: ['kg', 'piece', 'dozen', 'pack'],
    default: 'kg'
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  nutritionalInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative']
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative']
    }
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true
  },
  season: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'year-round']
  }],
  isOrganic: {
    type: Boolean,
    default: false
  },
  isImported: {
    type: Boolean,
    default: false
  },
  stock: {
    available: {
      type: Number,
      required: true,
      min: [0, 'Available stock cannot be negative'],
      default: 0
    },
    reserved: {
      type: Number,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0
    },
    minThreshold: {
      type: Number,
      min: [0, 'Minimum threshold cannot be negative'],
      default: 5
    }
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0
    },
    count: {
      type: Number,
      min: [0, 'Rating count cannot be negative'],
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ 'rating.average': -1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock.available === 0) {
    return 'out-of-stock';
  } else if (this.stock.available <= this.stock.minThreshold) {
    return 'low-stock';
  }
  return 'in-stock';
});

export default mongoose.model<IProduct>('Product', ProductSchema);
