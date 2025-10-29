import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  timestamp: Date;
}

export interface IDelivery extends Document {
  _id: string;
  order: mongoose.Types.ObjectId;
  deliveryPerson: mongoose.Types.ObjectId;
  status: 'assigned' | 'accepted' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  currentLocation?: IDeliveryLocation;
  route: IDeliveryLocation[];
  estimatedArrival: Date;
  actualArrival?: Date;
  deliveryProof?: {
    image: string;
    signature?: string;
    notes?: string;
    timestamp: Date;
  };
  customerRating?: {
    rating: number;
    feedback?: string;
    timestamp: Date;
  };
  deliveryPersonRating?: {
    rating: number;
    feedback?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryLocationSchema = new Schema<IDeliveryLocation>({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const DeliverySchema = new Schema<IDelivery>({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  deliveryPerson: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
    default: 'assigned'
  },
  currentLocation: DeliveryLocationSchema,
  route: [DeliveryLocationSchema],
  estimatedArrival: {
    type: Date,
    required: true
  },
  actualArrival: {
    type: Date
  },
  deliveryProof: {
    image: {
      type: String,
      required: true
    },
    signature: {
      type: String
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  customerRating: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  deliveryPersonRating: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
DeliverySchema.index({ order: 1 });
DeliverySchema.index({ deliveryPerson: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ estimatedArrival: 1 });
DeliverySchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });

// Virtual for delivery progress percentage
DeliverySchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'assigned': 0,
    'accepted': 20,
    'picked-up': 40,
    'in-transit': 70,
    'delivered': 100,
    'cancelled': 0
  };
  return statusProgress[this.status] || 0;
});

// Virtual for estimated time remaining
DeliverySchema.virtual('timeRemaining').get(function() {
  if (this.status === 'delivered' || this.status === 'cancelled') {
    return null;
  }
  
  if (this.estimatedArrival) {
    const now = new Date();
    const remaining = this.estimatedArrival.getTime() - now.getTime();
    return remaining > 0 ? Math.ceil(remaining / (1000 * 60)) : 0; // minutes
  }
  
  return null;
});

// Method to update location
DeliverySchema.methods.updateLocation = function(lat: number, lng: number, address: string) {
  this.currentLocation = {
    lat,
    lng,
    address,
    timestamp: new Date()
  };
  
  this.route.push(this.currentLocation);
  return this.save();
};

// Method to calculate distance between two points
DeliverySchema.methods.calculateDistance = function(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
