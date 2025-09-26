export type EstadoVeiculo =
  | "novo"
  | "seminovo"
  | "usado"
  | "sucata"
  | "limpo"
  | "sujo";

export type EstadoVenda =
  | "disponivel"
  | "reservado"
  | "vendido"
  | "repassado"
  | "restrito";

export type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "transferencia"
  | "cartao_credito"
  | "cartao_debito"
  | "financiamento"
  | "consorcio"
  | "misto";

export type PapelUsuarioEmpresa =
  | "proprietario"
  | "administrador"
  | "gerente"
  | "consultor"
  | "usuario";

export type StatusDocumentacao =
  | "pendente"
  | "em_andamento"
  | "aguardando_cliente"
  | "aguardando_terceiros"
  | "concluida"
  | "com_pendencias"
  | "bloqueada";

export type StatusVenda =
  | "negociacao"
  | "aprovada"
  | "finalizada"
  | "cancelada"
  | "devolvida";

export type TipoCambio =
  | "manual"
  | "automatico"
  | "cvt"
  | "outro";

export type TipoCarroceria =
  | "sedan"
  | "hatch"
  | "camioneta"
  | "suv"
  | "suv compacto"
  | "suv medio"
  | "van"
  | "buggy";

export type TipoCombustivel =
  | "gasolina"
  | "alcool"
  | "flex"
  | "diesel"
  | "eletrico"
  | "hibrido";
