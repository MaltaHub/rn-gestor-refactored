export type Veiculo = {
  id: string;
  placa: string;
  modelo_id: string | null;
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
  registrado_por: string | null;
  registrado_em: string | null; // timestamp (pode ser Date)
  editado_por: string | null;
  editado_em: string | null; // timestamp (pode ser Date)
  repetido_id: string | null;
  observacao: string | null;
};
