import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  paymentId?: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  pickupLocation?: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    phone: string;
  };
  deliveryPerson?: mongoose.Types.ObjectId;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  trackingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'piece', 'dozen', 'pack']
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: true
  },
  paymentId: {
    type: String,
    trim: true
  },
  deliveryType: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: true
  },
  deliveryAddress: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [200, 'Instructions cannot exceed 200 characters']
    }
  },
  pickupLocation: {
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    phone: {
      type: String,
      trim: true
    }
  },
  deliveryPerson: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ trackingId: 1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `JD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for order status timeline
OrderSchema.virtual('statusTimeline').get(function() {
  const timeline = [
    { status: 'pending', label: 'Order Placed', timestamp: this.createdAt }
  ];
  
  if (this.status !== 'pending') {
    timeline.push({ status: 'confirmed', label: 'Order Confirmed', timestamp: this.updatedAt });
  }
  
  if (['preparing', 'ready', 'out-for-delivery', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'preparing', label: 'Preparing', timestamp: this.updatedAt });
  }
  
  if (['ready', 'out-for-delivery', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'ready', label: 'Ready', timestamp: this.updatedAt });
  }
  
  if (['out-for-delivery', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'out-for-delivery', label: 'Out for Delivery', timestamp: this.updatedAt });
  }
  
  if (this.status === 'delivered') {
    timeline.push({ status: 'delivered', label: 'Delivered', timestamp: this.actualDelivery || this.updatedAt });
  }
  
  return timeline;
});

export default mongoose.model<IOrder>('Order', OrderSchema);
