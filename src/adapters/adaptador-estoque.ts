import { useVeiculos } from "@/hooks/use-estoque";
import { useModelos, useLocais } from "@/hooks/use-configuracoes";
import type { VeiculoResumo } from "@/types/estoque";
import type { Modelo, Local } from "@/types";
import { buildModeloNomeCompleto, buildModeloNomeCompletoOrDefault } from "@/utils/modelos";

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

const buildModeloCompleto = (modelo: Modelo | null) =>
  buildModeloNomeCompletoOrDefault(modelo);

const buildModeloDisplay = (modelo: Modelo | null) => {
  const nomeCompleto = buildModeloNomeCompleto(modelo);
  return nomeCompleto ? nomeCompleto.toUpperCase() : "Modelo não informado";
};

const buildVeiculoDisplay = (veiculo: VeiculoResumo | null) => {
  if (!veiculo) return "Veiculo não informado";
  const modelo = veiculo.modelo ?? null;
  const modeloNomeCompleto = buildModeloNomeCompleto(modelo);
  const extraParts = [
    veiculo.cor,
    veiculo.ano_modelo,
    veiculo.ano_fabricacao,
    veiculo.hodometro != null ? `${veiculo.hodometro}km` : null,
  ];
  const parts = [modeloNomeCompleto, ...extraParts]
    .map((part) => (typeof part === "string" ? part.trim() : part))
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" ").toUpperCase() : "Modelo não informado";
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
  localLojaId: string | null;
  estaEmUnidade: boolean;
  localCategoria: "showroom" | "fora";
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
  const localLojaId = local?.loja_id ?? null;
  const estaEmUnidade = Boolean(localLojaId);
  const localCategoria: "showroom" | "fora" = estaEmUnidade ? "showroom" : "fora";
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
    localLojaId,
    estaEmUnidade,
    localCategoria,
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
