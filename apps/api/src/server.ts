import Fastify from 'fastify';
import { env } from './config/env.js';
import { dbPlugin } from './plugins/db.js';
import { loggerPlugin } from './plugins/logger.js';
import { corsPlugin } from './plugins/cors.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { securityPlugin } from './plugins/security.js';
import { healthRoutes } from './routes/health.routes.js';
import { publicRoutes } from './routes/public.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { ownerRoutes } from './routes/owner.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import formbody from '@fastify/formbody';
import { registerShutdownHandler } from './shutdown.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { handleError } from './utils/errors.js';

async function buildServer() {
  const fastify = Fastify({
    logger: false, // Отключаем встроенный логгер, используем наш кастомный
  });

  // Plugins - loggerPlugin должен быть первым
  await fastify.register(loggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(securityPlugin);
  await fastify.register(formbody);
  await fastify.register(swaggerPlugin);
  await fastify.register(dbPlugin);

  // Request ID middleware и логирование начала запроса
  fastify.addHook('onRequest', async (request, reply) => {
    // Устанавливаем requestId
    await requestIdMiddleware(request, reply);
    
    // Устанавливаем время начала запроса
    const startTime = Date.now();
    request.startTime = startTime;
    
    // Логируем начало запроса
    const logData = {
      request_id: request.requestId || 'unknown',
      method: request.method,
      path: request.url,
      msg: 'Request started',
      user_agent: request.headers['user-agent'],
      client_ip: request.ip,
      query: request.query,
    };
    
    // Используем наш кастомный logger с безопасной проверкой
    try {
      if (fastify.logger && typeof fastify.logger.info === 'function') {
        fastify.logger.info(logData);
      }
    } catch (err) {
      // Игнорируем ошибки логирования
    }
  });

  // Логирование конца запроса
  fastify.addHook('onResponse', async (request, reply) => {
    const duration = request.startTime ? Date.now() - request.startTime : 0;
    
    // Логируем завершение запроса
    const logData = {
      request_id: request.requestId || 'unknown',
      method: request.method,
      path: request.url,
      msg: 'Request completed',
      status_code: reply.statusCode,
      duration_ms: duration,
    };
    
    // Используем наш кастомный logger с безопасной проверкой
    try {
      if (fastify.logger && typeof fastify.logger.info === 'function') {
        fastify.logger.info(logData);
      }
    } catch (err) {
      // Игнорируем ошибки логирования
    }
  });

  // Глобальный обработчик ошибок
  fastify.setErrorHandler((error, request, reply) => {
    return handleError(error, reply, request, fastify);
  });

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(publicRoutes);
  await fastify.register(authRoutes);
  await fastify.register(ownerRoutes);
  await fastify.register(adminRoutes);

  // Register shutdown handler
  registerShutdownHandler(async () => {
    await fastify.close();
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.port, host: env.host });
    // Используем наш кастомный logger
    if (server.logger) {
      server.logger.info(`Server listening on http://${env.host}:${env.port}`);
      server.logger.info(`Swagger UI available at http://${env.host}:${env.port}/docs`);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

