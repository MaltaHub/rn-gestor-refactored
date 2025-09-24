import { readClient, getGlobalLoja, setGlobalLoja, subscribeToGlobalLoja, scopeFromLoja } from "../core";
import type { ConcessionariaContexto, PermissaoModulo } from "@/types/domain";
import type { RequestScope } from "../types";

export async function fetchConcessionariaContext(scope?: RequestScope): Promise<ConcessionariaContexto> {
  return readClient.fetch("contexto.concessionaria", undefined, scope);
}

export async function fetchPermissoesDeModulo(): Promise<PermissaoModulo[]> {
  return readClient.fetch("permissoes.modulos");
}

export { getGlobalLoja, setGlobalLoja, subscribeToGlobalLoja, scopeFromLoja };
