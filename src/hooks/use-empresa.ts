import { useQuery } from "@tanstack/react-query";

import { fetchEmpresaDoUsuario } from "@/services/empresa";

export function useEmpresaDoUsuario(enabled = true) {
  return useQuery({
    queryKey: ["empresa_do_usuario"],
    queryFn: fetchEmpresaDoUsuario,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
