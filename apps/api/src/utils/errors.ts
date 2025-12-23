import { FastifyReply } from 'fastify';
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

export function handleError(error: unknown, reply: FastifyReply): FastifyReply {
  if (isAppError(error)) {
    return sendError(reply, error.message, error.statusCode, error.code);
  }

  if (isError(error)) {
    // Логируем только неоперационные ошибки
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
    
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    return sendError(reply, message, 500, 'INTERNAL_ERROR');
  }

  // Неизвестный тип ошибки
  if (process.env.NODE_ENV === 'development') {
    console.error('Unknown error type:', error);
  }
  
  return sendError(reply, 'Internal server error', 500, 'UNKNOWN_ERROR');
}

