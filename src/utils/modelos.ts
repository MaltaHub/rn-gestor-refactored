import type { Modelo } from "@/types";

const clean = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const formatEnum = (value: string | null | undefined): string | null => {
  const cleaned = clean(value);
  if (!cleaned) return null;
  return cleaned
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const buildModeloNomeCompleto = (modelo?: Partial<Modelo> | null): string => {
  if (!modelo) return "";

  const nome = clean(modelo.nome);
  const motor = clean(modelo.motor);
  const combustivel = formatEnum(modelo.combustivel);
  const edicao = clean(modelo.edicao);
  const tipoCambio = formatEnum(modelo.tipo_cambio);
  const carroceria = formatEnum(modelo.carroceria);

  const parts = [nome, motor, combustivel, edicao, tipoCambio, carroceria].filter(
    (part): part is string => Boolean(part),
  );

  return parts.join(" ").trim();
};

export const buildModeloNomeCompletoOrDefault = (
  modelo?: Partial<Modelo> | null,
  fallback = "Modelo não informado",
): string => {
  const nomeCompleto = buildModeloNomeCompleto(modelo);
  return nomeCompleto.length > 0 ? nomeCompleto : fallback;
};
