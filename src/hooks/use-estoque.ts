import { supabase } from "@/lib/supabase";
import { Veiculo } from "@/types/estoque";
import { useQuery } from "@tanstack/react-query";

async function fetchVeiculos() {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`
      id,
      placa,
      cor,
      estado_venda,
      estado_veiculo,
      preco_venal,
      registrado_em,
      modelo: modelos ( id, nome, marca ),
      local: locais ( id, nome ),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas ( id, nome )
      )
    `)
    .order("registrado_em", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((v: any) => ({
    ...v,
    caracteristicas: v.caracteristicas?.map((c: any) => c.caracteristica) ?? [],
  }));
}

async function fetchVeiculo(id: string) {
  const { data, error } = await supabase
    .from("veiculos")
    .select(`
      id,
      placa,
      cor,
      estado_venda,
      estado_veiculo,
      preco_venal,
      registrado_em,
      modelo: modelos ( id, nome, marca ),
      local: locais ( id, nome ),
      caracteristicas: caracteristicas_veiculos (
        caracteristica: caracteristicas ( id, nome )
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
  return useQuery({
    queryKey: id ? ["veiculo", id] : ["veiculos"],
    queryFn: id ? () => fetchVeiculo(id) : fetchVeiculos as any,
    enabled: id ? Boolean(id) : true,
    staleTime: 1000 * 60 * 5,
  });
}
