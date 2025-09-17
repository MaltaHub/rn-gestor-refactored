import { useMutation, useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/store/authStore"
import {
  CompanyConfigurationsService,
  type CaracteristicaRecord,
  type LojaRecord,
  type LocalRecord,
  type ModeloRecord,
} from "@/services/configuracoes"

export const LOJAS_QUERY_KEY = ["company-configurations", "lojas"] as const
export const LOCAIS_QUERY_KEY = ["company-configurations", "locais"] as const
export const CARACTERISTICAS_QUERY_KEY = [
  "company-configurations",
  "caracteristicas",
] as const
export const MODELOS_QUERY_KEY = ["company-configurations", "modelos"] as const

const ensureEmpresaId = () => {
  const { empresaId } = useAuthStore.getState()
  if (!empresaId) throw new Error("Empresa nao encontrada para executar a operacao.")
  return empresaId
}

export function useLojas() {
  const empresaId = useAuthStore((state) => state.empresaId)

  return useQuery({
    queryKey: [...LOJAS_QUERY_KEY, empresaId],
    queryFn: () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para carregar lojas.")
      return CompanyConfigurationsService.listLojas({ empresaId })
    },
    enabled: Boolean(empresaId),
  })
}

export function useCreateLoja() {
  return useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.createLoja({ empresaId, nome })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOJAS_QUERY_KEY })
    },
  })
}

export function useUpdateLoja() {
  return useMutation({
    mutationFn: async ({ lojaId, nome }: { lojaId: string; nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.updateLoja({
        empresaId,
        lojaId,
        dados: { nome },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOJAS_QUERY_KEY })
    },
  })
}

export function useDeleteLoja() {
  return useMutation({
    mutationFn: async ({ lojaId }: { lojaId: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.deleteLoja({ empresaId, lojaId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOJAS_QUERY_KEY })
    },
  })
}

export function useLocais() {
  const empresaId = useAuthStore((state) => state.empresaId)

  return useQuery({
    queryKey: [...LOCAIS_QUERY_KEY, empresaId],
    queryFn: () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para carregar locais.")
      return CompanyConfigurationsService.listLocais({ empresaId })
    },
    enabled: Boolean(empresaId),
  })
}

export function useCreateLocal() {
  return useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.createLocal({ empresaId, nome })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCAIS_QUERY_KEY })
    },
  })
}

export function useUpdateLocal() {
  return useMutation({
    mutationFn: async ({ localId, nome }: { localId: string; nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.updateLocal({
        empresaId,
        localId,
        dados: { nome },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCAIS_QUERY_KEY })
    },
  })
}

export function useDeleteLocal() {
  return useMutation({
    mutationFn: async ({ localId }: { localId: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.deleteLocal({ empresaId, localId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCAIS_QUERY_KEY })
    },
  })
}

export function useCaracteristicas() {
  const empresaId = useAuthStore((state) => state.empresaId)

  return useQuery({
    queryKey: [...CARACTERISTICAS_QUERY_KEY, empresaId],
    queryFn: () => {
      if (!empresaId)
        throw new Error("Empresa nao encontrada para carregar caracteristicas.")
      return CompanyConfigurationsService.listCaracteristicas({ empresaId })
    },
    enabled: Boolean(empresaId),
  })
}

export function useCreateCaracteristica() {
  return useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.createCaracteristica({ empresaId, nome })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARACTERISTICAS_QUERY_KEY })
    },
  })
}

export function useUpdateCaracteristica() {
  return useMutation({
    mutationFn: async ({ caracteristicaId, nome }: { caracteristicaId: string; nome: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.updateCaracteristica({
        empresaId,
        caracteristicaId,
        dados: { nome },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARACTERISTICAS_QUERY_KEY })
    },
  })
}

export function useDeleteCaracteristica() {
  return useMutation({
    mutationFn: async ({ caracteristicaId }: { caracteristicaId: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.deleteCaracteristica({ empresaId, caracteristicaId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARACTERISTICAS_QUERY_KEY })
    },
  })
}

export function useModelos() {
  const empresaId = useAuthStore((state) => state.empresaId)

  return useQuery({
    queryKey: [...MODELOS_QUERY_KEY, empresaId],
    queryFn: () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para carregar modelos.")
      return CompanyConfigurationsService.listModelos({ empresaId })
    },
    enabled: Boolean(empresaId),
  })
}

export function useCreateModelo() {
  return useMutation({
    mutationFn: async ({
      nome,
      marca,
      anoInicial,
      anoFinal,
    }: {
      nome: string
      marca: string
      anoInicial: number | null
      anoFinal: number | null
    }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.createModelo({
        empresaId,
        dados: {
          nome,
          marca,
          ano_inicial: anoInicial ?? null,
          ano_final: anoFinal ?? null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_QUERY_KEY })
    },
  })
}

export function useUpdateModelo() {
  return useMutation({
    mutationFn: async ({
      modeloId,
      nome,
      marca,
      anoInicial,
      anoFinal,
    }: {
      modeloId: string
      nome: string
      marca: string
      anoInicial: number | null
      anoFinal: number | null
    }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.updateModelo({
        empresaId,
        modeloId,
        dados: {
          nome,
          marca,
          ano_inicial: anoInicial ?? null,
          ano_final: anoFinal ?? null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_QUERY_KEY })
    },
  })
}

export function useDeleteModelo() {
  return useMutation({
    mutationFn: async ({ modeloId }: { modeloId: string }) => {
      const empresaId = ensureEmpresaId()
      return CompanyConfigurationsService.deleteModelo({ empresaId, modeloId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_QUERY_KEY })
    },
  })
}

export type { CaracteristicaRecord, LojaRecord, LocalRecord, ModeloRecord }
