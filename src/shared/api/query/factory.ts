/**
 * Query Factory
 * Cria hooks React Query automaticamente
 * Reduz boilerplate de queries
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import type { BaseRepository, FindAllOptions } from '../repository/base.repository'

/**
 * Opções para criar query hooks
 */
export interface CreateQueryOptions<T extends Record<string, unknown>> {
  /**
   * Nome da entidade (usado nas query keys)
   */
  entityName: string

  /**
   * Repository da entidade
   */
  repository: BaseRepository<T>

  /**
   * Stale time padrão (ms)
   * @default 60000 (1 minuto)
   */
  staleTime?: number

  /**
   * Cache time padrão (ms)
   * @default 300000 (5 minutos)
   */
  cacheTime?: number
}

/**
 * Cria hooks de query para uma entidade
 * @template T - Tipo da entidade
 *
 * @example
 * const veiculoQueries = createEntityQueries({
 *   entityName: 'veiculo',
 *   repository: veiculoRepository
 * })
 *
 * // Usar nos componentes:
 * const { useList, useById, useCreate } = veiculoQueries
 */
export function createEntityQueries<T extends Record<string, unknown>>(options: CreateQueryOptions<T>) {
  const {
    entityName,
    repository,
    staleTime = 60000,
    cacheTime = 300000,
  } = options

  /**
   * Hook para buscar lista
   */
  function useList(
    findOptions?: FindAllOptions<T>,
    queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery<T[], Error>({
      queryKey: [entityName, 'list', findOptions],
      queryFn: () => repository.findAll(findOptions),
      staleTime,
      gcTime: cacheTime,
      ...queryOptions,
    })
  }

  /**
   * Hook para buscar por ID
   */
  function useById(
    id: string | undefined,
    select = '*',
    queryOptions?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery<T, Error>({
      queryKey: [entityName, 'detail', id, select],
      queryFn: () => repository.findById(id!, select),
      enabled: !!id,
      staleTime,
      gcTime: cacheTime,
      ...queryOptions,
    })
  }

  /**
   * Hook para buscar um registro
   */
  function useOne(
    filters: Partial<Record<keyof T, unknown>> | undefined,
    select = '*',
    queryOptions?: Omit<UseQueryOptions<T | null, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery<T | null, Error>({
      queryKey: [entityName, 'one', filters, select],
      queryFn: () => repository.findOne(filters!, select),
      enabled: !!filters,
      staleTime,
      gcTime: cacheTime,
      ...queryOptions,
    })
  }

  /**
   * Hook para contar registros
   */
  function useCount(
    filters?: Partial<Record<keyof T, unknown>>,
    queryOptions?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery<number, Error>({
      queryKey: [entityName, 'count', filters],
      queryFn: () => repository.count(filters),
      staleTime,
      gcTime: cacheTime,
      ...queryOptions,
    })
  }

  /**
   * Hook para criar registro
   */
  function useCreate(
    mutationOptions?: Omit<UseMutationOptions<T, Error, Partial<T>>, 'mutationFn'>
  ) {
    const queryClient = useQueryClient()

    return useMutation<T, Error, Partial<T>>({
      mutationFn: (data) => repository.create(data),
      onSuccess: (data, variables, context, mutationFunctionContext) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.invalidateQueries({ queryKey: [entityName, 'count'] })

        mutationOptions?.onSuccess?.(data, variables, context, mutationFunctionContext)
      },
      ...mutationOptions,
    })
  }

  /**
   * Hook para criar múltiplos registros
   */
  function useCreateMany(
    mutationOptions?: Omit<UseMutationOptions<T[], Error, Partial<T>[]>, 'mutationFn'>
  ) {
    const queryClient = useQueryClient()

    return useMutation<T[], Error, Partial<T>[]>({
      mutationFn: (dataArray) => repository.createMany(dataArray),
      onSuccess: (data, variables, context, mutationFunctionContext) => {
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.invalidateQueries({ queryKey: [entityName, 'count'] })

        mutationOptions?.onSuccess?.(data, variables, context, mutationFunctionContext)
      },
      ...mutationOptions,
    })
  }

  /**
   * Hook para atualizar registro
   */
  function useUpdate(
    mutationOptions?: Omit<UseMutationOptions<T, Error, { id: string; data: Partial<T> }>, 'mutationFn'>
  ) {
    const queryClient = useQueryClient()

    return useMutation<T, Error, { id: string; data: Partial<T> }>({
      mutationFn: ({ id, data }) => repository.update(id, data),
      onSuccess: (data, variables, context, mutationFunctionContext) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.invalidateQueries({ queryKey: [entityName, 'detail', variables.id] })

        mutationOptions?.onSuccess?.(data, variables, context, mutationFunctionContext)
      },
      ...mutationOptions,
    })
  }

  /**
   * Hook para deletar registro
   */
  function useDelete(
    mutationOptions?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
  ) {
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
      mutationFn: (id) => repository.delete(id),
      onSuccess: (data, id, context, mutationFunctionContext) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: [entityName, 'list'] })
        queryClient.invalidateQueries({ queryKey: [entityName, 'detail', id] })
        queryClient.invalidateQueries({ queryKey: [entityName, 'count'] })

        mutationOptions?.onSuccess?.(data, id, context, mutationFunctionContext)
      },
      ...mutationOptions,
    })
  }

  return {
    // Queries
    useList,
    useById,
    useOne,
    useCount,

    // Mutations
    useCreate,
    useCreateMany,
    useUpdate,
    useDelete,

    // Utils
    entityName,
    repository,
  }
}

/**
 * Type helper para inferir tipo do retorno de createEntityQueries
 */
export type EntityQueries<T extends Record<string, unknown>> = ReturnType<typeof createEntityQueries<T>>
