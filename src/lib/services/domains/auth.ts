import { readClient, writeClient } from "../core";
import { isSupabaseConfigured, supabaseRpc } from "../../supabase/client";
import type { EmpresaVinculo } from "@/types/domain";

readClient.register("rpc.empresa_do_usuario", async () => {
  if (!isSupabaseConfigured) {
    // deixa cair no mock caso exista
    return null;
  }

  try {
    const result = await supabaseRpc<EmpresaVinculo | EmpresaVinculo[] | null>("empresa_do_usuario");
    if (Array.isArray(result)) {
      return result[0] ?? null;
    }
    console.warn("[rpc.empresa_do_usuario] Esperado um único resultado, mas a resposta foi um array.");
    return result ?? null;
  } catch (error) {
    console.error("[rpc.empresa_do_usuario] Falha ao invocar Supabase", error);
    return null;
  }
});

export async function fetchEmpresaDoUsuario(): Promise<EmpresaVinculo | null> {
  return readClient.fetch("rpc.empresa_do_usuario");
}

export async function aceitarConvite(token: string) {
  return writeClient.execute("convites.aceitar", { token });
}

export async function validarConvite(token: string) {
  return readClient.fetch("convites.validarToken", { token });
}
