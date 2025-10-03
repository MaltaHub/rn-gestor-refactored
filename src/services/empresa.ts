import { supabase } from "@/lib/supabase";
import type { MembroEmpresa } from "@/types";

export async function fetchMembroEmpresaDoUsuario(): Promise<MembroEmpresa | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data, error } = await supabase
    .from("membros_empresa")
    .select("*")
    .eq("usuario_id", user.id)
    .maybeSingle(); // <- aqui garante 1 objeto só 
    // as { data: MembroEmpresa | null; error: Error | null };

  if (error) throw error;

  return data ?? null;
}
