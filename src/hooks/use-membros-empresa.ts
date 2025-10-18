import { useQuery } from "@tanstack/react-query";

import type { MembroEmpresa } from "@/types";
import { fetchMembroEmpresaDoUsuario } from "@/services/empresa";
import { QUERY_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/useAuthStore";

const membrosEmpresaKeys = {
  usuario: (userId?: string | null) => ["membros_empresa", "usuario", userId] as const,
};

export function useMembrosEmpresaDoUsuario(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery<MembroEmpresa | null>({
    queryKey: membrosEmpresaKeys.usuario(userId),
    queryFn: () => fetchMembroEmpresaDoUsuario(userId),
    ...QUERY_CONFIG.empresa,
    enabled: Boolean(userId) && enabled,
  });
}
