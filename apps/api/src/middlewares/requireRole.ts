import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthUser } from './auth.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function requireRole(role: 'admin' | 'owner') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as AuthUser | undefined;
    
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (user.role !== role && user.role !== 'admin') {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

export function requireAdmin() {
  return requireRole('admin');
}

