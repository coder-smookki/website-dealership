import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/env.js';

export async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Разрешаем все origins в development или если CORS_ORIGIN не установлен
      if (env.nodeEnv === 'development' || !env.corsOrigin || env.corsOrigin === '*') {
        cb(null, true);
        return;
      }

      // В production проверяем разрешенные origins
      const allowedOrigins = env.corsOrigin.split(',').map(o => o.trim());
      
      // Если origin не указан (например, для same-origin запросов), разрешаем
      if (!origin) {
        cb(null, true);
        return;
      }

      // Проверяем, разрешен ли origin
      const isAllowed = allowedOrigins.some(allowed => {
        // Поддержка wildcard для туннелей (например, *.ngrok.io)
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return origin === allowed;
      });

      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    strictPreflight: false,
  });
}

