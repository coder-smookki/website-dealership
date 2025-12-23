import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { sendError } from './response.js';
import {
  DomainError,
  ValidationError as DomainValidationError,
  NotFoundError as DomainNotFoundError,
  UnauthorizedError as DomainUnauthorizedError,
  ForbiddenError as DomainForbiddenError,
  ConflictError as DomainConflictError,
  InfrastructureError,
} from '../domain/errors/DomainErrors.js';

// Re-export domain errors for backward compatibility
export const AppError = DomainError;
export const ValidationError = DomainValidationError;
export const NotFoundError = DomainNotFoundError;
export const UnauthorizedError = DomainUnauthorizedError;
export const ForbiddenError = DomainForbiddenError;
export const ConflictError = DomainConflictError;

export { InfrastructureError };

function isAppError(error: unknown): error is DomainError {
  return error instanceof DomainError;
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

