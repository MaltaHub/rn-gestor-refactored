/**
 * Sistema de erros tipados
 * Define hierarquia de erros customizados da aplicação
 */

/**
 * Erro base da aplicação
 * Todos os erros customizados devem extender esta classe
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    }
  }
}

/**
 * Erro de validação (dados inválidos)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Erro de autenticação (não autenticado)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Usuário não autenticado', context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, context)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Erro de permissão (não autorizado)
 */
export class PermissionError extends AppError {
  constructor(message: string = 'Sem permissão para realizar esta ação', context?: Record<string, unknown>) {
    super(message, 'PERMISSION_ERROR', 403, context)
    this.name = 'PermissionError'
    Object.setPrototypeOf(this, PermissionError.prototype)
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado', context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, context)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Erro de conflito (recurso já existe)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', 409, context)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Erro de rede/conexão
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Erro de conexão com o servidor', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', 503, context)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Erro interno do servidor
 */
export class InternalError extends AppError {
  constructor(message: string = 'Erro interno do servidor', context?: Record<string, unknown>) {
    super(message, 'INTERNAL_ERROR', 500, context)
    this.name = 'InternalError'
    Object.setPrototypeOf(this, InternalError.prototype)
  }
}

/**
 * Type guard para verificar se é AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
