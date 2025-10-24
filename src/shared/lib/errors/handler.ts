/**
 * Handler centralizado de erros
 * Trata erros da aplicação, Supabase e genéricos
 */

import { PostgrestError } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  NetworkError,
  InternalError,
  isAppError,
} from './types'

/**
 * Converte erros do Supabase para AppError
 */
export function handleSupabaseError(error: PostgrestError): AppError {
  // Erro de autenticação
  if (error.code === 'PGRST301' || error.message.includes('JWT')) {
    return new AuthenticationError('Sessão expirada. Faça login novamente.', {
      supabaseCode: error.code,
      originalMessage: error.message,
    })
  }

  // Erro de permissão/RLS
  if (error.code === '42501' || error.message.includes('permission')) {
    return new AuthenticationError('Sem permissão para acessar este recurso', {
      supabaseCode: error.code,
      originalMessage: error.message,
    })
  }

  // Erro de not found
  if (error.code === 'PGRST116' || error.message.includes('not found')) {
    return new NotFoundError('Registro não encontrado', {
      supabaseCode: error.code,
      originalMessage: error.message,
    })
  }

  // Erro de violação de constraint (duplicação)
  if (error.code === '23505') {
    return new ValidationError('Este registro já existe no sistema', {
      supabaseCode: error.code,
      originalMessage: error.message,
    })
  }

  // Erro de foreign key violation
  if (error.code === '23503') {
    return new ValidationError('Não é possível excluir: existem registros relacionados', {
      supabaseCode: error.code,
      originalMessage: error.message,
    })
  }

  // Erro genérico do Supabase
  return new InternalError('Erro ao processar requisição', {
    supabaseCode: error.code,
    originalMessage: error.message,
  })
}

/**
 * Converte erros do Zod para ValidationError
 */
export function handleZodError(error: ZodError): ValidationError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const issues = error.issues || (error as any).errors || []
  const firstError = issues[0]
  const field = firstError?.path?.join('.') || 'field'
  const message = firstError?.message || 'Validation error'

  return new ValidationError(`${field}: ${message}`, {
    errors: issues,
    formatted: error.format(),
  })
}

/**
 * Handler principal de erros
 * Normaliza qualquer erro para AppError
 */
export function handleError(error: unknown): AppError {
  // Já é AppError, retorna direto
  if (isAppError(error)) {
    return error
  }

  // Erro do Zod
  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  // Erro do Supabase
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return handleSupabaseError(error as PostgrestError)
  }

  // Erro de rede
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Sem conexão com o servidor', {
      originalError: String(error),
    })
  }

  // Erro genérico do JavaScript
  if (error instanceof Error) {
    return new InternalError(error.message, {
      name: error.name,
      stack: error.stack,
    })
  }

  // Erro desconhecido
  return new InternalError('Erro desconhecido', {
    error: String(error),
  })
}

/**
 * Loga erro estruturado no console
 * Em produção, seria enviado para serviço de monitoramento
 */
export function logError(error: AppError): void {
  const isDev = process.env.NODE_ENV === 'development'

  const errorLog = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    context: error.context,
    stack: isDev ? error.stack : undefined,
  }

  if (isDev) {
    console.error('🔴 Error:', errorLog)
  } else {
    console.error(JSON.stringify(errorLog))
    // TODO: Enviar para serviço de monitoramento (Sentry, DataDog, etc)
  }
}

/**
 * Extrai mensagem amigável do erro para exibir ao usuário
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}
