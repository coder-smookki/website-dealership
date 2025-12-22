import { FastifyInstance } from 'fastify';
import pino from 'pino';
import { env } from '../config/env.js';

export async function loggerPlugin(fastify: FastifyInstance) {
  const logger = pino({
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
    transport: env.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    } : undefined,
  });

  fastify.decorate('logger', logger);
}

declare module 'fastify' {
  interface FastifyInstance {
    logger: pino.Logger;
  }
}

