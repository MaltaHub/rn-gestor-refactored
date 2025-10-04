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

export const adminKeys = {
  empresas: ["admin", "empresas"] as const,
  membros: ["admin", "membros"] as const,
  usuarios: ["admin", "usuarios"] as const,
};

export function useAdminEmpresas() {
  return useQuery<Empresa[]>({
    queryKey: adminKeys.empresas,
    queryFn: listarEmpresasAdmin,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminMembros() {
  return useQuery<MembroEmpresa[]>({
    queryKey: adminKeys.membros,
    queryFn: listarMembrosEmpresaAdmin,
    staleTime: 1000 * 60,
  });
}

export function useAdminUsuarios() {
  return useQuery<UsuarioListado[]>({
    queryKey: adminKeys.usuarios,
    queryFn: listarUsuarios,
    staleTime: 1000 * 30,
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
