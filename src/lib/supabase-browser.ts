import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from "./supabase-config";

let supabaseBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("O cliente Supabase para browser só pode ser inicializado no cliente.");
  }

  if (!hasSupabaseConfig) {
    throw new Error(
      "Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => [],
      },
    });
  }

  return supabaseBrowserClient;
}

export function tryGetSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!hasSupabaseConfig) {
    return null;
  }

  try {
    return getSupabaseBrowserClient();
  } catch (error) {
    console.warn("Falha ao inicializar o cliente Supabase", error);
    return null;
  }
}
