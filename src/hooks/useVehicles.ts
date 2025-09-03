import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { Tabelas } from "./../types";

type Veiculo = Tabelas.Veiculo;
type VeiculoUpload = Tabelas.VeiculoUpload;
type VeiculoRead = Tabelas.VeiculoRead;

export const VEHICLES_KEY = ["vehicles"] as const;

export function useVehicles() {
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
        .insert([payload])
        .select<"*", Veiculo>()
        .single();

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
}
