import express from 'express';
import multer from 'multer';
import { uploadProductImage } from '@/controllers/uploadController';
import { authenticate, authorize } from '@/middleware/auth';

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

router.post(
  '/product-image',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadProductImage
);

export default router;

