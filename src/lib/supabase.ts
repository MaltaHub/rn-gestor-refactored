import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { RPCParameters, RPCResponse } from "@/types/cliente-rpc";

export const supabase: SupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function callRpc<TData = unknown, TPayload = Record<string, unknown>>(
  rpc: string,
  p_payload: RPCParameters<TPayload>,
): Promise<RPCResponse<TData>> {
  const { data, error } = await supabase.rpc(rpc, { p_payload });
  if (error) throw error;
  return data as RPCResponse<TData>;
}
