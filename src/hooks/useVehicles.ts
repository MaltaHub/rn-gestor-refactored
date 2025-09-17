import { useMutation, useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/store/authStore"
import {
  VehiclesService,
  type VehicleInsertInput,
  type VehicleUpdateInput,
} from "@/services/veiculos"

export const VEHICLES_KEY = ["vehicles"] as const

export function useVehicles() {
  const empresaId = useAuthStore((state) => state.empresaId)

  return useQuery({
    queryKey: [...VEHICLES_KEY, empresaId],
    queryFn: () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para carregar veiculos.")
      return VehiclesService.list({ empresaId })
    },
    enabled: Boolean(empresaId),
  })
}

export function useCreateVehicle() {
  return useMutation({
    mutationFn: async ({ dados, caracteristicasIds }: {
      dados: VehicleInsertInput
      caracteristicasIds?: string[]
    }) => {
      const { empresaId, user } = useAuthStore.getState()
      if (!empresaId) throw new Error("Empresa nao encontrada para criar veiculo.")
      return VehiclesService.create({
        empresaId,
        usuarioId: user?.id,
        dados,
        caracteristicasIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}

export function useUpdateVehicle() {
  return useMutation({
    mutationFn: async ({ veiculoId, dados }: { veiculoId: string; dados: VehicleUpdateInput }) => {
      const { empresaId, user } = useAuthStore.getState()
      if (!empresaId) throw new Error("Empresa nao encontrada para atualizar veiculo.")
      if (!user) throw new Error("Usuario nao autenticado para atualizar veiculo.")
      return VehiclesService.update({
        empresaId,
        usuarioId: user.id,
        veiculoId,
        dados,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}

export function useDeleteVehicle() {
  return useMutation({
    mutationFn: async ({ veiculoId, motivo }: { veiculoId: string; motivo?: string }) => {
      const { empresaId } = useAuthStore.getState()
      if (!empresaId) throw new Error("Empresa nao encontrada para remover veiculo.")
      return VehiclesService.remove({ empresaId, veiculoId, motivo })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}
