import { v2 as cloudinary } from 'cloudinary';
import { config } from '@/config';

const isConfigured = !!(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export const isCloudinaryConfigured = () => isConfigured;

export const uploadImageBuffer = async (
  buffer: Buffer,
  mimeType: string,
  folder = 'juicy-delights/products'
) => {
  if (!isConfigured) {
    throw new Error('Cloudinary credentials are not configured');
  }

  const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64String, {
    folder,
  });

  return result;
};

export const deleteImageByPublicId = async (publicId: string) => {
  if (!isConfigured) {
    throw new Error('Cloudinary credentials are not configured');
  }

  await cloudinary.uploader.destroy(publicId);
};

