import type { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from 'mongodb';
import { verifyAccessToken } from '../services/token.service.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { getDatabase } from '../db/client.js';
import { getUsersCollection } from '../db/collections.js';

export interface AuthUser {
  id: string;
  role: 'admin' | 'owner';
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyAccessToken(token);
  
  if (!ObjectId.isValid(payload.id)) {
    throw new UnauthorizedError('Invalid user ID in token');
  }
  
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const user = await usersCollection.findOne(
    { _id: new ObjectId(payload.id), isActive: true },
    { projection: { passwordHash: 0, refreshToken: 0 } }
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  request.user = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };
}
