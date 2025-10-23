import { supabase } from "@/lib/supabase-client";
import type {
  ApiPlacasExtra,
  ApiPlacasFipe,
  ApiPlacasFipeOption,
  ConsultaPlacaResult,
  EdgeConsultaPlacaError,
  EdgeConsultaPlacaResponse,
  EdgeConsultaPlacaSuccess,
} from "@/types/api-placas";

const EDGE_FUNCTION_PATH = "/functions/v1/api-placas";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const FIPE_ARRAY_KEYS = ["dados", "opcoes", "itens", "resultado", "melhores"];

export class ConsultaPlacaError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ConsultaPlacaError";
    this.status = status;
    this.details = details;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizePlaca = (placa: string) => placa.replace(/[^A-Z0-9]/gi, "").toUpperCase();

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const pickString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
};

const pickYear = (...values: unknown[]): string | number | null => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
};

const pickBoolean = (...values: unknown[]): boolean | null => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      if (normalized === "1") return true;
      if (normalized === "0") return false;
    }
  }
  return null;
};

const coerceExtra = (value: unknown): ApiPlacasExtra | null =>
  isRecord(value) ? (value as ApiPlacasExtra) : null;

const coerceFipe = (value: unknown): ApiPlacasFipe => {
  if (value == null) return null;
  if (Array.isArray(value)) return value as ApiPlacasFipeOption[];
  if (isRecord(value)) return value as ApiPlacasFipe;
  return null;
};

const normalizeFipeOptions = (raw: ApiPlacasFipe): ApiPlacasFipeOption[] => {
  if (!raw) return [];

  const options: ApiPlacasFipeOption[] = [];

  const maybePush = (item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    const option = item as ApiPlacasFipeOption;
    const hasData =
      option.codigo_fipe ||
      option.codigo ||
      option.texto_modelo ||
      option.modelo ||
      option.texto_valor;
    if (hasData) {
      options.push(option);
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => maybePush(item));
  } else if (isRecord(raw)) {
    FIPE_ARRAY_KEYS.forEach((key) => {
      const value = (raw as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        value.forEach((entry) => maybePush(entry));
      }
    });
    maybePush(raw);
  }

  return options;
};

const pickBestFipe = (items: ApiPlacasFipeOption[]): ApiPlacasFipeOption | null => {
  if (!items.length) return null;

  return items.reduce<ApiPlacasFipeOption | null>((best, current) => {
    if (!best) return current;

    const currentScore = toNumber(current.score);
    const bestScore = toNumber(best.score);

    if (currentScore > bestScore) return current;
    if (currentScore === bestScore) {
      const currentHasValor = Boolean(current.texto_valor ?? current.preco);
      const bestHasValor = Boolean(best.texto_valor ?? best.preco);
      if (currentHasValor && !bestHasValor) return current;
    }

    return best;
  }, null);
};

const isEdgeError = (value: unknown): value is EdgeConsultaPlacaError =>
  isRecord(value) && typeof value.error === "string";

const isEdgeSuccess = (value: unknown): value is EdgeConsultaPlacaSuccess =>
  isRecord(value) && typeof value.placa === "string" && isRecord(value.raw);

export async function consultarPlaca(
  placa: string,
): Promise<ConsultaPlacaResult | null> {
  if (!SUPABASE_URL) {
    throw new ConsultaPlacaError("NEXT_PUBLIC_SUPABASE_URL não configurada.", 500);
  }

  const placaSanitizada = sanitizePlaca(placa);
  if (!placaSanitizada) {
    throw new ConsultaPlacaError("Informe uma placa válida para consulta.", 400);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new ConsultaPlacaError(sessionError.message, 401, sessionError);
  }

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new ConsultaPlacaError("Sessão inválida ou expirada. Faça login novamente.", 401);
  }

  const url = new URL(EDGE_FUNCTION_PATH, SUPABASE_URL);
  url.searchParams.set("placa", placaSanitizada);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (response.status === 404) {
    return null;
  }

  const rawBody = await response.text();
  const parseBody = (): EdgeConsultaPlacaResponse | null => {
    if (!rawBody) return null;
    try {
      return JSON.parse(rawBody) as EdgeConsultaPlacaResponse;
    } catch (error) {
      throw new ConsultaPlacaError("Resposta inválida da função Edge.", response.status, {
        cause: error,
        body: rawBody,
      });
    }
  };

  if (!response.ok) {
    const payload = parseBody();
    if (payload && isEdgeError(payload)) {
      throw new ConsultaPlacaError(payload.error, response.status, payload.detail ?? null);
    }
    const message = `Falha ao consultar placa (${response.status})`;
    throw new ConsultaPlacaError(message, response.status, payload ?? rawBody);
  }

  const parsed = parseBody();
  if (!parsed) {
    throw new ConsultaPlacaError("Resposta vazia da função Edge.", response.status);
  }

  if (isEdgeError(parsed)) {
    throw new ConsultaPlacaError(parsed.error, response.status, parsed.detail ?? null);
  }

  if (!isEdgeSuccess(parsed)) {
    throw new ConsultaPlacaError(
      "Formato inesperado da resposta da função Edge.",
      response.status,
      parsed,
    );
  }

  const raw = isRecord(parsed.raw) ? parsed.raw : {};
  const extra = coerceExtra(parsed.extra);
  const fipeSource = coerceFipe(parsed.fipe);
  const fipeOptions = normalizeFipeOptions(fipeSource);
  const bestFipe = pickBestFipe(fipeOptions);

  const placaNormalizada = sanitizePlaca(pickString(parsed.placa, raw["placa"]) ?? placaSanitizada);
  const uf = pickString(parsed.uf, raw["uf"], raw["UF"]);
  const marca = pickString(parsed.marca, raw["marca"], raw["MARCA"]);
  const modelo = pickString(parsed.modelo, raw["modelo"], raw["MODELO"]);
  const cor = pickString(parsed.cor, raw["cor"], raw["COR"]);
  const situacao = pickString(parsed.situacao, raw["situacao"], raw["codigoSituacao"]);
  const ano = pickYear(parsed.ano, raw["ano"], raw["ANO"]);
  const anoModelo = pickYear(extra?.ano_modelo, raw["anoModelo"], raw["ano_modelo"]);
  const municipio = pickString(extra?.municipio, raw["municipio"]);
  const mensagem = pickString(raw["mensagemRetorno"], raw["mensagem"]);
  const sucesso = pickBoolean(raw["sucesso"], raw["SUCESSO"]);

  const result: ConsultaPlacaResult = {
    placa: placaNormalizada,
    uf: uf ?? null,
    marca: marca ?? null,
    modelo: modelo ?? null,
    ano: ano ?? null,
    cor: cor ?? null,
    situacao: situacao ?? null,
    extra,
    fipe: fipeSource,
    raw,
    ano_modelo: anoModelo ?? null,
    municipio: municipio ?? null,
    mensagem: mensagem ?? null,
    sucesso: sucesso ?? null,
    fipeOpcoes: fipeOptions.length ? fipeOptions : null,
    bestFipe: bestFipe ?? null,
  };

  return result;
}
