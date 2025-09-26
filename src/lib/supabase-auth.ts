'use client';

import { useCallback, useEffect, useState } from "react";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  hasSupabaseConfig,
} from "./supabase-config";

const SESSION_STORAGE_KEY = "gestor.supabase.session";

export type SupabaseUser = {
  id: string;
  email: string | null;
  phone?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SupabaseSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
  user: SupabaseUser;
};

type SignInResponse =
  | { session: SupabaseSession; error: null }
  | { session: null; error: string };

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storage = window.localStorage;
    storage.getItem("__test__");
    return storage;
  } catch (error) {
    console.warn("Local storage indisponível", error);
    return null;
  }
}

export function readStoredSession(): SupabaseSession | null {
  const storage = getStorage();
  if (!storage) return null;

  const json = storage.getItem(SESSION_STORAGE_KEY);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as SupabaseSession;
    if (!parsed.accessToken || !parsed.refreshToken) {
      storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function persistSession(session: SupabaseSession | null) {
  const storage = getStorage();
  if (!storage) return;

  if (!session) {
    storage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

async function requestSupabase<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  if (!hasSupabaseConfig) {
    return { data: null, error: "Supabase não configurado." };
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    const message = errorBody.message || errorBody.error || response.statusText;
    return { data: null, error: message };
  }

  const data = (await response.json().catch(() => null)) as T | null;
  return { data, error: null };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResponse> {
  if (!hasSupabaseConfig) {
    return { session: null, error: "Supabase não configurado." };
  }

  const { data, error } = await requestSupabase<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user: SupabaseUser;
  }>(`/auth/v1/token?grant_type=password`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (error || !data) {
    return { session: null, error: error ?? "Falha ao autenticar." };
  }

  const session: SupabaseSession = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    expiresAt: Date.now() + data.expires_in * 1000,
    user: data.user,
  };

  persistSession(session);
  return { session, error: null };
}

export async function signOut(): Promise<void> {
  const session = readStoredSession();
  if (!session) {
    persistSession(null);
    return;
  }

  await requestSupabase(`/auth/v1/logout`, {
    method: "POST",
    headers: {
      Authorization: `${session.tokenType} ${session.accessToken}`,
    },
  });

  persistSession(null);
}

export async function fetchAuthenticatedUser(): Promise<SupabaseUser | null> {
  const session = readStoredSession();
  if (!session) return null;

  const { data, error } = await requestSupabase<SupabaseUser>(`/auth/v1/user`, {
    headers: {
      Authorization: `${session.tokenType} ${session.accessToken}`,
    },
  });

  if (error || !data) {
    return null;
  }

  const updatedSession: SupabaseSession = {
    ...session,
    user: data,
  };
  persistSession(updatedSession);
  return data;
}

export function useSupabaseSession() {
  const [session, setSession] = useState<SupabaseSession | null>(() =>
    readStoredSession(),
  );
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(session?.user ?? null);

  const refreshSession = useCallback(() => {
    const nextSession = readStoredSession();
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let isMounted = true;
    const attemptFetchUser = async () => {
      setLoading(true);
      const fetchedUser = await fetchAuthenticatedUser();
      if (!isMounted) return;
      setUser(fetchedUser);
      setSession(readStoredSession());
      setLoading(false);
    };

    if (session && !user) {
      attemptFetchUser();
    }

    return () => {
      isMounted = false;
    };
  }, [session, user]);

  useEffect(() => {
    const handler = () => {
      refreshSession();
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refreshSession]);

  return {
    session,
    user,
    isLoading,
    isConfigured: hasSupabaseConfig,
    refreshSession,
    clearSession: () => {
      persistSession(null);
      refreshSession();
    },
    setSession: (next: SupabaseSession | null) => {
      persistSession(next);
      refreshSession();
    },
  };
}
