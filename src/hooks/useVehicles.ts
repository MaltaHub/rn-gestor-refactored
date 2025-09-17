<<<<<<< HEAD
﻿import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { VehiclesService, type VehicleInsertInput, type VehicleUpdateInput } from "@/services/veiculos";
=======
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { Tabelas } from "./../types";

type Veiculo = Tabelas.Veiculo;
type VeiculoUpload = Tabelas.VeiculoUpload;
type VeiculoRead = Tabelas.VeiculoRead;
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3

export const VEHICLES_KEY = ["vehicles"] as const;

export function useVehicles() {
<<<<<<< HEAD
  const empresaId = useAuthStore((state) => state.empresaId);

  return useQuery({
    queryKey: [...VEHICLES_KEY, empresaId],
    queryFn: () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para carregar veiculos.");
      return VehiclesService.list({ empresaId });
    },
    enabled: Boolean(empresaId),
  });
}

export function useCreateVehicle() {
  return useMutation({
    mutationFn: async ({ dados, caracteristicasIds }: {
      dados: VehicleInsertInput;
      caracteristicasIds?: string[];
    }) => {
      const { empresaId, user } = useAuthStore.getState();
      if (!empresaId) throw new Error("Empresa nao encontrada para criar veiculo.");
      return VehiclesService.create({
        empresaId,
        usuarioId: user?.id,
        dados,
        caracteristicasIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
    },
  });
}

export function useUpdateVehicle() {
  return useMutation({
    mutationFn: async ({ veiculoId, dados }: { veiculoId: string; dados: VehicleUpdateInput }) => {
      const { empresaId, user } = useAuthStore.getState();
      if (!empresaId) throw new Error("Empresa nao encontrada para atualizar veiculo.");
      if (!user) throw new Error("Usuario nao autenticado para atualizar veiculo.");
      return VehiclesService.update({
        empresaId,
        usuarioId: user.id,
        veiculoId,
        dados,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
    },
  });
}

export function useDeleteVehicle() {
  return useMutation({
    mutationFn: async ({ veiculoId, motivo }: { veiculoId: string; motivo?: string }) => {
      const { empresaId } = useAuthStore.getState();
      if (!empresaId) throw new Error("Empresa nao encontrada para remover veiculo.");
      return VehiclesService.remove({ empresaId, veiculoId, motivo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
    },
  });
=======
  const queryClient = useQueryClient();

  const query = useQuery({
  queryKey: VEHICLES_KEY,
  queryFn: async (): Promise<VeiculoRead[]> => {
    const { data, error } = await supabase
      .from("view_veiculos_expandidos")
      .select("*");

      console.log("Fetched vehicles:", data);

    if (error) throw error;

    return (data ?? []).map((v) => ({
      ...v,
      registrado_em: v.registrado_em ? new Date(v.registrado_em) : null,
      editado_em: v.editado_em ? new Date(v.editado_em) : null,
    }));
  },
  refetchInterval: 5000,
});

  const getVehicle = (id: string) => query.data?.find((v) => v.id === id);

  const createVehicle = useMutation({
    mutationFn: async (payload: VeiculoUpload) => {
      const { data, error } = await supabase
        .from("veiculos")
        .insert([payload]);

      if (error) throw error;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  const updateVehicle = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<VeiculoUpload> }) => {
      const { data, error } = await supabase
        .from("veiculos")
        .update(payload)
        .eq("id", id)
        .select<"*", VeiculoUpload>()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });

  return {
    ...query,
    getVehicle,
    createVehicle: createVehicle.mutateAsync,
    updateVehicle: updateVehicle.mutateAsync,
    deleteVehicle: deleteVehicle.mutateAsync,
  };
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3
}
