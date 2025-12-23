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
  // JWT Access Token
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change-me-in-production-access-token-min-32-chars',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  // JWT Refresh Token
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'change-me-in-production-refresh-token-min-32-chars',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // Legacy support
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  tunnelUrl: process.env.TUNNEL_URL || '',
} as const;

