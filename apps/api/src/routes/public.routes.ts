import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { listCars, getCar } from '../controllers/cars.controller.js';
import { createLeadHandler } from '../controllers/leads.controller.js';
import { getSettingsHandler } from '../controllers/settings.controller.js';
import {
  carFiltersQuerySchema,
  carParamsSchema,
  createLeadBodySchema,
} from '../schemas/index.js';

export async function publicRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', async () => {
    return { message: 'SMK Dealership API', version: '1.0.0', status: 'ok' };
  });

  app.get('/api', async () => {
    return { message: 'SMK Dealership API', version: '1.0.0', status: 'ok' };
  });

  app.route({
    method: 'GET',
    url: '/api/cars',
    schema: {
      tags: ['Public'],
      description: 'Get list of cars',
      querystring: carFiltersQuerySchema,
    },
    handler: listCars,
  });

  app.route({
    method: 'GET',
    url: '/api/cars/:id',
    schema: {
      tags: ['Public'],
      description: 'Get car details',
      params: carParamsSchema,
    },
    handler: getCar,
  });

  app.route({
    method: 'GET',
    url: '/api/settings',
    schema: {
      tags: ['Public'],
      description: 'Get site settings',
    },
    handler: getSettingsHandler,
  });

  app.route({
    method: 'POST',
    url: '/api/leads',
    schema: {
      tags: ['Public'],
      description: 'Create a lead',
      body: createLeadBodySchema,
    },
    handler: createLeadHandler,
  });
}

