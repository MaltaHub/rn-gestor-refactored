import { Modelo } from "..";

/* =========================
 * Tipos e fábricas de estado
 * ========================= */

export interface SimpleFormState {
  id?: string;
  nome: string;
}
export interface ModeloFormState
  extends Omit<Modelo, "atualizado_em" | "id" | "empresa_id"> {
  id?: string | null;
}
