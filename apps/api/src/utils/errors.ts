import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { sendError } from './response.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || 'UNKNOWN_ERROR';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(400, message, code, true);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, code = 'NOT_FOUND') {
    super(404, `${resource} not found`, code, true);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, message, code, true);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, message, code, true);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, message, code, true);
    this.name = 'ConflictError';
  }
}

function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function handleError(
  error: unknown,
  reply: FastifyReply,
  request?: FastifyRequest,
  fastify?: FastifyInstance
): FastifyReply {
  const requestId = request?.requestId || 'unknown';
  const duration = request?.startTime ? Date.now() - request.startTime : undefined;

  if (isAppError(error)) {
    // Операционные ошибки логируем на уровне warn
    if (fastify && request && fastify.logger) {
      fastify.logger.warn({
        request_id: request.requestId,
        method: request.method,
        path: request.url,
        msg: 'Request error',
        error_type: error.name,
        error_code: error.code,
        error_message: error.message,
        status_code: error.statusCode,
        duration_ms: duration,
      });
    }
    
    return sendError(reply, error.message, error.statusCode, error.code);
  }

  if (isError(error)) {
    // Неоперационные ошибки логируем на уровне error с полным stack trace
    const errorLog = {
      request_id: request?.requestId || 'unknown',
      method: request?.method || 'unknown',
      path: request?.url || 'unknown',
      msg: 'Internal server error',
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack,
      status_code: 500,
      duration_ms: duration,
    };

    if (fastify && fastify.logger) {
      fastify.logger.error(errorLog);
    } else {
      // Fallback если нет доступа к fastify/request
      console.error('Error:', errorLog);
    }
    
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    return sendError(reply, message, 500, 'INTERNAL_ERROR');
  }

  // Неизвестный тип ошибки
  const unknownErrorLog = {
    request_id: request?.requestId || 'unknown',
    method: request?.method || 'unknown',
    path: request?.url || 'unknown',
    msg: 'Unknown error type',
    error_type: 'UnknownError',
    error_data: String(error),
    status_code: 500,
    duration_ms: duration,
  };

  if (fastify && fastify.logger) {
    fastify.logger.error(unknownErrorLog);
  } else {
    console.error('Unknown error:', unknownErrorLog);
  }
  
  return sendError(reply, 'Internal server error', 500, 'UNKNOWN_ERROR');
}

