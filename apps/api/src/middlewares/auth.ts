import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../services/token.service.js';
import { UnauthorizedError } from '../utils/errors.js';

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
  
  request.user = {
    id: payload.id,
    role: payload.role,
    email: payload.email,
  };
}
