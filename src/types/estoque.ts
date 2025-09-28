import type { UUID } from "crypto";

import type {
  Anuncio,
  Caracteristica,
  DocumentacaoVeiculo,
  FotoMetadata,
  Local,
  Loja,
  Modelo,
  TemFotos,
  Veiculo as SupabaseVeiculo,
  VeiculoLoja,
} from "./supabase";
import type {
  EstadoVeiculo,
  EstadoVenda,
  StatusDocumentacao,
} from "./supabase_enums";

export type IdentificadorUUID = UUID | string;

export type VeiculoCaracteristica = Pick<Caracteristica, "id" | "nome">;

export type VeiculoModelo = Pick<
  Modelo,
  | "id"
  | "marca"
  | "nome"
  | "combustivel"
  | "tipo_cambio"
  | "motor"
  | "lugares"
  | "portas"
  | "cabine"
  | "tracao"
  | "carroceria"
>;

type VeiculoLojaBase = Pick<VeiculoLoja, "id" | "preco" | "data_entrada" | "loja_id">;

export interface VeiculoLojaResumo
  extends Omit<VeiculoLojaBase, "preco" | "data_entrada"> {
  preco?: VeiculoLoja["preco"];
  data_entrada?: string | null;
  loja?: Pick<Loja, "id" | "nome"> | null;
}

export type VeiculoLocalResumo = Pick<Local, "id" | "nome">;

export interface VeiculoMidia {
  fotos?: FotoMetadata[];
  controle?: TemFotos | null;
}

export interface Veiculo
  extends Omit<
    SupabaseVeiculo,
    "id" | "estado_venda" | "estado_veiculo" | "estagio_documentacao"
  > {
  id: string;
  estado_venda: EstadoVenda;
  estado_veiculo?: EstadoVeiculo | null;
  estagio_documentacao?: StatusDocumentacao | null;
  modelo?: VeiculoModelo | null;
  loja?: VeiculoLojaResumo | null;
  local?: VeiculoLocalResumo | null;
  documentacao?: DocumentacaoVeiculo | null;
  caracteristicas?: VeiculoCaracteristica[];
  midia?: VeiculoMidia;
  anuncios?: Anuncio[];
}

export interface VeiculoWithCaracteristicas extends Veiculo {
  caracteristicas: VeiculoCaracteristica[];
}
