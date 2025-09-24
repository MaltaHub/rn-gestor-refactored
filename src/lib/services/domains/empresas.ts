import { writeClient } from "../core";
import type { EmpresaVinculo } from "@/types/domain";

interface CriarEmpresaPayload {
  nome: string;
  documento?: string;
  emailContato?: string;
}

export async function criarEmpresa(payload: CriarEmpresaPayload): Promise<EmpresaVinculo> {
  return writeClient.execute("empresas.criar", payload);
}
