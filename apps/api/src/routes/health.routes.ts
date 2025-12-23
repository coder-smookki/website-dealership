import { FastifyInstance } from 'fastify';
import { healthCheck, readinessCheck, livenessCheck } from '../controllers/health.controller.js';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check - полная проверка состояния
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      description: 'Complete health check with database and memory status',
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                timestamp: { type: 'string' },
                uptime: { type: 'number' },
                checks: {
                  type: 'object',
                  properties: {
                    database: {
                      type: 'object',
                      properties: {
                        status: { type: 'string' },
                        responseTime: { type: 'number' },
                      },
                    },
                    memory: {
                      type: 'object',
                      properties: {
                        used: { type: 'number' },
                        total: { type: 'number' },
                        percentUsed: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, healthCheck);

  // Readiness probe - готовность принимать трафик
  fastify.get('/ready', {
    schema: {
      tags: ['Health'],
      description: 'Readiness probe - checks if service can accept traffic',
    },
  }, readinessCheck);

  // Liveness probe - жив ли процесс
  fastify.get('/live', {
    schema: {
      tags: ['Health'],
      description: 'Liveness probe - checks if process is alive',
    },
  }, livenessCheck);
}

