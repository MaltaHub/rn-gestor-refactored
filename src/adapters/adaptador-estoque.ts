import { useVeiculos } from "@/hooks/use-estoque";
import { useModelos, useLocais } from "@/hooks/use-configuracoes";
import type { Veiculo } from "@/types/estoque";
import type { Modelo, Local, Caracteristica } from "@/types/supabase";

// Tipo final para a UI
export interface VeiculoUI {
  id: string;
  placa: string;
  cor: string;
  precoFormatado: string;
  status: string;
  modelo?: Modelo;
  local?: Local;
  caracteristicas: Caracteristica[];
}

// 🔹 Monta o "prato"
function montarVeiculo(
  veiculo: Veiculo,
  modelos: Modelo[] = [],
  locais: Local[] = [],
): VeiculoUI {
  const modelo = modelos.find((m) => m.id === veiculo.modelo_id);
  const local = locais.find((l) => l.id === veiculo.local_id);

  return {
    id: veiculo.id,
    placa: veiculo.placa,
    cor: veiculo.cor,
    precoFormatado:
      veiculo.preco_venal?.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }) ?? "—",
    status:
      veiculo.estado_venda === "disponivel"
        ? "✅ Disponível"
        : veiculo.estado_venda === "reservado"
          ? "⏳ Reservado"
          : "🚫 Indisponível",
    modelo,
    local,
    caracteristicas: (veiculo.caracteristicas ?? []) as Caracteristica[],
  };
}

// 🔹 Hook único
export function useVeiculosUI(id?: string) {
  const { data: veiculos, isLoading, error } = useVeiculos(id);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();

  console.log("LOCALS", locais);

  if (!veiculos || !modelos || !locais) {
    return {
      data: id ? undefined : [],
      isLoading,
      error,
    } as const;
  }

  if (id) {
    const veiculo = Array.isArray(veiculos)
      ? veiculos[0]
      : veiculos; // caso o hook já traga direto um único veículo

    return {
      data: veiculo ? montarVeiculo(veiculo, modelos, locais) : undefined,
      isLoading,
      error,
    } as const;
  }

  // retorna lista adaptada
  return {
    data: (veiculos as Veiculo[]).map((v) => montarVeiculo(v, modelos, locais)),
    isLoading,
    error,
  } as const;
}
