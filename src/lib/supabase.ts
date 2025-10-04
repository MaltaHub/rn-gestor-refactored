import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { RPCParameters, RPCResponse } from "@/types/cliente-rpc";
import { isLogoutInProgress, requestLogout } from "./logout-events";

const baseFetch = typeof fetch === "function" ? fetch.bind(globalThis) : undefined;

let hasTriggeredLogoutAfter401 = false;

const supabaseFetch: typeof fetch = async (input, init) => {
  if (!baseFetch) {
    throw new Error("Fetch API is not available in the current environment");
  }

  const response = await baseFetch(input as RequestInfo, init as RequestInit);

  if (response.status === 401 && typeof window !== "undefined") {
    if (!hasTriggeredLogoutAfter401 && !isLogoutInProgress()) {
      hasTriggeredLogoutAfter401 = true;

      requestLogout({ reason: "401", redirectTo: "/login" }).catch((error) => {
        console.error("Failed to trigger logout after 401 response", error);
      });
    }
  }

  return response;
};

export const supabase: SupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: supabaseFetch,
    },
  }
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
