import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Empresa, MembroEmpresa } from "@/types";
import {
  atualizarEmpresaDoMembro,
  criarMembroEmpresa,
  criarEmpresa,
  removerMembroEmpresa,
  listarEmpresasAdmin,
  listarMembrosEmpresaAdmin,
  listarUsuarios,
  type UsuarioListado,
} from "@/services/admin";
import { QUERY_CONFIG } from "@/config";

export const adminKeys = {
  empresas: ["admin", "empresas"] as const,
  membros: ["admin", "membros"] as const,
  usuarios: ["admin", "usuarios"] as const,
};

export function useAdminEmpresas() {
  return useQuery<Empresa[]>({
    queryKey: adminKeys.empresas,
    queryFn: listarEmpresasAdmin,
    ...QUERY_CONFIG.admin.empresas,
  });
}

export function useAdminMembros() {
  return useQuery<MembroEmpresa[]>({
    queryKey: adminKeys.membros,
    queryFn: listarMembrosEmpresaAdmin,
    ...QUERY_CONFIG.admin.membros,
  });
}

export function useAdminUsuarios() {
  return useQuery<UsuarioListado[]>({
    queryKey: adminKeys.usuarios,
    queryFn: listarUsuarios,
    ...QUERY_CONFIG.admin.usuarios,
  });
}

type SalvarEmpresaPayload = {
  usuarioId: string;
  empresaId: string;
  membroId?: string | null;
  papel?: MembroEmpresa["papel"];
};

export function useSalvarEmpresaDoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ usuarioId, empresaId, membroId, papel }: SalvarEmpresaPayload) => {
      if (membroId) {
        return atualizarEmpresaDoMembro(membroId, empresaId);
      }

      return criarMembroEmpresa(usuarioId, empresaId, papel);
    },
    onSuccess: (membro) => {
      queryClient.setQueryData(adminKeys.membros, (prev?: MembroEmpresa[]) => {
        if (!prev) return [membro];

        const index = prev.findIndex((item) => item.id === membro.id);
        if (index === -1) {
          return [...prev, membro];
        }

        const clone = [...prev];
        clone[index] = membro;
        return clone;
      });
    },
  });
}

export function useCriarEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarEmpresa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.empresas });
    },
  });
}

export function useRemoverEmpresaDoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membroId: string) => removerMembroEmpresa(membroId),
    onSuccess: (_data, membroId) => {
      queryClient.setQueryData(adminKeys.membros, (prev?: MembroEmpresa[]) => {
        if (!prev) return prev;
        return prev.filter((membro) => membro.id !== membroId);
      });
    },
  });
}

export function useAtualizarPapelMembro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membroId, papel }: { membroId: string; papel: MembroEmpresa["papel"] }) => {
      const { atualizarPapelMembro } = await import("@/services/admin");
      return atualizarPapelMembro(membroId, papel);
    },
    onSuccess: (membro) => {
      queryClient.setQueryData(adminKeys.membros, (prev?: MembroEmpresa[]) => {
        if (!prev) return prev;
        return prev.map((item) => (item.id === membro.id ? membro : item));
      });
    },
  });
}

export function useAtualizarStatusMembro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membroId, ativo }: { membroId: string; ativo: boolean }) => {
      const { atualizarStatusMembro } = await import("@/services/admin");
      return atualizarStatusMembro(membroId, ativo);
    },
    onSuccess: (membro) => {
      queryClient.setQueryData(adminKeys.membros, (prev?: MembroEmpresa[]) => {
        if (!prev) return prev;
        return prev.map((item) => (item.id === membro.id ? membro : item));
      });
    },
  });
}
