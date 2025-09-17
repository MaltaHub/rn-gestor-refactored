export type Veiculo = {
  id: string
  placa: string
  empresa_id: string
  modelo_id: string | null
  local_id: string | null
  cor: string
  hodometro: number
  estado_venda: string
  estado_veiculo: string | null
  estagio_documentacao: string | null
  preco_venal: number | null
  chassi: string | null
  ano_modelo: number | null
  ano_fabricacao: number | null
  registrado_por: string
  registrado_em: string
  editado_por: string
  editado_em: string
  repetido_id: string | null
  observacao: string | null
}

export type VeiculoUpload = Omit<
  Veiculo,
  | "id"
  | "empresa_id"
  | "registrado_por"
  | "registrado_em"
  | "editado_por"
  | "editado_em"
>

export type VeiculoRead = Veiculo & {
  modelo?: { id: string; nome: string } | null
  local?: { id: string; nome: string } | null
  caracteristicas?: { id: string; nome: string }[]
}
