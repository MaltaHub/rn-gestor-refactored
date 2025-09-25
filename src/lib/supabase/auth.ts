import { isSupabaseConfigured, getSupabaseAnonKey, getSupabaseAuthUrl } from "./client";

export class SupabaseAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SupabaseAuthError";
    this.status = status;
  }
}

export interface SupabaseAuthUser {
  id: string;
  email: string | null;
  [key: string]: unknown;
}

export interface SupabasePasswordLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseAuthUser;
}

export async function loginWithPassword(email: string, password: string): Promise<SupabasePasswordLoginResponse> {
  const authUrl = getSupabaseAuthUrl();
  const anonKey = getSupabaseAnonKey();

  if (!isSupabaseConfigured || !authUrl || !anonKey) {
    throw new SupabaseAuthError("Supabase não está configurado. Verifique as variáveis de ambiente.", 500);
  }

  const response = await fetch(`${authUrl}/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      apikey: anonKey
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error_description === "string"
        ? payload.error_description
        : typeof payload?.msg === "string"
        ? payload.msg
        : "Credenciais inválidas ou serviço indisponível.";
    throw new SupabaseAuthError(message, response.status);
  }

  return payload as SupabasePasswordLoginResponse;
}

export async function fetchSupabaseUser(accessToken: string): Promise<SupabaseAuthUser> {
  const authUrl = getSupabaseAuthUrl();
  const anonKey = getSupabaseAnonKey();

  if (!isSupabaseConfigured || !authUrl || !anonKey) {
    throw new SupabaseAuthError("Supabase não está configurado. Verifique as variáveis de ambiente.", 500);
  }

  const response = await fetch(`${authUrl}/user`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error_description === "string"
        ? payload.error_description
        : "Sessão inválida ou expirada.";
    throw new SupabaseAuthError(message, response.status);
  }

  return payload as SupabaseAuthUser;
}
