import { FastifyInstance } from 'fastify';
import {
  listCars,
  getCar,
  createCarHandler,
  updateCarHandler,
  deleteCarHandler,
  moderateCarHandler,
} from '../controllers/cars.controller.js';
import {
  listLeads,
  getLead,
  updateLeadStatusHandler,
} from '../controllers/leads.controller.js';
import {
  listUsers,
  getUser,
  createUserHandler,
  updateUserHandler,
} from '../controllers/admin.controller.js';
import {
  getSettingsHandler,
  updateSettingsHandler,
} from '../controllers/settings.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireRole.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // Cars
  fastify.get('/api/admin/cars', {
    schema: {
      tags: ['Admin'],
      description: 'Get all cars',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, listCars);

  fastify.get('/api/admin/cars/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Get car details',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, getCar);

  fastify.post('/api/admin/cars', {
    schema: {
      tags: ['Admin'],
      description: 'Create car',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'brand', 'model', 'year', 'mileage', 'price', 'ownerId'],
        properties: {
          title: { type: 'string' },
          brand: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'number' },
          mileage: { type: 'number' },
          price: { type: 'number' },
          currency: { type: 'string' },
          fuelType: { type: 'string' },
          transmission: { type: 'string' },
          drive: { type: 'string' },
          engine: { type: 'string' },
          powerHp: { type: 'number' },
          color: { type: 'string' },
          description: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['available', 'reserved', 'sold'] },
          ownerId: { type: 'string' },
        },
      },
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, createCarHandler);

  fastify.patch('/api/admin/cars/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Update car',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, updateCarHandler);

  fastify.delete('/api/admin/cars/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Delete car',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, deleteCarHandler);

  fastify.patch('/api/admin/cars/:id/moderate', {
    schema: {
      tags: ['Admin'],
      description: 'Moderate car (approve/reject)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['moderationStatus'],
        properties: {
          moderationStatus: { type: 'string', enum: ['approved', 'rejected'] },
          moderationComment: { type: 'string' },
        },
      },
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, moderateCarHandler);

  // Leads
  fastify.get('/api/admin/leads', {
    schema: {
      tags: ['Admin'],
      description: 'Get all leads',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, listLeads);

  fastify.get('/api/admin/leads/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Get lead details',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, getLead);

  fastify.patch('/api/admin/leads/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Update lead status',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['new', 'in_progress', 'closed'] },
        },
      },
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, updateLeadStatusHandler);

  // Settings
  fastify.get('/api/admin/settings', {
    schema: {
      tags: ['Admin'],
      description: 'Get settings',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, getSettingsHandler);

  fastify.put('/api/admin/settings', {
    schema: {
      tags: ['Admin'],
      description: 'Update settings',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, updateSettingsHandler);

  // Users
  fastify.get('/api/admin/users', {
    schema: {
      tags: ['Admin'],
      description: 'Get all users',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, listUsers);

  fastify.get('/api/admin/users/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Get user details',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, getUser);

  fastify.post('/api/admin/users', {
    schema: {
      tags: ['Admin'],
      description: 'Create user (owner)',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'owner'] },
        },
      },
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, createUserHandler);

  fastify.patch('/api/admin/users/:id', {
    schema: {
      tags: ['Admin'],
      description: 'Update user',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
  }, updateUserHandler);
}

