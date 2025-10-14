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
  loja_id: string | null;
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

const attachFotos = async (
  rows: RawVeiculoLoja[],
): Promise<RawVeiculoLojaWithFotos[]> => {
  if (rows.length === 0) return rows.map((row) => ({ ...row, temFotos: false, capaUrl: null }));

  const veiculoIds = rows
    .map((row) => row.veiculo?.id ?? null)
    .filter((value): value is string => Boolean(value));

  if (veiculoIds.length === 0) return rows.map((row) => ({ ...row, temFotos: false, capaUrl: null }));

  const lojaIds = Array.from(
    new Set<string>(
      rows
        .map((row) => row.loja_id ?? null)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  let query = supabase
    .from("fotos_metadados")
    .select("veiculo_id, path, e_capa, ordem, loja_id")
    .in("veiculo_id", veiculoIds);

  if (lojaIds.length > 0) {
    const conditions = ["loja_id.is.null", ...lojaIds.map((id) => `loja_id.eq.${id}`)].join(",");
    query = query.or(conditions);
  } else {
    query = query.is("loja_id", null);
  }

  const { data: fotos, error } = await query;

  if (error) throw error;

  // Agrupa fotos por veículo, separando por loja, globais e conjunto completo
  const porVeiculo = new Map<
    string,
    {
      porLoja: Map<string | null, FotoMetadataRow[]>;
      globais: FotoMetadataRow[];
      todas: FotoMetadataRow[];
    }
  >();

  for (const foto of (fotos ?? []) as FotoMetadataRow[]) {
    const entry = porVeiculo.get(foto.veiculo_id) ?? {
      porLoja: new Map<string | null, FotoMetadataRow[]>(),
      globais: [] as FotoMetadataRow[],
      todas: [] as FotoMetadataRow[],
    };

    const lojaKey = foto.loja_id ?? null;
    const listaLoja = entry.porLoja.get(lojaKey) ?? [];
    listaLoja.push(foto);
    entry.porLoja.set(lojaKey, listaLoja);

    if (lojaKey === null) {
      entry.globais.push(foto);
    }

    entry.todas.push(foto);
    porVeiculo.set(foto.veiculo_id, entry);
  }

  const pickCapa = (lista: FotoMetadataRow[] | undefined): { temFotos: boolean; capaUrl: string | null } => {
    if (!lista || lista.length === 0) return { temFotos: false, capaUrl: null };
    const ordenado = [...lista].sort((a, b) => a.ordem - b.ordem);
    const capa = ordenado.find((it) => it.e_capa) ?? ordenado[0] ?? null;
    return { temFotos: ordenado.length > 0, capaUrl: capa?.path ?? null };
  };

  const resolveCapa = (...listas: (FotoMetadataRow[] | undefined)[]) => {
    for (const lista of listas) {
      const info = pickCapa(lista);
      if (info.temFotos) return info;
    }
    return { temFotos: false, capaUrl: null };
  };

  const extraCache = new Map<string, FotoMetadataRow[]>();
  const fetchFotosExtras = async (veiculoId: string) => {
    if (extraCache.has(veiculoId)) {
      return extraCache.get(veiculoId) ?? [];
    }
    const { data: extra, error: extraError } = await supabase
      .from("fotos_metadados")
      .select("veiculo_id, path, e_capa, ordem, loja_id")
      .eq("veiculo_id", veiculoId);
    if (extraError) {
      // Falha ao carregar fotos adicionais; retorna lista vazia como fallback.
      extraCache.set(veiculoId, []);
      return [];
    }
    const lista = (extra ?? []) as FotoMetadataRow[];
    extraCache.set(veiculoId, lista);
    return lista;
  };

  return Promise.all(rows.map(async (row) => {
    const veiculoId = row.veiculo?.id ?? null;
    if (!veiculoId) return { ...row, temFotos: false, capaUrl: null };
    const agrupado = porVeiculo.get(veiculoId);
    if (!agrupado) {
      // Nenhuma foto foi retornada para este veículo/loja na primeira busca.
      const extras = await fetchFotosExtras(veiculoId);
      if (extras.length) {
        const lojaKeyExtra = row.loja_id ?? null;
        const infoExtra = resolveCapa(
          extras.filter((foto) => (foto.loja_id ?? null) === lojaKeyExtra),
          extras.filter((foto) => foto.loja_id === null),
          extras,
        );
        if (infoExtra?.temFotos) {
          // Recuperou uma capa a partir da busca extra (sem agrupamento inicial).
          return { ...row, temFotos: true, capaUrl: infoExtra.capaUrl };
        }
      }
      // Ainda sem fotos mesmo após tentar novamente.
      return { ...row, temFotos: false, capaUrl: null };
    }
    const lojaKey = row.loja_id ?? null;
    const especifica = agrupado.porLoja.get(lojaKey);
    const infoEspecifica = pickCapa(especifica);
    if (infoEspecifica.temFotos) {
      // Utiliza capa da loja específica.
      return { ...row, temFotos: true, capaUrl: infoEspecifica.capaUrl };
    }

    const infoGlobal = pickCapa(agrupado.globais);
    if (infoGlobal.temFotos) {
      // Utiliza capa global (loja_id = null).
      return { ...row, temFotos: true, capaUrl: infoGlobal.capaUrl };
    }

    const infoFallback = pickCapa(agrupado.todas);
    if (infoFallback.temFotos) {
      // Fallback: qualquer foto disponível após ordenação.
      return { ...row, temFotos: true, capaUrl: infoFallback.capaUrl };
    }

    // Busca adicional no Supabase como último recurso
    const extras = await fetchFotosExtras(veiculoId);
    if (extras.length) {
      const infoExtra = resolveCapa(
        extras.filter((foto) => (foto.loja_id ?? null) === lojaKey),
        extras.filter((foto) => foto.loja_id === null),
        extras,
      );

      if (infoExtra?.temFotos) {
        // Recupera capa através da consulta extra (considerando outras lojas).
        return { ...row, temFotos: true, capaUrl: infoExtra.capaUrl };
      }
    }

    // Apesar das tentativas, nenhuma foto foi localizada.
    return { ...row, temFotos: false, capaUrl: null };
  }));
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
