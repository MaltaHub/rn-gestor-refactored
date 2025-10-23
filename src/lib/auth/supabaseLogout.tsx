import { supabase } from "@/lib/supabase-client";

function hasStatus(e: unknown): e is { status?: number } {
  return typeof e === "object" && e !== null && "status" in e;
}

export async function handleSupabaseSignOut() {
  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch (error: unknown) {
    if (hasStatus(error) && error.status === 401) {
      return; // sessão já inválida
    }
    throw error;
  }
}
