import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

const FOTOS_BUCKET = "fotos_veiculos_loja";

export type FotoVeiculoLoja = {
  id: string;
  path: string;
  url: string;
  eCapa: boolean;
  ordem: number;
};

type Params = {
  empresaId?: string | null;
  lojaId?: string | null;
  veiculoId?: string | null;
};

const buildPublicUrl = (path: string) => {
  const { data } = supabase.storage.from(FOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl ?? "";
};

async function fetchFotos({ empresaId, lojaId, veiculoId }: Required<Params>) {
  const { data, error } = await supabase
    .from("fotos_metadados")
    .select("id, path, e_capa, ordem")
    .eq("empresa_id", empresaId)
    .eq("loja_id", lojaId)
    .eq("veiculo_id", veiculoId)
    .order("ordem", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    path: item.path,
    url: buildPublicUrl(item.path),
    eCapa: Boolean(item.e_capa),
    ordem: item.ordem,
  })) as FotoVeiculoLoja[];
}

export function useFotosVeiculoLoja(params: Params) {
  const { empresaId, lojaId, veiculoId } = params;
  const enabled = Boolean(empresaId && lojaId && veiculoId);

  return useQuery({
    queryKey: [
      "fotos_veiculo_loja",
      empresaId ?? null,
      lojaId ?? null,
      veiculoId ?? null,
    ],
    queryFn: () =>
      fetchFotos({
        empresaId: empresaId!,
        lojaId: lojaId!,
        veiculoId: veiculoId!,
      }),
    enabled,
  });
}

