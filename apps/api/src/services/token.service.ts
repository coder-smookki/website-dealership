import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { env } from '../config/env.js';
import { getDatabase } from '../db/client.js';
import { getUsersCollection } from '../db/collections.js';
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

export async function generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
  const accessToken = jwt.sign(
    payload,
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn } as any
  );

  const refreshToken = jwt.sign(
    { id: payload.id },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn } as any
  );

  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  
  if (!ObjectId.isValid(payload.id)) {
    throw new Error('Invalid user ID');
  }
  
  await usersCollection.updateOne(
    { _id: new ObjectId(payload.id) },
    { $set: { refreshToken, updatedAt: new Date() } }
  );

  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  
  if (!decoded.id || !decoded.role || !decoded.email) {
    throw new UnauthorizedError('Invalid token payload');
  }
  
  return {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as JwtPayload;
  
  if (!decoded.id || !ObjectId.isValid(decoded.id)) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const user = await usersCollection.findOne({ 
    _id: new ObjectId(decoded.id),
    refreshToken 
  });

  if (!user) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const payload: TokenPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  return generateTokenPair(payload);
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  if (!ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $unset: { refreshToken: '' }, $set: { updatedAt: new Date() } }
  );
  
  if (result.matchedCount === 0) {
    throw new NotFoundError('User');
  }
}
