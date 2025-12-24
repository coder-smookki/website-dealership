import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { listMyCars, getMyCar, updateMyCarStatus, createMyCar } from '../controllers/owner.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { canAccessCar } from '../middlewares/canAccessCar.js';
import {
  createMyCarBodySchema,
  myCarsQuerySchema,
  myCarParamsSchema,
  updateCarStatusBodySchema,
} from '../schemas/index.js';

export async function ownerRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.route({
    method: 'POST',
    url: '/api/my/cars',
    schema: {
      tags: ['Owner'],
      description: 'Create car listing',
      security: [{ bearerAuth: [] }],
      body: createMyCarBodySchema,
    },
    preHandler: [authMiddleware],
    handler: createMyCar,
  });

  app.route({
    method: 'GET',
    url: '/api/my/cars',
    schema: {
      tags: ['Owner'],
      description: 'Get my cars',
      security: [{ bearerAuth: [] }],
      querystring: myCarsQuerySchema,
    },
    preHandler: [authMiddleware],
    handler: listMyCars,
  });

  app.route({
    method: 'GET',
    url: '/api/my/cars/:id',
    schema: {
      tags: ['Owner'],
      description: 'Get my car details',
      security: [{ bearerAuth: [] }],
      params: myCarParamsSchema,
    },
    preHandler: [authMiddleware, canAccessCar],
    handler: getMyCar,
  });

  app.route({
    method: 'PATCH',
    url: '/api/my/cars/:id/status',
    schema: {
      tags: ['Owner'],
      description: 'Update car status',
      security: [{ bearerAuth: [] }],
      params: myCarParamsSchema,
      body: updateCarStatusBodySchema,
    },
    preHandler: [authMiddleware, canAccessCar],
    handler: updateMyCarStatus,
  });
}

