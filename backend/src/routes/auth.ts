import express from 'express';
import {
  register,
  login,
  sendPhoneOTP,
  verifyPhoneOTP,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  registerSchema,
  loginSchema,
  phoneOTPSchema,
  verifyOTPSchema,
  updateProfileSchema,
  addressSchema
} from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(phoneOTPSchema), sendPhoneOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyPhoneOTP);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/address', authenticate, validate(addressSchema), addAddress);
router.put('/address/:addressIndex', authenticate, validate(addressSchema), updateAddress);
router.delete('/address/:addressIndex', authenticate, deleteAddress);

export default router;
