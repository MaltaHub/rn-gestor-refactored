import { Caracteristica, Local, Modelo, SupabaseVeiculo } from "../index";

export interface VeiculoResumo extends SupabaseVeiculo {
  modelo?: Pick<Modelo, "id" & "nome" & "marca" & "motor" & "edicao">;
  local?: Omit<Local, "empresa_id">;
  caracteristicas: Omit<Caracteristica, "empresa_id">[] | [];
}
