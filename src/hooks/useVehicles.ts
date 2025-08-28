import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'

import { Veiculos } from '../services/veiculos'
import type { Vehicle } from '../types'

const VehicleService = Veiculos
export const VEHICLES_KEY = ['vehicles'] as const

export function useVehicles() {
  return useQuery({
    queryKey: VEHICLES_KEY,
    queryFn: () => VehicleService.fetchAll(),
  })
}

export function useCreateVehicle() {
  return useMutation({
    mutationFn: (payload: Partial<Vehicle>) => VehicleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}

export function useUpdateVehicle() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Vehicle> }) => VehicleService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}

export function useDeleteVehicle() {
  return useMutation({
    mutationFn: (id: string) => VehicleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
    },
  })
}
