// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { RPCParameters, RPCResponse } from "@/types/cliente-rpc";
import { isLogoutInProgress, requestLogout } from "./logout-events";

const baseFetch = typeof fetch === "function" ? fetch.bind(globalThis) : undefined;

let hasTriggeredLogoutAfter401 = false;

const supabaseFetch: typeof fetch = async (input, init = {}) => {
  if (!baseFetch) {
    throw new Error("Fetch API não está disponível no ambiente atual");
  }

  // 🔹 Obtém a URL corretamente independente do tipo
  let url: string;
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    throw new Error("Tipo de input inválido no fetch interceptado");
  }

  const isEdgeFunction = url.includes("/functions/v1/");

  if (isEdgeFunction) {
    // 🔹 Edge Functions usam fetch nativo
    return baseFetch(input as RequestInfo, init as RequestInit);
  }

  const requestInit: RequestInit = {
    ...init,
    mode: (init as RequestInit).mode ?? "cors",
    credentials: (init as RequestInit).credentials ?? "omit",
  };

  const response = await baseFetch(input as RequestInfo, requestInit);

  if (response.status === 401 && typeof window !== "undefined") {
    if (!hasTriggeredLogoutAfter401 && !isLogoutInProgress()) {
      hasTriggeredLogoutAfter401 = true;
      requestLogout({ reason: "401", redirectTo: "/login" }).catch((error) => {
        console.error("❌ Falha ao disparar logout após 401:", error);
      });
    }
  }

  return response;
};

export const supabase: SupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: { fetch: supabaseFetch },
  },
);

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN") {
      hasTriggeredLogoutAfter401 = false;
    }
  });
}

export async function callRpc<TData = unknown, TPayload = Record<string, unknown>>(
  rpc: string,
  p_payload: RPCParameters<TPayload>,
): Promise<RPCResponse<TData>> {
  const { data, error } = await supabase.rpc(rpc, { p_payload });
  if (error) throw error;
  return data as RPCResponse<TData>;
}
