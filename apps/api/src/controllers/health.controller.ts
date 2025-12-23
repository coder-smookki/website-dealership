import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../db/client.js';
import { sendSuccess, sendError } from '../utils/response.js';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
    memory: {
      used: number;
      total: number;
      percentUsed: number;
    };
  };
}

/**
 * Health check endpoint для проверки состояния сервиса
 * Используется для liveness probe (жив ли сервис)
 */
export async function healthCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const db = getDatabase();
    
    // Пингуем БД для проверки соединения
    const dbStartTime = Date.now();
    await db.admin().ping();
    const dbResponseTime = Date.now() - dbStartTime;
    
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const percentUsed = Math.round((usedMemory / totalMemory) * 100);
    
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'connected',
          responseTime: dbResponseTime,
        },
        memory: {
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentUsed,
        },
      },
    };
    
    return sendSuccess(reply, response, 200);
  } catch (error) {
    const memUsage = process.memoryUsage();
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'disconnected',
        },
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentUsed: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        },
      },
    };
    
    return sendError(reply, 'Service unhealthy', 503, 'SERVICE_UNHEALTHY');
  }
}

/**
 * Readiness check endpoint для проверки готовности принимать запросы
 * Используется для readiness probe (готов ли сервис обрабатывать трафик)
 */
export async function readinessCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const db = getDatabase();
    await db.admin().ping();
    
    return sendSuccess(reply, { status: 'ready' }, 200);
  } catch (error) {
    return sendError(reply, 'Service not ready', 503, 'SERVICE_NOT_READY');
  }
}

/**
 * Liveness check endpoint для проверки живости процесса
 * Используется для liveness probe (нужен ли рестарт)
 */
export async function livenessCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  return sendSuccess(reply, { status: 'alive' }, 200);
}

