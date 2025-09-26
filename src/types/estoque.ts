import type { UUID } from "crypto";

export interface Veiculo {
  id: number;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  placa: string;
}

export interface VeiculoWithCaracteristicas extends Veiculo {
  caracteristicas: { id: UUID; nome: string }[];
}
