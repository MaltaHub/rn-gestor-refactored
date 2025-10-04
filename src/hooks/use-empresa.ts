import { useQuery } from "@tanstack/react-query";
import { fetchMembroEmpresaDoUsuario } from "@/services/empresa";
import type { MembroEmpresa } from "@/types";

export function useEmpresaDoUsuario(enabled = true) {
  const query = useQuery<MembroEmpresa | null, Error>({
    queryKey: ["empresa_usuario"],
    queryFn: fetchMembroEmpresaDoUsuario,
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  return query;
}
