import { FastifyInstance } from 'fastify';
import { listMyCars, getMyCar, updateMyCarStatus, createMyCar } from '../controllers/owner.controller.js';
import { authMiddleware } from '../middlewares/auth.js';
import { canAccessCar } from '../middlewares/canAccessCar.js';

export async function ownerRoutes(fastify: FastifyInstance) {
  fastify.post('/api/my/cars', {
    schema: {
      tags: ['Owner'],
      description: 'Create car listing',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'brand', 'model', 'year', 'mileage', 'price'],
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
        },
      },
    },
    preHandler: [authMiddleware],
  }, createMyCar as any);

  fastify.get('/api/my/cars', {
    schema: {
      tags: ['Owner'],
      description: 'Get my cars',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          status: { type: 'string', enum: ['available', 'reserved', 'sold'] },
          sort: { type: 'string' },
        },
      },
    },
    preHandler: [authMiddleware],
  }, listMyCars as any);

  fastify.get('/api/my/cars/:id', {
    schema: {
      tags: ['Owner'],
      description: 'Get my car details',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
    preHandler: [authMiddleware, canAccessCar as any],
  }, getMyCar as any);

  fastify.patch('/api/my/cars/:id/status', {
    schema: {
      tags: ['Owner'],
      description: 'Update car status',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['available', 'reserved', 'sold'] },
        },
      },
    },
    preHandler: [authMiddleware, canAccessCar as any],
  }, updateMyCarStatus as any);
}

