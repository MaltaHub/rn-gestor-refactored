import { supabase } from "@/lib/supabase";

export async function fetchEmpresaDoUsuario() {
  const { data, error } = await supabase.rpc("empresa_do_usuario");
  if (error) throw error;
  return data;
}
