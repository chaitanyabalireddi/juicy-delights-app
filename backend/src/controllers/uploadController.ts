import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '@/middleware/errorHandler';
import { isCloudinaryConfigured, uploadImageBuffer } from '@/utils/cloudinary';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ensureUploadsDir = async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
};

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  const { buffer, mimetype, originalname } = req.file;

  if (isCloudinaryConfigured()) {
    const result = await uploadImageBuffer(buffer, mimetype);
    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary'
      }
    });
  }

  await ensureUploadsDir();

  const extension = path.extname(originalname) || '.jpg';
  const safeExtension = extension.split('?')[0].split('#')[0];
  const filename = `${Date.now()}-${uuidv4()}${safeExtension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: `/uploads/${filename}`,
      provider: 'local'
    }
  });
});

