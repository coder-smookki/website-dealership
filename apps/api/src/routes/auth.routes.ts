import { FastifyInstance } from 'fastify';
import { login, register, me, refresh, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Регистрация владельцев
  fastify.post('/api/auth/register', {
    schema: {
      tags: ['Auth'],
      description: 'Register new owner',
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'phone'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
  }, register);

  // Вход
  fastify.post('/api/auth/login', {
    schema: {
      tags: ['Auth'],
      description: 'Login',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, login);

  // Обновление токена
  fastify.post('/api/auth/refresh', {
    schema: {
      tags: ['Auth'],
      description: 'Refresh access token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, refresh);

  // Выход
  fastify.post('/api/auth/logout', {
    schema: {
      tags: ['Auth'],
      description: 'Logout',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  }, logout);

  // Текущий пользователь
  fastify.get('/api/auth/me', {
    schema: {
      tags: ['Auth'],
      description: 'Get current user',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  }, me);
}

