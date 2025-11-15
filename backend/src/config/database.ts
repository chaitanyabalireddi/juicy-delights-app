import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/juicy-delights';

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

let redisClient: RedisClientType | null = null;

const redisDisabled = process.env.DISABLE_REDIS === 'true';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

if (!redisDisabled) {
  try {
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.connect().catch((err) => {
      console.error('❌ Redis connection error:', err);
    });
  } catch (error) {
    console.warn('⚠️ Redis client not initialized:', error);
  }
} else {
  console.warn('⚠️ Redis disabled via DISABLE_REDIS');
}

export { redisClient };

export default connectDB;
