import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
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
import {
  carFiltersQuerySchema,
  carParamsSchema,
  createCarBodySchema,
  updateCarBodySchema,
  moderateCarBodySchema,
  leadParamsSchema,
  updateLeadStatusBodySchema,
  userParamsSchema,
  createUserBodySchema,
  updateUserBodySchema,
  updateSettingsBodySchema,
} from '../schemas/index.js';

export async function adminRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.route({
    method: 'GET',
    url: '/api/admin/cars',
    schema: {
      tags: ['Admin'],
      description: 'Get all cars',
      security: [{ bearerAuth: [] }],
      querystring: carFiltersQuerySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: listCars,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/cars/:id',
    schema: {
      tags: ['Admin'],
      description: 'Get car details',
      security: [{ bearerAuth: [] }],
      params: carParamsSchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: getCar,
  });

  app.route({
    method: 'POST',
    url: '/api/admin/cars',
    schema: {
      tags: ['Admin'],
      description: 'Create car',
      security: [{ bearerAuth: [] }],
      body: createCarBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: createCarHandler,
  });

  app.route({
    method: 'PATCH',
    url: '/api/admin/cars/:id',
    schema: {
      tags: ['Admin'],
      description: 'Update car',
      security: [{ bearerAuth: [] }],
      params: carParamsSchema,
      body: updateCarBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: updateCarHandler,
  });

  app.route({
    method: 'DELETE',
    url: '/api/admin/cars/:id',
    schema: {
      tags: ['Admin'],
      description: 'Delete car',
      security: [{ bearerAuth: [] }],
      params: carParamsSchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: deleteCarHandler,
  });

  app.route({
    method: 'PATCH',
    url: '/api/admin/cars/:id/moderate',
    schema: {
      tags: ['Admin'],
      description: 'Moderate car (approve/reject)',
      security: [{ bearerAuth: [] }],
      params: carParamsSchema,
      body: moderateCarBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: moderateCarHandler,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/leads',
    schema: {
      tags: ['Admin'],
      description: 'Get all leads',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: listLeads,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/leads/:id',
    schema: {
      tags: ['Admin'],
      description: 'Get lead details',
      security: [{ bearerAuth: [] }],
      params: leadParamsSchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: getLead,
  });

  app.route({
    method: 'PATCH',
    url: '/api/admin/leads/:id',
    schema: {
      tags: ['Admin'],
      description: 'Update lead status',
      security: [{ bearerAuth: [] }],
      params: leadParamsSchema,
      body: updateLeadStatusBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: updateLeadStatusHandler,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/settings',
    schema: {
      tags: ['Admin'],
      description: 'Get settings',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: getSettingsHandler,
  });

  app.route({
    method: 'PUT',
    url: '/api/admin/settings',
    schema: {
      tags: ['Admin'],
      description: 'Update settings',
      security: [{ bearerAuth: [] }],
      body: updateSettingsBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: updateSettingsHandler,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/users',
    schema: {
      tags: ['Admin'],
      description: 'Get all users',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: listUsers,
  });

  app.route({
    method: 'GET',
    url: '/api/admin/users/:id',
    schema: {
      tags: ['Admin'],
      description: 'Get user details',
      security: [{ bearerAuth: [] }],
      params: userParamsSchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: getUser,
  });

  app.route({
    method: 'POST',
    url: '/api/admin/users',
    schema: {
      tags: ['Admin'],
      description: 'Create user (owner)',
      security: [{ bearerAuth: [] }],
      body: createUserBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: createUserHandler,
  });

  app.route({
    method: 'PATCH',
    url: '/api/admin/users/:id',
    schema: {
      tags: ['Admin'],
      description: 'Update user',
      security: [{ bearerAuth: [] }],
      params: userParamsSchema,
      body: updateUserBodySchema,
    },
    preHandler: [authMiddleware, requireAdmin()],
    handler: updateUserHandler,
  });
}

