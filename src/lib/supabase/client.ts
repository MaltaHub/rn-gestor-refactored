const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "public";
const SUPABASE_EMPRESA_ID = process.env.NEXT_PUBLIC_SUPABASE_EMPRESA_ID ?? "123456";

const normalizedUrl = SUPABASE_URL?.replace(/\/$/, "");
const baseRestUrl = normalizedUrl ? `${normalizedUrl}/rest/v1` : undefined;
const baseAuthUrl = normalizedUrl ? `${normalizedUrl}/auth/v1` : undefined;

export const isSupabaseConfigured = Boolean(normalizedUrl && SUPABASE_ANON_KEY);

export function getSupabaseUrl(): string | undefined {
  return normalizedUrl;
}

export function getSupabaseAnonKey(): string | undefined {
  return SUPABASE_ANON_KEY || undefined;
}

export function getSupabaseRestUrl(): string | undefined {
  return baseRestUrl;
}

export function getSupabaseAuthUrl(): string | undefined {
  return baseAuthUrl;
}

export function getSupabaseEmpresaId(): string | undefined {
  return SUPABASE_EMPRESA_ID || undefined;
}

interface QueryOrder {
  column: string;
  ascending?: boolean;
}

interface SelectOptions {
  select?: string;
  match?: Record<string, string | number | boolean | null | undefined>;
  order?: QueryOrder | QueryOrder[];
  limit?: number;
}

function buildQueryString(options: SelectOptions = {}): string {
  const params = new URLSearchParams();

  if (options.select) {
    params.set("select", options.select);
  }

  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }

  const orders = Array.isArray(options.order)
    ? options.order
    : options.order
      ? [options.order]
      : [];

  for (const order of orders) {
    const direction = order.ascending === false ? ".desc" : "";
    params.append("order", `${order.column}${direction}`);
  }

  if (options.match) {
    for (const [key, value] of Object.entries(options.match)) {
      if (value === undefined || value === null) continue;
      params.set(key, `eq.${value}`);
    }
  }

  return params.toString();
}

function normalizePayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured || !baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente necessárias.");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_ANON_KEY);
  headers.set("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);

  const method = (init.method ?? "GET").toUpperCase();

  if (method === "GET") {
    if (!headers.has("Accept-Profile") && SUPABASE_SCHEMA) {
      headers.set("Accept-Profile", SUPABASE_SCHEMA);
    }
  } else {
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (!headers.has("Content-Profile") && SUPABASE_SCHEMA) {
      headers.set("Content-Profile", SUPABASE_SCHEMA);
    }
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(`${baseRestUrl}/${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro ao comunicar com o Supabase (${response.status}).`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export async function supabaseSelect<T>(table: string, options?: SelectOptions): Promise<T> {
  const query = buildQueryString(options);
  const path = query ? `${table}?${query}` : table;
  return supabaseRequest<T>(path);
}

export async function supabaseInsert<T>(table: string, payload: Record<string, unknown>): Promise<T> {
  return supabaseRequest<T>(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(normalizePayload(payload))
  });
}

export async function supabaseUpdate<T>(
  table: string,
  filters: Record<string, string | number>,
  payload: Record<string, unknown>
): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    params.set(key, `eq.${value}`);
  }
  const path = `${table}?${params.toString()}`;
  return supabaseRequest<T>(path, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(normalizePayload(payload))
  });
}

export async function supabaseDelete(table: string, filters: Record<string, string | number>): Promise<void> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    params.set(key, `eq.${value}`);
  }
  const path = `${table}?${params.toString()}`;
  await supabaseRequest(path, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export async function supabaseRpc<T>(
  functionName: string,
  params?: Record<string, unknown>
): Promise<T> {
  const payload = params ? normalizePayload(params) : {};
  return supabaseRequest<T>(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
