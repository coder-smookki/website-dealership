import { FastifyInstance } from 'fastify';
import pino from 'pino';
import { env } from '../config/env.js';

export async function loggerPlugin(fastify: FastifyInstance) {
  // Структурированное логирование только для важных событий
  const logger = pino({
    level: env.nodeEnv === 'production' ? 'warn' : 'info',
    transport: env.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    } : undefined,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  });

  fastify.decorate('logger', logger);
}

declare module 'fastify' {
  interface FastifyInstance {
    logger: pino.Logger;
  }
}

