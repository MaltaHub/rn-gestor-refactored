import { Caracteristica, Local, Modelo, SupabaseVeiculo } from "../index";

export interface VeiculoResumo extends SupabaseVeiculo {
  modelo?: Modelo | null;
  local?: {id: string, nome: string} | null;
  caracteristicas: Caracteristica[] | [];
}
