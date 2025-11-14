import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { generateTokens } from '@/utils/jwt';
import { sendWelcomeEmail } from '@/utils/email';
import { sendOTP as sendOTPSMS } from '@/utils/sms';
import { redisClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import Joi from 'joi';

// Register user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email or phone'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword
  });

  // Generate tokens
  const tokens = generateTokens({
    id: user._id,
    email: user.email,
    role: user.role
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error('Welcome email failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      tokens
    }
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Generate tokens
  const tokens = generateTokens({
    id: user._id,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      tokens
    }
  });
});

// Send OTP for phone verification
export const sendPhoneOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in Redis with 5-minute expiry
  await redisClient.setEx(`otp:${phone}`, 300, otp);

  // Send OTP via SMS
  try {
    await sendOTPSMS(phone, otp);
  } catch (error) {
    console.error('SMS sending failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
});

// Verify phone OTP
export const verifyPhoneOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  // Get OTP from Redis
  const storedOTP = await redisClient.get(`otp:${phone}`);
  
  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  // Delete OTP from Redis
  await redisClient.del(`otp:${phone}`);

  // Update user verification status
  const user = await User.findOneAndUpdate(
    { phone },
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Phone number verified successfully'
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id);
  
  res.json({
    success: true,
    data: { user }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, preferences } = req.body;
  const userId = (req as any).user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, preferences },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// Add address
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const { street, city, state, pincode, country, coordinates } = req.body;
  const userId = (req as any).user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        address: {
          street,
          city,
          state,
          pincode,
          country: country || 'India',
          coordinates
        }
      }
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Address added successfully',
    data: { user }
  });
});

// Update address
export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { addressIndex } = req.params;
  const { street, city, state, pincode, country, coordinates } = req.body;
  const userId = (req as any).user._id;

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const index = parseInt(addressIndex);
  if (index < 0 || index >= user.address.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address index'
    });
  }

  user.address[index] = {
    street,
    city,
    state,
    pincode,
    country: country || 'India',
    coordinates
  };

  await user.save();

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: { user }
  });
});

// Delete address
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { addressIndex } = req.params;
  const userId = (req as any).user._id;

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const index = parseInt(addressIndex);
  if (index < 0 || index >= user.address.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address index'
    });
  }

  user.address.splice(index, 1);
  await user.save();

  res.json({
    success: true,
    message: 'Address deleted successfully',
    data: { user }
  });
});

// Validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const phoneOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
});

export const verifyOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  otp: Joi.string().length(6).required()
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  preferences: Joi.object({
    notifications: Joi.boolean(),
    sms: Joi.boolean(),
    email: Joi.boolean()
  })
});

export const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  country: Joi.string().default('India'),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  })
});
