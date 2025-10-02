import { useVeiculos } from "@/hooks/use-estoque";
import { useModelos, useLocais } from "@/hooks/use-configuracoes";
import type { VeiculoResumo } from "@/types/estoque";
import type { Modelo, Local } from "@/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const formatEnumLabel = (value?: string | null) => {
  if (!value) return null;
  return value
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
};

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") return null;
  return currencyFormatter.format(value);
};

const formatKilometros = (value?: number | null) => {
  if (typeof value !== "number") return null;
  return `${numberFormatter.format(value)} km`;
};

const buildModeloCompleto = (modelo: Modelo | null) => {
  if (!modelo) return "Modelo não informado";
  const parts = [modelo.nome, modelo.motor, modelo.edicao, formatEnumLabel(modelo.tipo_cambio)]
    .map((part) => (part && part.trim() !== "" ? part : null))
    .filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" • ") : modelo.nome ?? "Modelo não informado";
};

const buildModeloDisplay = (modelo: Modelo | null) => {
  if (!modelo) return "Modelo não informado";
  const parts = [modelo.nome, modelo.motor, modelo.combustivel, modelo.edicao, modelo.tipo_cambio ].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" ").toUpperCase() : modelo.nome.toUpperCase() ?? "Modelo não informado";
};

const buildVeiculoDisplay = (veiculo: VeiculoResumo | null) => {
  if (!veiculo) return "Veiculo não informado";
  const modelo = veiculo.modelo ?? null;
  const parts = [modelo?.nome, modelo?.motor, modelo?.combustivel, modelo?.edicao, modelo?.tipo_cambio, veiculo.cor, veiculo.ano_modelo, `${veiculo.hodometro}km` ].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" ").toUpperCase() : modelo?.nome.toUpperCase() ?? "Modelo não informado";
};

const pickCaracterísticas = (nomes: (string | null | undefined)[] = []) => {
  const limpo = nomes.filter((nome): nome is string => Boolean(nome && nome.trim() !== ""));
  const principais = limpo.slice(0, 3);
  const extras = Math.max(limpo.length - principais.length, 0);
  return { principais, extras } as const;
};

export type VeiculoUI = VeiculoResumo & {
  modelo: Modelo | null;
  local: Local | null;
  veiculoDisplay: string;
  modeloCompleto: string;
  modeloDisplay: string;
  modeloMarca: string | null;
  anoPrincipal: number | null;
  localNome: string | null;
  localDisplay: string;
  precoFormatado: string | null;
  hodometroFormatado: string | null;
  estadoVendaLabel: string;
  estadoVeiculoLabel: string;
  caracteristicasPrincipais: string[];
  caracteristicasExtrasTotal: number;
};

type UseVeiculosUIListResult = {
  data: VeiculoUI[];
  isLoading: boolean;
  error: Error | null;
};

type UseVeiculosUISingleResult = {
  data: VeiculoUI | null;
  isLoading: boolean;
  error: Error | null;
};

export const adaptVeiculo = (
  veiculo: VeiculoResumo,
  modelos: Modelo[],
  locais: Local[],
): VeiculoUI => {
  const modelo = veiculo.modelo ?? modelos.find((item) => item.id === veiculo.modelo_id) ?? null;
  const local = veiculo.local ?? locais.find((item) => item.id === veiculo.local_id) ?? null;

  const veiculoDisplay = buildVeiculoDisplay(veiculo);

  const modeloCompleto = buildModeloCompleto(modelo);
  const modeloDisplay = buildModeloDisplay(modelo);
  const modeloMarca = modelo?.marca ?? null;

  const localNome = local?.nome ?? null;
  const localDisplay = localNome ?? "Sem local vinculado";

  const caracteristicasNomes = (veiculo.caracteristicas ?? []).map((item) => item?.nome ?? null);
  const { principais: caracteristicasPrincipais, extras: caracteristicasExtrasTotal } = pickCaracterísticas(
    caracteristicasNomes,
  );

  return {
    ...veiculo,
    modelo: modelo ?? null,
    local: local ?? null,
    veiculoDisplay,
    modeloCompleto,
    modeloDisplay,
    modeloMarca,
    anoPrincipal: veiculo.ano_modelo ?? veiculo.ano_fabricacao ?? null,
    localNome,
    localDisplay,
    precoFormatado: formatCurrency(veiculo.preco_venal),
    hodometroFormatado: formatKilometros(veiculo.hodometro),
    estadoVendaLabel: formatEnumLabel(veiculo.estado_venda) ?? "Não informado",
    estadoVeiculoLabel: formatEnumLabel(veiculo.estado_veiculo) ?? "Não informado",
    caracteristicasPrincipais,
    caracteristicasExtrasTotal,
  };
};

export function useVeiculosUI(): UseVeiculosUIListResult;
export function useVeiculosUI(id: string): UseVeiculosUISingleResult;
export function useVeiculosUI(id?: string) {
  const {
    data,
    isLoading: isVeiculosLoading,
    error,
  } = useVeiculos(id);
  const {
    data: modelos = [],
    isLoading: isModelosLoading,
  } = useModelos();
  const {
    data: locais = [],
    isLoading: isLocaisLoading,
  } = useLocais();

  const isLoading = isVeiculosLoading || isModelosLoading || isLocaisLoading;

  if (!data) {
    return {
      data: id ? null : [],
      isLoading,
      error,
    } as const;
  }

  if (id) {
    const veiculoBase = Array.isArray(data) ? data[0] : data;
    const adaptado = veiculoBase ? adaptVeiculo(veiculoBase as VeiculoResumo, modelos, locais) : null;
    return {
      data: adaptado,
      isLoading,
      error,
    } as const;
  }

  const listaBase = Array.isArray(data) ? data : [data];
  const listaAdaptada = listaBase.map((item) => adaptVeiculo(item as VeiculoResumo, modelos, locais));

  return {
    data: listaAdaptada,
    isLoading,
    error,
  } as const;
}
