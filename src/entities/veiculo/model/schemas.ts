/**
 * Schemas de validação Zod para Veiculo
 * Define validações type-safe para todas as operações com veículos
 */

import { z } from 'zod'
import { placaSchema, yearSchema, currencyNonNegativeSchema, nonEmptyStringSchema, optionalStringSchema } from '@/shared/lib/validators'

/**
 * Enum de estados do veículo
 */
export const estadoVeiculoEnum = z.enum([
  'novo',
  'seminovo',
  'usado',
  'sucata',
  'limpo',
  'sujo',
])

export type EstadoVeiculoEnum = z.infer<typeof estadoVeiculoEnum>

/**
 * Enum de estados de venda
 */
export const estadoVendaEnum = z.enum([
  'disponivel',
  'reservado',
  'vendido',
  'repassado',
  'restrito',
])

export type EstadoVendaEnum = z.infer<typeof estadoVendaEnum>

/**
 * Schema para criar veículo
 */
export const veiculoCreateSchema = z.object({
  placa: placaSchema,
  chassi: z.string().min(17, 'Chassi deve ter 17 caracteres').max(17).optional().nullable(),
  ano_fabricacao: yearSchema.optional().nullable(),
  ano_modelo: yearSchema.optional().nullable(),
  cor: nonEmptyStringSchema.optional().nullable(),
  hodometro: z.number().int('Hodômetro deve ser inteiro').nonnegative('Hodômetro não pode ser negativo'),
  estado_veiculo: estadoVeiculoEnum.optional().nullable(),
  estado_venda: estadoVendaEnum.default('disponivel'),
  observacao: optionalStringSchema,
  preco_venal: currencyNonNegativeSchema.optional().nullable(),
  local_id: z.string().uuid().optional().nullable(),
  modelo_id: z.string().uuid().optional().nullable(),
})

export type VeiculoCreateInput = z.infer<typeof veiculoCreateSchema>

/**
 * Schema para atualizar veículo
 * Todos os campos são opcionais
 */
export const veiculoUpdateSchema = veiculoCreateSchema.partial()

export type VeiculoUpdateInput = z.infer<typeof veiculoUpdateSchema>

/**
 * Schema para filtros de busca
 */
export const veiculoFiltersSchema = z.object({
  placa: z.string().optional(),
  modelo_id: z.string().uuid().optional(),
  estado_venda: z.union([estadoVendaEnum, z.array(estadoVendaEnum)]).optional(),
  estado_veiculo: z.union([estadoVeiculoEnum, z.array(estadoVeiculoEnum)]).optional(),
  loja_id: z.string().uuid().optional(),
  ano_fabricacao_min: yearSchema.optional(),
  ano_fabricacao_max: yearSchema.optional(),
  preco_min: currencyNonNegativeSchema.optional(),
  preco_max: currencyNonNegativeSchema.optional(),
  search: z.string().optional(),
})

export type VeiculoFilters = z.infer<typeof veiculoFiltersSchema>

/**
 * Validação com refinamentos (regras de negócio)
 */
export const veiculoCreateWithRulesSchema = veiculoCreateSchema.refine(
  (data) => {
    // Se ano_modelo existe, deve ser >= ano_fabricacao
    if (data.ano_modelo && data.ano_fabricacao) {
      return data.ano_modelo >= data.ano_fabricacao
    }
    return true
  },
  {
    message: 'Ano do modelo não pode ser anterior ao ano de fabricação',
    path: ['ano_modelo'],
  }
)

/**
 * Helper para validar criação de veículo
 */
export function validateVeiculoCreate(data: unknown): VeiculoCreateInput {
  return veiculoCreateWithRulesSchema.parse(data)
}

/**
 * Helper para validar atualização de veículo
 */
export function validateVeiculoUpdate(data: unknown): VeiculoUpdateInput {
  return veiculoUpdateSchema.parse(data)
}

/**
 * Helper para validar filtros
 */
export function validateVeiculoFilters(data: unknown): VeiculoFilters {
  return veiculoFiltersSchema.parse(data)
}
