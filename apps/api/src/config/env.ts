import { config } from 'dotenv';

config();

export const env = {
  port: parseInt(process.env.API_PORT || '3001', 10),
  host: process.env.API_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 
    (process.env.MONGO_ROOT_USERNAME && process.env.MONGO_ROOT_PASSWORD
      ? `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@mongodb:27017/car-shop?authSource=admin`
      : 'mongodb://localhost:27017/car-shop'),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  tunnelUrl: process.env.TUNNEL_URL || '',
} as const;

