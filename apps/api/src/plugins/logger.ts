import { FastifyInstance, FastifyRequest } from 'fastify';
import pino from 'pino';
import { env } from '../config/env.js';

export async function loggerPlugin(fastify: FastifyInstance) {
  // Структурированное логирование в STDOUT для контейнеров
  const logger = pino({
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
    // В production логируем в STDOUT (для Docker/Kubernetes)
    // В development используем pino-pretty для читаемости
    transport: env.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'HH:MM:ss Z',
      },
    } : undefined,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    // Базовые поля для всех логов
    base: {
      service: 'car-shop-api',
      environment: env.nodeEnv,
    },
  });

  fastify.decorate('logger', logger);

  // Helper для логирования с request_id
  fastify.decorate('logWithRequest', (request: FastifyRequest, level: 'info' | 'warn' | 'error' | 'debug', message: string, extra?: Record<string, unknown>) => {
    const logData = {
      request_id: request.requestId,
      method: request.method,
      path: request.url,
      ...extra,
    };

    const logMessage = {
      msg: message,
      ...logData,
    };

    switch (level) {
      case 'info':
        logger.info(logMessage);
        break;
      case 'warn':
        logger.warn(logMessage);
        break;
      case 'error':
        logger.error(logMessage);
        break;
      case 'debug':
        logger.debug(logMessage);
        break;
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    logger: pino.Logger;
    logWithRequest: (request: FastifyRequest, level: 'info' | 'warn' | 'error' | 'debug', message: string, extra?: Record<string, unknown>) => void;
  }
}

