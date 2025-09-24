import { readClient } from "../core";
import type { AvisoPendencia } from "@/types/domain";

export async function listarAvisos(): Promise<AvisoPendencia[]> {
  return readClient.fetch("avisos.pendencias");
}
