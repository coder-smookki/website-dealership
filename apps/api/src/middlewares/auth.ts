import { FastifyRequest, FastifyReply } from 'fastify';

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
) {
  try {
    await request.jwtVerify();
    // После jwtVerify, данные уже в request.user
    if (!request.user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  } catch (error) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

