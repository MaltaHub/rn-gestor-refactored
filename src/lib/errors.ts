/**
 * Error Handling Centralizado
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado', details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão para esta ação', details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso', details?: unknown) {
    super(`${resource} não encontrado`, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Dados inválidos', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados', details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, error);
  }

  return new AppError('Erro desconhecido', 'UNKNOWN_ERROR', 500, error);
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AuthenticationError;
}

export function isPermissionError(error: unknown): boolean {
  return error instanceof AuthorizationError;
}
