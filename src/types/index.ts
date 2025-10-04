import { Database } from "./supabase";

// Tipos relacionados a veiculos e anuncios
export type VeiculoLoja = Database["public"]["Tables"]["veiculos_loja"]["Row"];
export type FotoMetadata = Database["public"]["Tables"]["fotos_metadados"]["Row"];
export type TemFotos = Database["public"]["Tables"]["tem_fotos"]["Row"];
export type SupabaseVeiculo = Database["public"]["Tables"]["veiculos"]["Row"];
export type DocumentacaoVeiculo = Database["public"]["Tables"]["documentacao_veiculos"]["Row"];
export type Anuncio = Database["public"]["Tables"]["anuncios"]["Row"];

// Re-exportando tipos de configuracoes.ts
export type Caracteristica = Database["public"]["Tables"]["caracteristicas"]["Row"];
export type Modelo = Database["public"]["Tables"]["modelos"]["Row"];
export type Loja = Database["public"]["Tables"]["lojas"]["Row"];
export type Local = Database["public"]["Tables"]["locais"]["Row"];
export type UnidadeLoja = Database["public"]["Tables"]["unidades_loja"]["Row"];
export type Plataforma = Database["public"]["Tables"]["plataformas"]["Row"];
export type MembroEmpresa = Database["public"]["Tables"]["membros_empresa"]["Row"];
export type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

export enum EstadoVenda {
    "disponivel", "reservado", "vendido", "repassado", "restrito" 
};
export enum EstadoVeiculo {
    "novo", "seminovo", "usado", "sucata", "limpo", "sujo"
};
export enum StatusDocumentacao {
    "pendente", "em_andamento", "aguardando_cliente", "aguardando_terceiros", "concluida", "com_pendencias", "bloqueada"
};
