import Fastify from 'fastify';
import { env } from './config/env.js';
import { dbPlugin } from './plugins/db.js';
import { loggerPlugin } from './plugins/logger.js';
import { corsPlugin } from './plugins/cors.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { publicRoutes } from './routes/public.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { ownerRoutes } from './routes/owner.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import formbody from '@fastify/formbody';
import { registerShutdownHandler } from './shutdown.js';

async function buildServer() {
  const fastify = Fastify({
    logger: env.nodeEnv === 'development',
  });

  // Plugins - CORS должен быть первым!
  await fastify.register(corsPlugin);
  await fastify.register(formbody);
  await fastify.register(loggerPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(dbPlugin);

  // Глобальный хук для добавления CORS заголовков ко всем ответам (резервный)
  fastify.addHook('onSend', async (request, reply) => {
    // Добавляем CORS заголовки ко всем ответам
    const origin = request.headers.origin || '*';
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  });

  // Routes
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
    server.log.info(`Server listening on http://${env.host}:${env.port}`);
    server.log.info(`Swagger UI available at http://${env.host}:${env.port}/docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

