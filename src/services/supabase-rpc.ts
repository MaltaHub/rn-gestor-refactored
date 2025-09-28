import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseConfig } from "@/lib/supabase-config";
import { tryGetSupabaseBrowserClient } from "@/lib/supabase-browser";

export class SupabaseServiceError extends Error {
  public readonly code?: string;
  public readonly details?: string;
  public readonly hint?: string;
  public readonly context?: string;

  constructor(
    message: string,
    options: { code?: string; details?: string; hint?: string; context?: string } = {},
  ) {
    super(message);
    this.name = "SupabaseServiceError";
    this.code = options.code;
    this.details = options.details;
    this.hint = options.hint;
    this.context = options.context;
  }
}

export type RpcCallOptions = {
  p_payload?: Record<string, unknown>;
  parse?: (value: unknown) => unknown;
};

type RpcAttempt = "initial" | "after-refresh";

function normalizeError(
  functionName: string,
  error: PostgrestError,
  overrides: { message?: string } = {},
) {
  return new SupabaseServiceError(overrides.message ?? error.message, {
    code: error.code,
    details: error.details ?? undefined,
    hint: error.hint ?? undefined,
    context: `rpc:${functionName}`,
  });
}

function logRpcError(scope: string, attempt: RpcAttempt, error: PostgrestError) {
  console.error(`[Supabase][${scope}] Falha (${attempt}): ${error.message}`, {
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}

function isJwtExpiredError(error: PostgrestError) {
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST301" ||
    /jwt\s+expired/i.test(error.message ?? "") ||
    /jwt\s+expired/i.test(error.details ?? "")
  );
}

type MaybeAuthError = { message?: string } | null;

function extractAuthError(value: unknown): MaybeAuthError {
  if (value && typeof value === "object" && "message" in value) {
    return value as { message?: string };
  }
  return null;
}

async function refreshSessionOrFallback(
  client: SupabaseClient,
  scope: string,
): Promise<{ error: MaybeAuthError }> {
  const maybeRefresh = (client.auth as unknown as { refreshSession?: () => Promise<{ error: unknown }> })
    .refreshSession;

  if (typeof maybeRefresh === "function") {
    const { error } = await maybeRefresh.call(client.auth);
    return { error: extractAuthError(error) };
  }

  console.warn(
    `[Supabase][${scope}] Método refreshSession indisponível. Tentando getSession() como fallback.`,
  );

  const { error } = await client.auth.getSession();
  return { error: extractAuthError(error) };
}

async function forceSignOut(client: SupabaseClient, scope: string, cause: unknown) {
  console.error(`[Supabase][${scope}] Encerrando sessão por inconsistência de token.`, cause);

  const { error: signOutError } = await client.auth.signOut();
  if (signOutError) {
    console.error(`[Supabase][${scope}] Não foi possível encerrar a sessão expirada.`, {
      message: signOutError.message,
      details: (signOutError as { status?: number }).status ?? null,
    });
  }
}

async function executeRpc<T>(
  client: SupabaseClient,
  functionName: string,
  options: RpcCallOptions,
  attempt: RpcAttempt = "initial",
): Promise<T> {
  const { data, error } = await client.rpc(functionName, options.p_payload ?? {});

  if (!error) {
    const value = options.parse ? options.parse(data) : data;
    return value as T;
  }

  if (attempt === "initial" && isJwtExpiredError(error)) {
    console.warn(
      `[Supabase][RPC:${functionName}] JWT expirado detectado. Tentando atualizar sessão...`,
      {
        code: error.code,
        hint: error.hint,
      },
    );

    const scope = `RPC:${functionName}`;
    const { error: refreshError } = await refreshSessionOrFallback(client, scope);

    if (!refreshError) {
      return executeRpc<T>(client, functionName, options, "after-refresh");
    }

    await forceSignOut(client, scope, refreshError ?? error);

    throw new SupabaseServiceError("Sessão expirada. Faça login novamente.", {
      code: "auth.session_expired",
      details: refreshError?.message ?? error.details ?? undefined,
      hint: error.hint ?? undefined,
      context: `rpc:${functionName}`,
    });
  }

  if (attempt === "after-refresh" && isJwtExpiredError(error)) {
    const scope = `RPC:${functionName}`;
    await forceSignOut(client, scope, error);

    throw new SupabaseServiceError("Sessão expirada. Faça login novamente.", {
      code: "auth.session_expired",
      details: error.details ?? undefined,
      hint: error.hint ?? undefined,
      context: `rpc:${functionName}`,
    });
  }

  logRpcError(`RPC:${functionName}`, attempt, error);
  throw normalizeError(functionName, error);
}

export function getSupabaseClientOrThrow(): SupabaseClient {
  const client = tryGetSupabaseBrowserClient();
  if (!client || !hasSupabaseConfig) {
    throw new SupabaseServiceError(
      "Supabase não configurado. Verifique as variáveis de ambiente antes de executar RPCs.",
    );
  }
  return client;
}

export async function callRpc<T>(functionName: string, options: RpcCallOptions = {}) {
  const client = getSupabaseClientOrThrow();
  return executeRpc<T>(client, functionName, options);
}

export function isSupabaseEnabled() {
  return hasSupabaseConfig && Boolean(tryGetSupabaseBrowserClient());
}

export async function handlePostgrestError(
  client: SupabaseClient,
  context: string,
  error: PostgrestError,
): Promise<never> {
  const scope = `REST:${context}`;

  if (isJwtExpiredError(error)) {
    await forceSignOut(client, scope, error);

    throw new SupabaseServiceError("Sessão expirada. Faça login novamente.", {
      code: "auth.session_expired",
      details: error.details ?? undefined,
      hint: error.hint ?? undefined,
      context: scope.toLowerCase(),
    });
  }

  throw new SupabaseServiceError(error.message, {
    code: error.code,
    details: error.details ?? undefined,
    hint: error.hint ?? undefined,
    context: scope.toLowerCase(),
  });
}
