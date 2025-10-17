import { useQuery } from "@tanstack/react-query";
import type { Loja, Plataforma, Caracteristica, Modelo, Local, UnidadeLoja } from "@/types";
import { listar_tabela } from "@/services";
import { QUERY_CONFIG } from "@/config";
import { salvarConfiguracao } from "@/services/configuracoes";

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
    ...QUERY_CONFIG.configuracoes,
  });
}

export function usePlataformas() {
  return useQuery<Plataforma[]>({
    queryKey: configuracoesKeys.plataformas,
    queryFn: () => listar_tabela("plataformas"),
    ...QUERY_CONFIG.configuracoes,
  });
}

export function useCaracteristicas() {
  const query = useQuery<Caracteristica[]>({
    queryKey: configuracoesKeys.caracteristicas,
    queryFn: () => listar_tabela("caracteristicas"),
    ...QUERY_CONFIG.configuracoes,
  });

  return {
    ...query,
    add: (nome: string) => salvarConfiguracao("caracteristica",
      { nome: nome }),
    remove: (id: string) => listar_tabela("caracteristicas", {
      column: "id",
      operator: "neq",
      value: id,
    }),
    update: (id: string, nome: string) => salvarConfiguracao("caracteristica",
      { id: id, nome: nome })
  }
}

export function useModelos() {
  return useQuery<Modelo[]>({
    queryKey: configuracoesKeys.modelos,
    queryFn: () => listar_tabela("modelos"),
    ...QUERY_CONFIG.configuracoes,
  });
}

export type LocalComOrigem = Local & {
  origem: "local" | "unidade";
  loja_nome?: string | null;
  label?: string;
  prioridade?: number;
  pertenceALoja?: boolean;
};

export function useLocais() {
  return useQuery<LocalComOrigem[]>({
    queryKey: configuracoesKeys.locais,
    queryFn: async (): Promise<LocalComOrigem[]> => {
      // Busca simultânea das tabelas
      const [locaisRaw, unidadesRaw, lojasRaw] = await Promise.all([
        listar_tabela("locais"),
        listar_tabela("unidades_loja"),
        listar_tabela("lojas"),
      ]);

      const locais = (locaisRaw ?? []) as Local[];
      const unidades = (unidadesRaw ?? []) as UnidadeLoja[];
      const lojas = (lojasRaw ?? []) as Loja[];

      // Cria mapa de nome de loja por ID
      const lojaNomePorId = new Map<string, string>(
        lojas.map((l) => [l.id, l.nome]),
      );

      // 🔹 Locais
      const locaisAdaptados: LocalComOrigem[] = locais.map((local) => ({
        ...local,
        origem: "local",
        loja_nome: local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null,
        label: local.loja_id
          ? `${lojaNomePorId.get(local.loja_id) ?? "Loja desconhecida"} • ${local.nome}`
          : local.nome,
        prioridade: local.loja_id ? 1 : 2,
      }));

      // 🔹 Unidades
      const unidadesAdaptadas: LocalComOrigem[] = unidades.map((unidade) => {
        const lojaNome = unidade.loja_id ? lojaNomePorId.get(unidade.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${unidade.nome}` : unidade.nome;

        return {
          ...unidade,
          origem: "unidade",
          loja_nome: lojaNome,
          label,
          prioridade: 0,
        };
      });

      // 🔹 Junta tudo e ordena (sem 'any')
      const todos: LocalComOrigem[] = [...unidadesAdaptadas, ...locaisAdaptados].sort(
        (a: LocalComOrigem, b: LocalComOrigem) => {
          const pa = a.prioridade ?? 99;
          const pb = b.prioridade ?? 99;
          if (pa !== pb) return pa - pb;

          const la = a.label ?? "";
          const lb = b.label ?? "";
          return la.localeCompare(lb, "pt-BR", { sensitivity: "base" });
        },
      );

      // ✅ Garante retorno (corrige o erro TS2355)
      return todos;
    },
    ...QUERY_CONFIG.configuracoes,
  });
}

export type UnidadeLojaComposta = {
  id: string;
  nome: string;        // Nome já composto: Loja + Unidade
  nome_unidade: string; // Apenas nome da unidade
  loja_id: string | null;
};

/**
 * Retorna as unidades já com nome composto:
 * "Loja Central * Principal"
 */

export function useUnidadesLoja() {
  const { data: lojas = [], isLoading: isLojasLoading } = useLojas();

  return useQuery<UnidadeLoja[]>({
    queryKey: ["configuracoes", "unidadesLoja"],
    enabled: !isLojasLoading, // 🚀 só executa quando lojas tiverem carregado
    queryFn: async () => {
      const unidades = await listar_tabela("unidades_loja");

      // 💡 monta nome composto “Loja * Unidade”
      const resposta = unidades.map((u) => {
        const lojaNome = lojas.find((l) => l.id === u.loja_id)?.nome ?? null;
        return {
          ...u,
          nome: lojaNome ? `${lojaNome} * ${u.nome}` : u.nome,
        };
      });

      console.warn("✅ Unidades com nome composto", resposta);
      console.warn("✅ Lojas carregadas", lojas);

      return resposta;
    },
    ...QUERY_CONFIG.configuracoes,
  });
}