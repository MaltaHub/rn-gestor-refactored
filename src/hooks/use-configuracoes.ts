import { useQuery } from "@tanstack/react-query";
import type { Loja, Plataforma, Caracteristica, Modelo, Local, UnidadeLoja } from "@/types";
import { listar_tabela } from "@/services";

export type LocalComOrigem = Local & { origem: "local" | "unidade" };

const configuracoesKeys = {
  lojas: ["configuracoes", "loja"] as const,
  plataformas: ["configuracoes", "plataforma"] as const,
  caracteristicas: ["configuracoes", "caracteristica"] as const,
  modelos: ["configuracoes", "modelo"] as const,
  locais: ["configuracoes", "local"] as const,
  unidadesLoja: ["configuracoes", "unidade_loja"] as const,
};

// --- Hooks apenas de leitura -----------------------------------------------

export function useLojas() {
  return useQuery<Loja[]>({
    queryKey: configuracoesKeys.lojas,
    queryFn: () => listar_tabela("lojas"),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlataformas() {
  return useQuery<Plataforma[]>({
    queryKey: configuracoesKeys.plataformas,
    queryFn: () => listar_tabela("plataformas"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCaracteristicas() {
  return useQuery<Caracteristica[]>({
    queryKey: configuracoesKeys.caracteristicas,
    queryFn: () => listar_tabela("caracteristicas"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useModelos() {
  return useQuery<Modelo[]>({
    queryKey: configuracoesKeys.modelos,
    queryFn: () => listar_tabela("modelos"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLocais() {
  return useQuery<LocalComOrigem[]>({
    queryKey: configuracoesKeys.locais,
    queryFn: async () => {
      const [locais, unidades] = await Promise.all([
        listar_tabela("locais"),
        listar_tabela("unidades_loja"),
      ]);

      const locaisAdaptados = (locais ?? []).map((local) => ({
        ...local,
        origem: "local" as const,
      }));

      const unidadesAdaptadas = (unidades ?? []).map((unidade) => ({
        id: unidade.id,
        nome: unidade.nome,
        empresa_id: unidade.empresa_id,
        loja_id: unidade.loja_id,
        logradouro: unidade.logradouro,
        cep: unidade.cep,
        origem: "unidade" as const,
      } satisfies LocalComOrigem));

      const unificados = [...locaisAdaptados, ...unidadesAdaptadas];
      const mapa = new Map<string, LocalComOrigem>();
      for (const item of unificados) {
        mapa.set(item.id, item);
      }

      return Array.from(mapa.values());
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUnidadesLoja() {
  return useQuery<UnidadeLoja[]>({
    queryKey: configuracoesKeys.unidadesLoja,
    queryFn: () => listar_tabela("unidades_loja"),
    staleTime: 1000 * 60 * 5,
  });
}
