/**
 * Schemas Zod comuns e reutilizáveis
 * Validações base usadas em múltiplos domínios
 */

import { z } from 'zod'

/**
 * Schema para UUID válido
 */
export const uuidSchema = z.string().uuid('ID inválido')

/**
 * Schema para data ISO string
 */
export const dateSchema = z.string().datetime('Data inválida')

/**
 * Schema para data opcional
 */
export const optionalDateSchema = z.string().datetime().optional().nullable()

/**
 * Schema para valores monetários (positivos)
 */
export const currencySchema = z
  .number({
    required_error: 'Valor é obrigatório',
    invalid_type_error: 'Valor deve ser um número',
  })
  .positive('Valor deve ser positivo')

/**
 * Schema para valores monetários (pode ser zero)
 */
export const currencyNonNegativeSchema = z
  .number({
    required_error: 'Valor é obrigatório',
    invalid_type_error: 'Valor deve ser um número',
  })
  .nonnegative('Valor não pode ser negativo')

/**
 * Schema para email
 */
export const emailSchema = z.string().email('Email inválido')

/**
 * Schema para telefone brasileiro
 * Aceita: (11) 98765-4321, (11) 3456-7890, 11987654321, etc
 */
export const phoneSchema = z
  .string()
  .regex(/^(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/, 'Telefone inválido')

/**
 * Schema para CPF brasileiro
 * Aceita com ou sem formatação
 */
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido')

/**
 * Schema para CNPJ brasileiro
 * Aceita com ou sem formatação
 */
export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ inválido')

/**
 * Schema para CPF ou CNPJ
 */
export const documentSchema = z.union([cpfSchema, cnpjSchema], {
  errorMap: () => ({ message: 'CPF ou CNPJ inválido' }),
})

/**
 * Schema para placa de veículo brasileira
 * Suporta padrão antigo (ABC-1234) e Mercosul (ABC1D23)
 */
export const placaSchema = z
  .string()
  .toUpperCase()
  .regex(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/,
    'Placa inválida (formato esperado: ABC1D23 ou ABC1234)'
  )

/**
 * Schema para ano (veículo, data, etc)
 */
export const yearSchema = z
  .number()
  .int('Ano deve ser um número inteiro')
  .min(1900, 'Ano muito antigo')
  .max(new Date().getFullYear() + 2, 'Ano inválido')

/**
 * Schema para URLs
 */
export const urlSchema = z.string().url('URL inválida')

/**
 * Schema para URLs opcionais
 */
export const optionalUrlSchema = z.string().url('URL inválida').optional().nullable()

/**
 * Schema para texto não vazio
 */
export const nonEmptyStringSchema = z.string().min(1, 'Campo obrigatório').trim()

/**
 * Schema para texto opcional
 */
export const optionalStringSchema = z.string().trim().optional().nullable()

/**
 * Schema para números inteiros positivos
 */
export const positiveIntSchema = z.number().int().positive('Deve ser um número positivo')

/**
 * Schema para porcentagem (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Porcentagem não pode ser negativa')
  .max(100, 'Porcentagem não pode ser maior que 100')

/**
 * Schema para paginação
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

/**
 * Schema para ordenação
 */
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

export type Sort = z.infer<typeof sortSchema>

/**
 * Schema para range de datas
 */
export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'Data inicial deve ser anterior à data final',
    path: ['endDate'],
  }
)

export type DateRange = z.infer<typeof dateRangeSchema>
