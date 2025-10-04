import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { adaptVeiculo } from "@/adapters/adaptador-estoque";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";
import { useLocais, useModelos } from "@/hooks/use-configuracoes";
import type {
  Caracteristica,
  Loja,
  Modelo,
  Local,
  VeiculoLoja,
} from "@/types";
import type { VeiculoResumo } from "@/types/estoque";

const FOTOS_BUCKET = "fotos_veiculos_loja";

type CaracteristicaPivot = {
  caracteristica: Caracteristica | null;
} | null;

type RawVeiculo = (VeiculoResumo & {
  caracteristicas?: CaracteristicaPivot[] | null;
}) | null;

type RawVeiculoLoja = VeiculoLoja & {
  veiculo: RawVeiculo;
  loja: Loja | null;
};

type RawVeiculoLojaWithFotos = RawVeiculoLoja & {
  temFotos: boolean;
  capaUrl: string | null;
};

type FotoMetadataRow = {
  veiculo_id: string;
  path: string;
  e_capa: boolean;
  ordem: number;
  loja_id: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

const toVeiculoResumo = (raw: RawVeiculo): VeiculoResumo | null => {
  if (!raw) return null;
  const caracteristicas = (raw.caracteristicas ?? [])
    .map((pivot) => pivot?.caracteristica ?? null)
    .filter((item): item is Caracteristica => Boolean(item));

  return {
    ...raw,
    caracteristicas,
  };
};

const getPublicUrl = (path: string | null): string | null => {
  if (!path) return null;
  const result = supabase.storage.from(FOTOS_BUCKET).getPublicUrl(path);
  return result.data?.publicUrl ?? null;
};

async function fetchVeiculosLoja(lojaId: string): Promise<RawVeiculoLoja[]> {
  const query = supabase
    .from("veiculos_loja")
    .select(
      `*,
      veiculo: veiculos (
        *,
        modelo: modelos (*),
        caracteristicas: caracteristicas_veiculos (
          caracteristica: caracteristicas (*)
        )
      ),
      loja: lojas (*)
    `,
    )
    .eq("loja_id", lojaId)
    .order("data_entrada", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as RawVeiculoLoja[];
}

async function fetchVeiculoLojaById(id: string): Promise<RawVeiculoLoja | null> {
  const query = supabase
    .from("veiculos_loja")
    .select(
      `*,
      veiculo: veiculos (
        *,
        modelo: modelos (*),
        caracteristicas: caracteristicas_veiculos (
          caracteristica: caracteristicas (*)
        )
      ),
      loja: lojas (*)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as RawVeiculoLoja | null) ?? null;
}

const buildFotosMaps = async (
  rows: RawVeiculoLoja[],
): Promise<Map<string, { temFotos: boolean; capaUrl: string | null }>> => {
  const veiculoIds = rows
    .map((row) => row.veiculo?.id ?? null)
    .filter((value): value is string => Boolean(value));

  if (veiculoIds.length === 0) {
    return new Map();
  }

  const lojaIds = Array.from(new Set(rows.map((row) => row.loja_id)));

  let fotosQuery = supabase
    .from("fotos_metadados")
    .select("veiculo_id, path, e_capa, ordem, loja_id")
    .in("veiculo_id", veiculoIds);

  if (lojaIds.length === 1) {
    fotosQuery = fotosQuery.eq("loja_id", lojaIds[0]!);
  } else {
    fotosQuery = fotosQuery.in("loja_id", lojaIds);
  }

  const { data: fotos, error } = await fotosQuery;

  if (error) {
    throw error;
  }

  const agrupado = new Map<string, FotoMetadataRow[]>();
  for (const foto of (fotos ?? []) as FotoMetadataRow[]) {
    const lista = agrupado.get(foto.veiculo_id) ?? [];
    lista.push(foto);
    agrupado.set(foto.veiculo_id, lista);
  }

  const resultado = new Map<string, { temFotos: boolean; capaUrl: string | null }>();

  agrupado.forEach((lista, veiculoId) => {
    const ordenado = [...lista].sort((a, b) => {
      if (a.e_capa === b.e_capa) {
        return a.ordem - b.ordem;
      }
      return a.e_capa ? -1 : 1;
    });

    const capa = ordenado.find((item) => item.e_capa) ?? ordenado[0];
    resultado.set(veiculoId, {
      temFotos: ordenado.length > 0,
      capaUrl: capa ? getPublicUrl(capa.path) : null,
    });
  });

  return resultado;
};

const attachFotos = async (
  rows: RawVeiculoLoja[],
): Promise<RawVeiculoLojaWithFotos[]> => {
  if (rows.length === 0) return rows.map((row) => ({ ...row, temFotos: false, capaUrl: null }));

  const fotosMap = await buildFotosMaps(rows);

  return rows.map((row) => {
    const veiculoId = row.veiculo?.id ?? null;
    const fotosInfo = veiculoId ? fotosMap.get(veiculoId) : undefined;
    return {
      ...row,
      temFotos: fotosInfo?.temFotos ?? false,
      capaUrl: fotosInfo?.capaUrl ?? null,
    };
  });
};

export type VeiculoLojaUI = {
  id: string;
  lojaId: string;
  empresaId: string;
  veiculoId: string;
  precoLoja: number | null;
  precoLojaFormatado: string | null;
  dataEntrada: string | null;
  dataEntradaFormatada: string | null;
  temFotos: boolean;
  capaUrl: string | null;
  lojaNome: string | null;
  loja: Loja | null;
  veiculo: VeiculoUI | null;
};

const adaptVeiculoLoja = (
  row: RawVeiculoLojaWithFotos,
  modelos: Modelo[] = [],
  locais: Local[] = [],
): VeiculoLojaUI => {
  const veiculoResumo = toVeiculoResumo(row.veiculo);
  const veiculoAdaptado = veiculoResumo ? adaptVeiculo(veiculoResumo, modelos, locais) : null;

  const precoLoja = row.preco ?? null;
  const dataEntrada = row.data_entrada ?? null;
  const dataEntradaFormatada = dataEntrada ? dateFormatter.format(new Date(dataEntrada)) : null;

  return {
    id: row.id,
    lojaId: row.loja_id,
    empresaId: row.empresa_id,
    veiculoId: row.veiculo?.id ?? "",
    precoLoja,
    precoLojaFormatado: typeof precoLoja === "number" ? currencyFormatter.format(precoLoja) : null,
    dataEntrada,
    dataEntradaFormatada,
    temFotos: row.temFotos,
    capaUrl: row.capaUrl,
    lojaNome: row.loja?.nome ?? null,
    loja: row.loja ?? null,
    veiculo: veiculoAdaptado,
  };
};

export const veiculosLojaKeys = {
  lista: (lojaId: string | undefined) => ["vitrine", "loja", lojaId] as const,
  detalhe: (id: string | undefined) => ["vitrine", "detalhe", id] as const,
};

export function useVeiculosLojaUI(lojaId?: string) {
  const { data: modelos = [], isLoading: isModelosLoading } = useModelos();
  const { data: locais = [], isLoading: isLocaisLoading } = useLocais();

  const query = useQuery<RawVeiculoLojaWithFotos[]>({
    queryKey: veiculosLojaKeys.lista(lojaId),
    queryFn: async () => {
      if (!lojaId) return [] as RawVeiculoLojaWithFotos[];
      const base = await fetchVeiculosLoja(lojaId);
      return attachFotos(base);
    },
    enabled: Boolean(lojaId),
  });

  const isLoading = query.isLoading || isModelosLoading || isLocaisLoading;

  const data = useMemo(() => {
    if (!query.data) return [] as VeiculoLojaUI[];
    return query.data.map((row) => adaptVeiculoLoja(row, modelos, locais));
  }, [query.data, modelos, locais]);

  return {
    ...query,
    data,
    isLoading,
  } as const;
}

export function useVeiculoLojaUI(id?: string) {
  const { data: modelos = [], isLoading: isModelosLoading } = useModelos();
  const { data: locais = [], isLoading: isLocaisLoading } = useLocais();

  const query = useQuery<RawVeiculoLojaWithFotos | null>({
    queryKey: veiculosLojaKeys.detalhe(id),
    queryFn: async () => {
      if (!id) return null as RawVeiculoLojaWithFotos | null;
      const base = await fetchVeiculoLojaById(id);
      if (!base) return null;
      const [comFotos] = await attachFotos([base]);
      return comFotos;
    },
    enabled: Boolean(id),
  });

  const isLoading = query.isLoading || isModelosLoading || isLocaisLoading;

  const data = useMemo(() => {
    if (!query.data) return null;
    return adaptVeiculoLoja(query.data, modelos, locais);
  }, [query.data, modelos, locais]);

  return {
    ...query,
    data,
    isLoading,
  } as const;
}
