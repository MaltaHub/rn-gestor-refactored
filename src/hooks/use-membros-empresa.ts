import { useQuery } from "@tanstack/react-query";

import type { MembroEmpresa } from "@/types";
import { fetchMembroEmpresaDoUsuario } from "@/services/empresa";
import { QUERY_CONFIG } from "@/config";

const membrosEmpresaKeys = {
  usuario: ["membros_empresa", "usuario"] as const,
};

export function useMembrosEmpresaDoUsuario(enabled = true) {
  return useQuery<MembroEmpresa | null>({
    queryKey: membrosEmpresaKeys.usuario,
    queryFn: fetchMembroEmpresaDoUsuario,
    ...QUERY_CONFIG.empresa,
    enabled,
  });
}
