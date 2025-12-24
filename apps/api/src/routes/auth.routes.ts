import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { login, register, me, refresh, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import {
  registerBodySchema,
  loginBodySchema,
  refreshTokenBodySchema,
} from '../schemas/index.js';

export async function authRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.route({
    method: 'POST',
    url: '/api/auth/register',
    schema: {
      tags: ['Auth'],
      description: 'Register new owner',
      body: registerBodySchema,
    },
    handler: register,
  });

  app.route({
    method: 'POST',
    url: '/api/auth/login',
    schema: {
      tags: ['Auth'],
      description: 'Login',
      body: loginBodySchema,
    },
    handler: login,
  });

  app.route({
    method: 'POST',
    url: '/api/auth/refresh',
    schema: {
      tags: ['Auth'],
      description: 'Refresh access token',
      body: refreshTokenBodySchema,
    },
    handler: refresh,
  });

  app.route({
    method: 'POST',
    url: '/api/auth/logout',
    schema: {
      tags: ['Auth'],
      description: 'Logout',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
    handler: logout,
  });

  app.route({
    method: 'GET',
    url: '/api/auth/me',
    schema: {
      tags: ['Auth'],
      description: 'Get current user',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
    handler: me,
  });
}

