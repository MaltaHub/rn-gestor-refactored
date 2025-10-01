import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { RPCInvoker, RPCParameters, RPCResponse } from "@/types/cliente-rpc";

export const supabase: SupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function callRpc (rpc: string, p_payload: RPCParameters): Promise<RPCResponse> {
  const { data, error } = await supabase.rpc(rpc, { p_payload: p_payload });
  console.log("RPC Call:", { p_payload, data, error });
  if (error) throw error;
  return data as RPCResponse;
}
