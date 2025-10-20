import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/config";
import { listar_tabela } from "@/services";
import type { UnidadeLoja } from "@/types";

export type UnidadeLojaQueryItem = UnidadeLoja & {
  nomeFormatado?: string | null;
};

export function useUnidadesLojaQuery(lojaId?: string | null) {
  return useQuery<UnidadeLojaQueryItem[]>({
    queryKey: ["configuracoes", "unidadesLoja", "porLoja", lojaId ?? "sem-loja"],
    enabled: Boolean(lojaId),
    queryFn: async () => {
      if (!lojaId) return [];

      const unidades = await listar_tabela("unidades_loja", {
        column: "loja_id",
        operator: "eq",
        value: lojaId,
      });

      return unidades.map((unidade) => ({
        ...unidade,
        nomeFormatado: unidade.nome ?? null,
      }));
    },
    placeholderData: [],
    ...QUERY_CONFIG.configuracoes,
  });
}
