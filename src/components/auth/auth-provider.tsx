import { ReactNode } from "react";
import { cookies } from "next/headers";

import { AuthContextProvider } from "@/hooks/use-auth";
import type { LoginCredentials, LoginResult } from "./auth-types";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  buildSessionCookieOptions
} from "@/lib/auth/cookies";
import { authService } from "@/lib/services/domains";
import { setGlobalLoja } from "@/lib/services/core";
import { SupabaseAuthError, loginWithPassword } from "@/lib/supabase/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export async function AuthProvider({ children }: AuthProviderProps) {
  async function login(credentials: LoginCredentials): Promise<LoginResult> {
    "use server";

    const email = credentials.email.trim();
    const password = credentials.password;

    if (!email || !password) {
      return { ok: false, error: "Informe email e senha válidos." };
    }

    try {
      const resultado = await loginWithPassword(email, password);
      const expiresIn = typeof resultado.expires_in === "number" ? resultado.expires_in : ACCESS_TOKEN_MAX_AGE;
      const cookieStore = cookies();

      cookieStore.set(ACCESS_TOKEN_COOKIE, resultado.access_token, buildSessionCookieOptions(expiresIn));
      cookieStore.set(REFRESH_TOKEN_COOKIE, resultado.refresh_token, buildSessionCookieOptions(REFRESH_TOKEN_MAX_AGE));

      const vinculo = await authService.fetchEmpresaDoUsuario();
      if (vinculo) {
        const lojaDefault = vinculo.lojaPadraoId ?? vinculo.lojas[0]?.id ?? null;
        if (lojaDefault) {
          setGlobalLoja(lojaDefault);
        }
        return { ok: true, destino: "/app" };
      }

      return { ok: true, destino: "/lobby" };
    } catch (caught) {
      if (caught instanceof SupabaseAuthError) {
        return { ok: false, error: caught.message };
      }

      console.error("[auth] Falha inesperada ao autenticar", caught);
      return { ok: false, error: "Falha inesperada ao autenticar. Tente novamente." };
    }
  }

  async function logout(): Promise<void> {
    "use server";
    const cookieStore = cookies();
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
  }

  return <AuthContextProvider value={{ login, logout }}>{children}</AuthContextProvider>;
}
