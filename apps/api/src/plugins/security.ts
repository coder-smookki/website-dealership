import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export async function securityPlugin(fastify: FastifyInstance) {
  fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Referrer-Policy', 'no-referrer-when-downgrade');
    
    if (env.nodeEnv === 'production') {
      reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
    }
    
    reply.removeHeader('X-Powered-By');
  });

  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/health') || request.url.startsWith('/live') || request.url.startsWith('/ready')) {
      return;
    }

    const clientIp = request.ip;
    const key = `${clientIp}:${request.url}`;
    const now = Date.now();
    
    const limit = 100;
    const windowMs = 60 * 1000;
    
    let record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
      
      if (record.count > limit) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        reply.header('Retry-After', String(retryAfter));
        reply.header('X-RateLimit-Limit', String(limit));
        reply.header('X-RateLimit-Remaining', '0');
        reply.header('X-RateLimit-Reset', String(record.resetTime));
        
        return reply.status(429).send({
          success: false,
          error: {
            message: 'Слишком много запросов, попробуйте позже',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        });
      }
    }
    
    reply.header('X-RateLimit-Limit', String(limit));
    reply.header('X-RateLimit-Remaining', String(Math.max(0, limit - record.count)));
    reply.header('X-RateLimit-Reset', String(record.resetTime));
  });

  fastify.log.info('Плагин безопасности подключён: заголовки, rate limiting');
}

