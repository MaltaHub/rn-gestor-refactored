import { useQuery } from "@tanstack/react-query";
import type { Loja, Plataforma, Caracteristica, Modelo, Local, UnidadeLoja } from "@/types";
import { listar_tabela } from "@/services";

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
  return useQuery<Local[]>({
    queryKey: configuracoesKeys.locais,
    queryFn: () => listar_tabela("locais"),
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
