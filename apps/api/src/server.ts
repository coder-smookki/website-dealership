import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './config/env.js';
import { dbPlugin } from './plugins/db.js';
import { loggerPlugin } from './plugins/logger.js';
import { corsPlugin } from './plugins/cors.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { securityPlugin } from './plugins/security.js';
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
    logger: false,
  });

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(loggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(securityPlugin);
  await fastify.register(formbody);
  await fastify.register(swaggerPlugin);
  await fastify.register(dbPlugin);

  fastify.addHook('onRequest', async (request, reply) => {
    await requestIdMiddleware(request, reply);
    
    const startTime = Date.now();
    request.startTime = startTime;
    
    const logData = {
      request_id: request.requestId || 'unknown',
      method: request.method,
      path: request.url,
      msg: 'Запрос начат',
      user_agent: request.headers['user-agent'],
      client_ip: request.ip,
      query: request.query,
    };
    
    try {
      if (fastify.logger && typeof fastify.logger.info === 'function') {
        fastify.logger.info(logData);
      }
    } catch (err) {
      
    }
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = request.startTime ? Date.now() - request.startTime : 0;
    
    const logData = {
      request_id: request.requestId || 'unknown',
      method: request.method,
      path: request.url,
      msg: 'Запрос завершён',
      status_code: reply.statusCode,
      duration_ms: duration,
    };
    
    try {
      if (fastify.logger && typeof fastify.logger.info === 'function') {
        fastify.logger.info(logData);
      }
    } catch (err) {
      
    }
  });

  fastify.setErrorHandler((error, request, reply) => {
    return handleError(error, reply, request, fastify);
  });

  await fastify.register(publicRoutes);
  await fastify.register(authRoutes);
  await fastify.register(ownerRoutes);
  await fastify.register(adminRoutes);

  registerShutdownHandler(async () => {
    await fastify.close();
  });

  return fastify.withTypeProvider<ZodTypeProvider>();
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.port, host: env.host });
    if (server.logger) {
      server.logger.info(`Сервер запущен на http://${env.host}:${env.port}`);
      server.logger.info(`Swagger UI доступен по адресу http://${env.host}:${env.port}/docs`);
    }
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

start();

