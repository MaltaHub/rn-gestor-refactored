import { supabase } from "@/lib/supabase-client";
import type { MembroEmpresa } from "@/types";

export async function fetchMembroEmpresaDoUsuario(userId?: string | null): Promise<MembroEmpresa | null> {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("membros_empresa")
    .select("*")
    .eq("usuario_id", userId)
    .maybeSingle(); // <- aqui garante 1 objeto só 
    // as { data: MembroEmpresa | null; error: Error | null };

  if (error) throw error;

  return data ?? null;
}
