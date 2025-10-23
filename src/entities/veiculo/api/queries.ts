/**
 * Query hooks para Veiculo
 * Hooks React Query gerados automaticamente + customizados
 */

import { createEntityQueries } from '@/shared/api/query'
import { veiculoRepository } from './repository'
import type { Veiculo, VeiculoFilters } from '../model/types'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

/**
 * Query hooks base gerados automaticamente
 */
export const veiculoQueries = createEntityQueries<Veiculo>({
  entityName: 'veiculo',
  repository: veiculoRepository,
  staleTime: 30000, // 30 segundos
  cacheTime: 300000, // 5 minutos
})

// Re-exportar hooks base
export const {
  useList: useVeiculos,
  useById: useVeiculoById,
  useOne: useVeiculo,
  useCount: useVeiculosCount,
  useCreate: useCreateVeiculo,
  useUpdate: useUpdateVeiculo,
  useDelete: useDeleteVeiculo,
} = veiculoQueries

/**
 * Hook customizado: busca veículo por placa
 */
export function useVeiculoByPlaca(
  placa: string | undefined,
  options?: Omit<UseQueryOptions<Veiculo | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Veiculo | null, Error>({
    queryKey: ['veiculo', 'byPlaca', placa],
    queryFn: () => veiculoRepository.findByPlaca(placa!),
    enabled: !!placa && placa.length > 0,
    ...options,
  })
}

/**
 * Hook customizado: busca veículos por loja
 */
export function useVeiculosByLoja(
  lojaId: string | undefined,
  options?: Omit<UseQueryOptions<Veiculo[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Veiculo[], Error>({
    queryKey: ['veiculo', 'byLoja', lojaId],
    queryFn: () => veiculoRepository.findByLoja(lojaId!),
    enabled: !!lojaId,
    ...options,
  })
}

/**
 * Hook customizado: busca com filtros avançados
 */
export function useVeiculosWithFilters(
  filters: VeiculoFilters | undefined,
  options?: Omit<UseQueryOptions<Veiculo[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Veiculo[], Error>({
    queryKey: ['veiculo', 'withFilters', filters],
    queryFn: () => veiculoRepository.findWithFilters(filters!),
    enabled: !!filters,
    ...options,
  })
}

/**
 * Hook customizado: busca veículos disponíveis
 */
export function useVeiculosDisponiveis(
  options?: Omit<UseQueryOptions<Veiculo[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Veiculo[], Error>({
    queryKey: ['veiculo', 'disponiveis'],
    queryFn: () => veiculoRepository.findDisponiveis(),
    ...options,
  })
}

/**
 * Hook customizado: conta por estado de venda
 */
export function useVeiculosCountByEstado(
  options?: Omit<UseQueryOptions<Record<string, number>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Record<string, number>, Error>({
    queryKey: ['veiculo', 'countByEstado'],
    queryFn: () => veiculoRepository.countByEstadoVenda(),
    ...options,
  })
}

/**
 * Hook customizado: verifica se placa existe
 */
export function usePlacaExists(
  placa: string | undefined,
  excludeId?: string,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<boolean, Error>({
    queryKey: ['veiculo', 'placaExists', placa, excludeId],
    queryFn: () => veiculoRepository.placaExists(placa!, excludeId),
    enabled: !!placa && placa.length >= 7, // Placa completa
    ...options,
  })
}
