import { Caracteristica, Local, Modelo, SupabaseVeiculo } from "../index";

export interface VeiculoResumo extends SupabaseVeiculo {
  modelo?: Modelo | null;
  local?: Local | null;
  caracteristicas: Caracteristica[] | [];
}
