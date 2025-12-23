import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

export async function requestIdMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Приоритет: X-Correlation-ID > X-Request-ID > генерируем новый UUID
  const correlationId = 
    request.headers[CORRELATION_ID_HEADER] as string ||
    request.headers[REQUEST_ID_HEADER] as string ||
    randomUUID();

  // Сохраняем в контексте запроса
  request.requestId = correlationId;

  // Возвращаем клиенту в заголовке ответа
  reply.header(REQUEST_ID_HEADER, correlationId);
}

