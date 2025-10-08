import { useQuery } from "@tanstack/react-query";
import { fetchMembroEmpresaDoUsuario } from "@/services/empresa";
import type { MembroEmpresa } from "@/types";
import { QUERY_CONFIG } from "@/config";

export function useEmpresaDoUsuario(enabled = true) {
  const query = useQuery<MembroEmpresa | null, Error>({
    queryKey: ["empresa_usuario"],
    queryFn: fetchMembroEmpresaDoUsuario,
    ...QUERY_CONFIG.empresa,
    enabled,
  });

  return query;
}
