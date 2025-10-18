import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarStatusVenda,
  buscarVenda,
  listarVendas,
  registrarVenda,
} from "@/services/vendas";
import type { Database } from "@/types/supabase";
import { QUERY_CONFIG } from "@/config";

const vendasKeys = {
  all: ["vendas"] as const,
  list: (empresaId: string, vendedorId?: string | null) =>
    ["vendas", "lista", empresaId, vendedorId ?? "all"] as const,
  detalhe: (id: string) => ["vendas", "detalhe", id] as const,
};

type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];
type VendaStatus = Database["public"]["Enums"]["status_venda"];

export function useVendas(
  empresaId?: string | null,
  vendedorId?: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: vendasKeys.list(empresaId ?? "", vendedorId),
    enabled: Boolean(empresaId) && enabled,
    queryFn: async () => {
      if (!empresaId) return [];
      return listarVendas({ empresaId, vendedorId });
    },
    ...QUERY_CONFIG.vendas,
  });
}

export function useVenda(id?: string | null, empresaId?: string | null) {
  return useQuery({
    queryKey: id ? vendasKeys.detalhe(id) : vendasKeys.all,
    enabled: Boolean(id && empresaId),
    queryFn: async () => {
      if (!id || !empresaId) return null;
      return buscarVenda(id, empresaId);
    },
    ...QUERY_CONFIG.vendas,
  });
}

export function useRegistrarVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendaInsert) => registrarVenda(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vendasKeys.list(variables.empresa_id, variables.vendedor_id),
      });
      queryClient.invalidateQueries({ queryKey: vendasKeys.all });
    },
  });
}

export function useAtualizarStatusVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: atualizarStatusVenda,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendasKeys.detalhe(variables.vendaId) });
      queryClient.invalidateQueries({ queryKey: vendasKeys.all });
    },
  });
}

export function useVendasKeys() {
  return useMemo(() => vendasKeys, []);
}
