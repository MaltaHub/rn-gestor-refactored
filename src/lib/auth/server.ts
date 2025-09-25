import "server-only";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { SupabaseAuthError, fetchSupabaseUser, type SupabaseAuthUser } from "@/lib/supabase/auth";

export interface AuthenticatedSession {
  user: SupabaseAuthUser;
  accessToken: string;
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const token = cookies().get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const user = await fetchSupabaseUser(token);
    return { user, accessToken: token };
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      console.warn(`[auth] Falha ao validar sessão: ${error.message}`);
      return null;
    }
    throw error;
  }
}
