import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { VeiculoResumo } from "@/types/estoque";

async function fetchVeiculos() : Promise<VeiculoResumo[] | []> {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`*,
      modelo: modelos ( * ),
      local: locais ( * ),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas ( * )
      )
    `)
    .order("registrado_em", { ascending: false }) as { data: VeiculoResumo[] | null; error: any };

  if (error) throw error;

  return (data ?? []).map((v: any) => ({
    ...v,
    caracteristicas: v.caracteristicas?.map((c: any) => c.caracteristica) ?? [],
  }));
}

async function fetchVeiculo(id: string) : Promise<VeiculoResumo | []> {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`*,
      modelo: modelos ( * ),
      local: locais ( id, nome ),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas ( * )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    caracteristicas: data?.caracteristicas?.map((c: any) => c.caracteristica) ?? [],
  };
}

export function useVeiculos(id?: string) {
  return useQuery<VeiculoResumo | VeiculoResumo[]>({
    queryKey: id ? ["veiculo", id] : ["veiculos"],
    queryFn: id ? () => fetchVeiculo(id) : fetchVeiculos as any,
    enabled: id ? Boolean(id) : true,
    staleTime: 1000 * 60 * 5,
  });
}
