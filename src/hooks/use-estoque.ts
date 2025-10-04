import { supabase } from "@/lib/supabase";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { Caracteristica } from "@/types";
import type { VeiculoResumo } from "@/types/estoque";

type CaracteristicaPivot = {
  caracteristica: Caracteristica | null;
} | null;

type VeiculoQueryResult = Omit<VeiculoResumo, "caracteristicas"> & {
  caracteristicas?: CaracteristicaPivot[] | null;
};

const mapCaracteristicas = (
  lista: CaracteristicaPivot[] | null | undefined,
): Caracteristica[] =>
  (lista ?? [])
    .map((item) => item?.caracteristica ?? null)
    .filter((caracteristica): caracteristica is Caracteristica => Boolean(caracteristica));

async function fetchVeiculos(): Promise<VeiculoResumo[]> {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`*,
      modelo: modelos (*),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas (*)
      )
    `)
    .order("registrado_em", { ascending: false });

  if (error) throw error;

  const registros = (data ?? []) as VeiculoQueryResult[];

  return registros.map((veiculo) => ({
    ...veiculo,
    caracteristicas: mapCaracteristicas(veiculo.caracteristicas),
  }));
}

async function fetchVeiculo(id: string): Promise<VeiculoResumo> {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`*,
      modelo: modelos (*),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  const registro = (data ?? null) as VeiculoQueryResult | null;

  if (!registro) {
    throw new Error("Veículo não encontrado");
  }

  return {
    ...registro,
    caracteristicas: mapCaracteristicas(registro.caracteristicas),
  };
}

/** Invalida a Query 'veiculos' */
export function invalidateVeiculos(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["veiculos"] });
}

export function useVeiculos(id?: string) {
  return useQuery<VeiculoResumo | VeiculoResumo[]>({
    queryKey: id ? ["veiculos", id] : ["veiculos"],
    queryFn: async () => {
      if (id) {
        return fetchVeiculo(id);
      }
      return fetchVeiculos();
    },
    enabled: id ? Boolean(id) : true,
    staleTime: 1000 * 60 * 5,
  });
}
