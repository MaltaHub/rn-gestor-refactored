import { readClient, setGlobalLoja, writeClient } from "../core";
import type { EmpresaVinculo } from "@/types/domain";

export async function login(email: string, password: string) {
  return writeClient.execute("auth.login", { email, password });
}

export async function fetchEmpresaDoUsuario(): Promise<EmpresaVinculo | null> {
  return readClient.fetch("rpc.empresa_do_usuario");
}

export async function aceitarConvite(token: string) {
  return writeClient.execute("convites.aceitar", { token });
}

export async function validarConvite(token: string) {
  return readClient.fetch("convites.validarToken", { token });
}

export async function resolveDestinoInicial(): Promise<{ destino: "/app" | "/lobby"; vinculo: EmpresaVinculo | null }>
{
  const vinculo = await fetchEmpresaDoUsuario();
  if (vinculo) {
    const lojaDefault = vinculo.lojaPadraoId ?? vinculo.lojas[0]?.id ?? null;
    if (lojaDefault) {
      setGlobalLoja(lojaDefault);
    }
    return { destino: "/app", vinculo };
  }
  return { destino: "/lobby", vinculo: null };
}
