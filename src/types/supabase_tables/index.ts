export type Veiculo = {
  id: string; // system
  placa: string;
  modelo_id: string | null; // foreign key para modelos
  local: string;
  hodometro: number;
  estagio_documentacao: string | null;
  estado_venda: string; // public.estado_venda (enum no Postgres)
  estado_veiculo: string | null; // public.estado_veiculo (enum no Postgres)
  cor: string;
  preco_venda: number | null;
  chassi: string | null;
  ano_modelo: number | null;
  ano_fabricacao: number | null;
  registrado_por: string | null; // system
  registrado_em: Date | null; // timestamp (pode ser Date) system
  editado_por: string | null; // system
  editado_em: Date | null; // timestamp (pode ser Date) system
  repetido_id: string | null; // system
  observacao: string | null
};

// Omitir os campos de sistema
export type VeiculoUpload = Omit<
  Veiculo,
  "id" | "registrado_em" | "registrado_por" | "editado_em" | "editado_por"
>;

export type VeiculoRead = Veiculo & {
  modelo: { id: string; nome: string } | null;
  local: { id: string; nome: string } | null;
  caracteristicas: { id: string; nome: string }[];
};

/*
type Caracteristica = {
  id: string;
  nome: string;
};

export type VeiculoRead = Veiculo & {
  modelo?: { id: string; nome: string } | null;
  locais?: { id: string; nome: string } | null;
  caracteristicas_veiculos?: {
    caracteristicas: Caracteristica;
  }[];
};
*/