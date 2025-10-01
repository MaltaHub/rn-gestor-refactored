import { useVeiculos } from "@/hooks/use-estoque";
import { useModelos, useLocais } from "@/hooks/use-configuracoes";
import type { VeiculoResumo } from "@/types/estoque";

// 🔹 Hook único
export function useVeiculosUI<T>(id?: string) : {
  data: T;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useVeiculos(id);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();

  console.log("isLoading:", isLoading);

  if (!data || !modelos || !locais) {
    return {
      data: null as T,
      isLoading,
      error,
    } as const;
  }

  if (id) {
    const veiculo = Array.isArray(data)
      ? data[0]
      : data; // caso o hook já traga direto um único veículo

    return {
      data: veiculo as T,
      isLoading,
      error,
    } as const;
  }

  // retorna lista adaptada
  return {
    data: data as T,
    isLoading,
    error,
  } as const;
}
