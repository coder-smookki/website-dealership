import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

export interface TokenPayload {
  id: string;
  role: 'admin' | 'owner';
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  id: string;
  role?: 'admin' | 'owner';
  email?: string;
  iat?: number;
  exp?: number;
}

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export async function generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ id: payload.id }, env.jwtSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  // Сохраняем refresh token в БД
  if (!Types.ObjectId.isValid(payload.id)) {
    throw new Error('Invalid user ID');
  }
  
  await User.findByIdAndUpdate(payload.id, { refreshToken }, { select: '+refreshToken' });

  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    
    if (!decoded.id || !decoded.role || !decoded.email) {
      throw new UnauthorizedError('Invalid token payload');
    }
    
    return {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  try {
    const decoded = jwt.verify(refreshToken, env.jwtSecret) as JwtPayload;
    
    if (!decoded.id || !Types.ObjectId.isValid(decoded.id)) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    const user = await User.findOne({ 
      _id: decoded.id,
      refreshToken 
    }).select('+refreshToken');

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const payload: TokenPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    return generateTokenPair(payload);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: '' } }
  );
  
  if (!user) {
    throw new NotFoundError('User');
  }
}
