import { FastifyReply } from 'fastify';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200): FastifyReply {
  return reply.code(statusCode).send({
    success: true,
    data,
  } as ApiResponse<T>);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode = 500,
  code?: string
): FastifyReply {
  return reply.code(statusCode).send({
    success: false,
    error: {
      message,
      code,
    },
  } as ApiResponse);
}

