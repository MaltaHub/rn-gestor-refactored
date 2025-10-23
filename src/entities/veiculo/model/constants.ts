/**
 * Constantes da entidade Veiculo
 * Define valores fixos e enums utilizados no domínio de veículos
 */

import type { EstadoVeiculo, EstadoVenda } from './types'

/**
 * Labels legíveis para estados do veículo
 */
export const ESTADO_VEICULO_LABELS: Record<EstadoVeiculo, string> = {
  novo: 'Novo',
  seminovo: 'Seminovo',
  usado: 'Usado',
  sucata: 'Sucata',
  limpo: 'Limpo',
  sujo: 'Sujo',
}

/**
 * Labels legíveis para estados de venda
 */
export const ESTADO_VENDA_LABELS: Record<EstadoVenda, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  repassado: 'Repassado',
  restrito: 'Restrito',
}

/**
 * Cores para badges de status de venda
 */
export const ESTADO_VENDA_COLORS: Record<EstadoVenda, string> = {
  disponivel: 'green',
  reservado: 'yellow',
  vendido: 'blue',
  repassado: 'purple',
  restrito: 'red',
}

/**
 * Cores sugeridas mais comuns
 */
export const CORES_COMUNS = [
  'Preto',
  'Branco',
  'Prata',
  'Cinza',
  'Vermelho',
  'Azul',
  'Verde',
  'Amarelo',
  'Bege',
  'Marrom',
] as const

/**
 * Range padrão de hodômetro para filtros
 */
export const HODOMETRO_RANGES = [
  { label: 'Até 10.000 km', max: 10000 },
  { label: '10.000 - 30.000 km', min: 10000, max: 30000 },
  { label: '30.000 - 50.000 km', min: 30000, max: 50000 },
  { label: '50.000 - 100.000 km', min: 50000, max: 100000 },
  { label: 'Mais de 100.000 km', min: 100000 },
] as const

/**
 * Range padrão de anos para filtros
 */
export const ANO_RANGES = [
  { label: 'Últimos 2 anos', min: new Date().getFullYear() - 2 },
  { label: 'Últimos 5 anos', min: new Date().getFullYear() - 5 },
  { label: 'Últimos 10 anos', min: new Date().getFullYear() - 10 },
  { label: 'Mais de 10 anos', max: new Date().getFullYear() - 10 },
] as const

/**
 * Estados que indicam veículo vendível
 */
export const ESTADOS_VENDIVEIS: EstadoVenda[] = ['disponivel', 'reservado']

/**
 * Estados que indicam veículo não disponível
 */
export const ESTADOS_NAO_DISPONIVEIS: EstadoVenda[] = ['vendido', 'repassado', 'restrito']
