import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  gateway: 'stripe' | 'razorpay' | 'cod';
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  refundDetails?: {
    refundId: string;
    amount: number;
    reason: string;
    timestamp: Date;
    status: 'pending' | 'processed' | 'failed';
  };
  webhookData?: any;
  metadata?: {
    cardLast4?: string;
    cardBrand?: string;
    upiId?: string;
    bankName?: string;
    walletName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: true
  },
  gateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'cod'],
    required: true
  },
  gatewayTransactionId: {
    type: String,
    trim: true
  },
  gatewayPaymentId: {
    type: String,
    trim: true
  },
  gatewayOrderId: {
    type: String,
    trim: true
  },
  gatewaySignature: {
    type: String,
    trim: true
  },
  refundDetails: {
    refundId: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Refund reason cannot exceed 200 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  webhookData: {
    type: Schema.Types.Mixed
  },
  metadata: {
    cardLast4: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, 'Card last 4 digits must be 4 numbers']
    },
    cardBrand: {
      type: String,
      trim: true,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay']
    },
    upiId: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    walletName: {
      type: String,
      trim: true,
      enum: ['paytm', 'phonepe', 'googlepay', 'amazonpay', 'mobikwik', 'freecharge']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ customer: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ gatewayTransactionId: 1 });
PaymentSchema.index({ gatewayPaymentId: 1 });
PaymentSchema.index({ createdAt: -1 });

// Virtual for payment status color
PaymentSchema.virtual('statusColor').get(function() {
  const colors = {
    'pending': 'yellow',
    'processing': 'blue',
    'completed': 'green',
    'failed': 'red',
    'cancelled': 'gray',
    'refunded': 'orange'
  };
  return colors[this.status] || 'gray';
});

// Virtual for formatted amount
PaymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Method to process refund
PaymentSchema.methods.processRefund = function(amount: number, reason: string) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }
  
  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refundDetails = {
    refundId: `REF_${Date.now()}`,
    amount,
    reason,
    timestamp: new Date(),
    status: 'pending'
  };
  
  this.status = 'refunded';
  return this.save();
};

// Method to verify gateway signature
PaymentSchema.methods.verifySignature = function(signature: string, payload: string) {
  // This would be implemented based on the specific gateway
  // For now, we'll return true as a placeholder
  return true;
};

export default mongoose.model<IPayment>('Payment', PaymentSchema);
