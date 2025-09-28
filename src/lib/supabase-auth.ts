'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { hasSupabaseConfig } from "./supabase-config";
import {
  getSupabaseBrowserClient,
  tryGetSupabaseBrowserClient,
} from "./supabase-browser";

export type SupabaseUser = User;
export type SupabaseSession = Session;

type SignInResponse =
  | { session: SupabaseSession | null; error: null }
  | { session: null; error: string };

export async function signInWithPassword(email: string, password: string): Promise<SignInResponse> {
  if (!hasSupabaseConfig) {
    return {
      session: null,
      error: "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data.session ?? null, error: null };
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig) {
    return;
  }

  const client = getSupabaseBrowserClient();
  await client.auth.signOut();
}

export async function fetchAuthenticatedUser(): Promise<SupabaseUser | null> {
  if (!hasSupabaseConfig) {
    return null;
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    console.warn("Não foi possível obter o usuário autenticado", error);
    return null;
  }

  return data.user ?? null;
}

export function useSupabaseSession() {
  const client = useMemo(() => tryGetSupabaseBrowserClient(), []);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setLoading] = useState<boolean>(Boolean(client));
  const [hasLoadedSession, setHasLoadedSession] = useState<boolean>(false);

  const applySession = useCallback((nextSession: SupabaseSession | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setHasLoadedSession(true);
  }, []);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      setHasLoadedSession(true);
      return;
    }

    let isMounted = true;

    const loadInitialSession = async () => {
      setLoading(true);
      const { data, error } = await client.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.warn("Não foi possível recuperar a sessão do Supabase", error);
        applySession(null);
        setLoading(false);
        return;
      }

      applySession(data.session ?? null);
      setLoading(false);
    };

    loadInitialSession();

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      applySession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [applySession, client]);

  const refreshSession = useCallback(async () => {
    if (!client) {
      applySession(null);
      return;
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn("Falha ao atualizar sessão", error);
      applySession(null);
      return;
    }

    applySession(data.session ?? null);
  }, [applySession, client]);

  const clearSession = useCallback(async () => {
    if (client) {
      await client.auth.signOut();
    }
    applySession(null);
  }, [applySession, client]);

  const manualSetSession = useCallback(
    async (next: SupabaseSession | null) => {
      if (!client) {
        applySession(next);
        return;
      }

      if (!next) {
        await client.auth.signOut();
        applySession(null);
        return;
      }

      await client.auth.setSession({
        access_token: next.access_token,
        refresh_token: next.refresh_token,
      });
      applySession(next);
    },
    [applySession, client],
  );

  return {
    session,
    user,
    isLoading,
    isConfigured: hasSupabaseConfig,
    refreshSession,
    hasLoadedSession,
    clearSession,
    setSession: manualSetSession,
  };
}
