import { useQuery } from "@tanstack/react-query";
import { fetchMembroEmpresaDoUsuario } from "@/services/empresa";
import type { MembroEmpresa } from "@/types";
import { QUERY_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/useAuthStore";

export function useEmpresaDoUsuario(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery<MembroEmpresa | null, Error>({
    queryKey: ["empresa_usuario", userId],
    queryFn: () => fetchMembroEmpresaDoUsuario(userId),
    ...QUERY_CONFIG.empresa,
    enabled: Boolean(userId) && enabled,
  });
}
