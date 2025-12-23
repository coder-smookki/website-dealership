import { FastifyInstance } from 'fastify';
import { listCars, getCar } from '../controllers/cars.controller.js';
import { createLeadHandler } from '../controllers/leads.controller.js';
import { getSettingsHandler } from '../controllers/settings.controller.js';

export async function publicRoutes(fastify: FastifyInstance) {
  // Cars
  fastify.get('/api/cars', {
    schema: {
      tags: ['Public'],
      description: 'Get list of cars',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          q: { type: 'string' },
          brand: { type: 'string' },
          yearFrom: { type: 'number' },
          yearTo: { type: 'number' },
          priceFrom: { type: 'number' },
          priceTo: { type: 'number' },
          fuelType: { type: 'string' },
          transmission: { type: 'string' },
          drive: { type: 'string' },
          status: { type: 'string', enum: ['available', 'reserved', 'sold'] },
          sort: { type: 'string' },
        },
      },
    },
  }, listCars);

  fastify.get('/api/cars/:id', {
    schema: {
      tags: ['Public'],
      description: 'Get car details',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, getCar);

  // Settings
  fastify.get('/api/settings', {
    schema: {
      tags: ['Public'],
      description: 'Get site settings',
    },
  }, getSettingsHandler);

  // Leads
  fastify.post('/api/leads', {
    schema: {
      tags: ['Public'],
      description: 'Create a lead',
      body: {
        type: 'object',
        required: ['carId', 'name', 'phone'],
        properties: {
          carId: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  }, createLeadHandler);
}

