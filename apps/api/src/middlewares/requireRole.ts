import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthUser } from './auth.js';

export function requireRole(role: 'admin' | 'owner') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as AuthUser | undefined;
    
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (user.role !== role && user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}

export function requireAdmin() {
  return requireRole('admin');
}

