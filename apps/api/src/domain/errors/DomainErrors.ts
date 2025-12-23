/**
 * Domain Layer - Error Classes
 * These errors represent business logic violations
 */

export class DomainError extends Error {
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
    this.name = 'DomainError';
    this.statusCode = statusCode;
    this.code = code || 'DOMAIN_ERROR';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(400, message, code, true);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, code = 'NOT_FOUND') {
    super(404, `${resource} not found`, code, true);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, message, code, true);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, message, code, true);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, message, code, true);
    this.name = 'ConflictError';
  }
}

export class InfrastructureError extends DomainError {
  constructor(message: string, code = 'INFRASTRUCTURE_ERROR') {
    super(500, message, code, false);
    this.name = 'InfrastructureError';
  }
}

