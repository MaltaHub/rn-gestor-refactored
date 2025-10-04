export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anuncios: {
        Row: {
          atualizado_em: string | null
          autor_id: string | null
          criado_em: string | null
          data_publicacao: string | null
          data_vencimento: string | null
          descricao: string | null
          descricao_original: string | null
          empresa_id: string
          entidade_id: string
          favoritos: number | null
          id: string
          identificador_fisico: string | null
          link_anuncio: string | null
          loja_id: string | null
          mensagens: number | null
          plataforma_id: string
          preco: number | null
          preco_original: number | null
          status: string | null
          tipo_anuncio: string
          tipo_identificador_fisico: string | null
          titulo: string
          titulo_original: string | null
          visualizacoes: number | null
        }
        Insert: {
          atualizado_em?: string | null
          autor_id?: string | null
          criado_em?: string | null
          data_publicacao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          descricao_original?: string | null
          empresa_id: string
          entidade_id: string
          favoritos?: number | null
          id?: string
          identificador_fisico?: string | null
          link_anuncio?: string | null
          loja_id?: string | null
          mensagens?: number | null
          plataforma_id: string
          preco?: number | null
          preco_original?: number | null
          status?: string | null
          tipo_anuncio: string
          tipo_identificador_fisico?: string | null
          titulo: string
          titulo_original?: string | null
          visualizacoes?: number | null
        }
        Update: {
          atualizado_em?: string | null
          autor_id?: string | null
          criado_em?: string | null
          data_publicacao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          descricao_original?: string | null
          empresa_id?: string
          entidade_id?: string
          favoritos?: number | null
          id?: string
          identificador_fisico?: string | null
          link_anuncio?: string | null
          loja_id?: string | null
          mensagens?: number | null
          plataforma_id?: string
          preco?: number | null
          preco_original?: number | null
          status?: string | null
          tipo_anuncio?: string
          tipo_identificador_fisico?: string | null
          titulo?: string
          titulo_original?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_plataforma_id_fkey"
            columns: ["plataforma_id"]
            isOneToOne: false
            referencedRelation: "plataformas"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas: {
        Row: {
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas_repetidos: {
        Row: {
          caracteristica_id: string
          empresa_id: string
          id: string
          repetido_id: string
        }
        Insert: {
          caracteristica_id: string
          empresa_id: string
          id?: string
          repetido_id: string
        }
        Update: {
          caracteristica_id?: string
          empresa_id?: string
          id?: string
          repetido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_repetidos_caracteristica_id_fkey"
            columns: ["caracteristica_id"]
            isOneToOne: false
            referencedRelation: "caracteristicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_repetidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_repetidos_repetido_id_fkey"
            columns: ["repetido_id"]
            isOneToOne: false
            referencedRelation: "repetidos"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas_veiculos: {
        Row: {
          caracteristica_id: string
          empresa_id: string
          id: string
          veiculo_id: string
        }
        Insert: {
          caracteristica_id: string
          empresa_id: string
          id?: string
          veiculo_id: string
        }
        Update: {
          caracteristica_id?: string
          empresa_id?: string
          id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_veiculos_caracteristica_id_fkey"
            columns: ["caracteristica_id"]
            isOneToOne: false
            referencedRelation: "caracteristicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_empresa: {
        Row: {
          consumido_em: string | null
          convidado_por_usuario_id: string
          criado_em: string | null
          empresa_id: string
          expira_em: string
          id: string
          status: string | null
          token: string
          usuario_convidado_id: string
        }
        Insert: {
          consumido_em?: string | null
          convidado_por_usuario_id: string
          criado_em?: string | null
          empresa_id: string
          expira_em: string
          id?: string
          status?: string | null
          token?: string
          usuario_convidado_id: string
        }
        Update: {
          consumido_em?: string | null
          convidado_por_usuario_id?: string
          criado_em?: string | null
          empresa_id?: string
          expira_em?: string
          id?: string
          status?: string | null
          token?: string
          usuario_convidado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentacao_veiculos: {
        Row: {
          aprovada_vistoria: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_transferencia: string | null
          data_vistoria: string | null
          empresa_id: string
          id: string
          loja_id: string | null
          observacoes_gerais: string | null
          observacoes_multas: string | null
          observacoes_restricoes: string | null
          responsavel_id: string | null
          status_geral: Database["public"]["Enums"]["status_documentacao"]
          tem_chave_reserva: boolean | null
          tem_crlv: boolean | null
          tem_crv: boolean | null
          tem_dividas_ativas: boolean | null
          tem_embargos: boolean | null
          tem_manual: boolean | null
          tem_multas: boolean | null
          tem_nf_compra: boolean | null
          tem_precatorios: boolean | null
          tem_restricoes: boolean | null
          transferencia_concluida: boolean | null
          transferencia_iniciada: boolean | null
          valor_dividas_ativas: number | null
          valor_multas: number | null
          veiculo_id: string
          vistoria_realizada: boolean | null
        }
        Insert: {
          aprovada_vistoria?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_transferencia?: string | null
          data_vistoria?: string | null
          empresa_id: string
          id?: string
          loja_id?: string | null
          observacoes_gerais?: string | null
          observacoes_multas?: string | null
          observacoes_restricoes?: string | null
          responsavel_id?: string | null
          status_geral?: Database["public"]["Enums"]["status_documentacao"]
          tem_chave_reserva?: boolean | null
          tem_crlv?: boolean | null
          tem_crv?: boolean | null
          tem_dividas_ativas?: boolean | null
          tem_embargos?: boolean | null
          tem_manual?: boolean | null
          tem_multas?: boolean | null
          tem_nf_compra?: boolean | null
          tem_precatorios?: boolean | null
          tem_restricoes?: boolean | null
          transferencia_concluida?: boolean | null
          transferencia_iniciada?: boolean | null
          valor_dividas_ativas?: number | null
          valor_multas?: number | null
          veiculo_id: string
          vistoria_realizada?: boolean | null
        }
        Update: {
          aprovada_vistoria?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_transferencia?: string | null
          data_vistoria?: string | null
          empresa_id?: string
          id?: string
          loja_id?: string | null
          observacoes_gerais?: string | null
          observacoes_multas?: string | null
          observacoes_restricoes?: string | null
          responsavel_id?: string | null
          status_geral?: Database["public"]["Enums"]["status_documentacao"]
          tem_chave_reserva?: boolean | null
          tem_crlv?: boolean | null
          tem_crv?: boolean | null
          tem_dividas_ativas?: boolean | null
          tem_embargos?: boolean | null
          tem_manual?: boolean | null
          tem_multas?: boolean | null
          tem_nf_compra?: boolean | null
          tem_precatorios?: boolean | null
          tem_restricoes?: boolean | null
          transferencia_concluida?: boolean | null
          transferencia_iniciada?: boolean | null
          valor_dividas_ativas?: number | null
          valor_multas?: number | null
          veiculo_id?: string
          vistoria_realizada?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documentacao_veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentacao_veiculos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentacao_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          dominio: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          dominio?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          dominio?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fotos_metadados: {
        Row: {
          atualizado_em: string
          criado_em: string
          e_capa: boolean
          empresa_id: string
          id: string
          loja_id: string
          ordem: number
          path: string
          veiculo_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          e_capa?: boolean
          empresa_id: string
          id?: string
          loja_id: string
          ordem: number
          path: string
          veiculo_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          e_capa?: boolean
          empresa_id?: string
          id?: string
          loja_id?: string
          ordem?: number
          path?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_veiculo_por_loja_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_veiculo_por_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_veiculo_por_loja_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          cep: string | null
          empresa_id: string
          id: string
          loja_id: string | null
          logradouro: string | null
          nome: string
        }
        Insert: {
          cep?: string | null
          empresa_id: string
          id?: string
          loja_id?: string | null
          logradouro?: string | null
          nome: string
        }
        Update: {
          cep?: string | null
          empresa_id?: string
          id?: string
          loja_id?: string | null
          logradouro?: string | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "locais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locais_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "lojas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_loja: {
        Row: {
          cep: string | null
          empresa_id: string
          id: string
          loja_id: string
          logradouro: string | null
          nome: string
        }
        Insert: {
          cep?: string | null
          empresa_id: string
          id?: string
          loja_id: string
          logradouro?: string | null
          nome: string
        }
        Update: {
          cep?: string | null
          empresa_id?: string
          id?: string
          loja_id?: string
          logradouro?: string | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_loja_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_empresa: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          empresa_id: string
          id: string
          papel: Database["public"]["Enums"]["papel_usuario_empresa"] | null
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario_empresa"] | null
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id?: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario_empresa"] | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos: {
        Row: {
          ano_final: number | null
          ano_inicial: number | null
          atualizado_em: string | null
          cabine: string | null
          cambio: string | null
          carroceria: Database["public"]["Enums"]["tipo_carroceria"] | null
          cilindros: number | null
          combustivel: Database["public"]["Enums"]["tipo_combustivel"] | null
          criado_em: string | null
          edicao: string | null
          empresa_id: string
          id: string
          lugares: number | null
          marca: string
          motor: string | null
          nome: string
          portas: number | null
          tipo_cambio: Database["public"]["Enums"]["tipo_cambio"] | null
          tracao: string | null
          valvulas: number | null
        }
        Insert: {
          ano_final?: number | null
          ano_inicial?: number | null
          atualizado_em?: string | null
          cabine?: string | null
          cambio?: string | null
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          cilindros?: number | null
          combustivel?: Database["public"]["Enums"]["tipo_combustivel"] | null
          criado_em?: string | null
          edicao?: string | null
          empresa_id: string
          id?: string
          lugares?: number | null
          marca: string
          motor?: string | null
          nome: string
          portas?: number | null
          tipo_cambio?: Database["public"]["Enums"]["tipo_cambio"] | null
          tracao?: string | null
          valvulas?: number | null
        }
        Update: {
          ano_final?: number | null
          ano_inicial?: number | null
          atualizado_em?: string | null
          cabine?: string | null
          cambio?: string | null
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"] | null
          cilindros?: number | null
          combustivel?: Database["public"]["Enums"]["tipo_combustivel"] | null
          criado_em?: string | null
          edicao?: string | null
          empresa_id?: string
          id?: string
          lugares?: number | null
          marca?: string
          motor?: string | null
          nome?: string
          portas?: number | null
          tipo_cambio?: Database["public"]["Enums"]["tipo_cambio"] | null
          tracao?: string | null
          valvulas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_papel: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          condicoes_extras: Json | null
          criado_em: string | null
          criado_por: string | null
          empresa_id: string
          id: string
          operacao: string
          papel: Database["public"]["Enums"]["papel_usuario_empresa"]
          permitido: boolean
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          condicoes_extras?: Json | null
          criado_em?: string | null
          criado_por?: string | null
          empresa_id: string
          id?: string
          operacao: string
          papel: Database["public"]["Enums"]["papel_usuario_empresa"]
          permitido?: boolean
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          condicoes_extras?: Json | null
          criado_em?: string | null
          criado_por?: string | null
          empresa_id?: string
          id?: string
          operacao?: string
          papel?: Database["public"]["Enums"]["papel_usuario_empresa"]
          permitido?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      plataformas: {
        Row: {
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "plataformas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      promocoes: {
        Row: {
          anuncio_id: string | null
          ativo: boolean | null
          atualizado_em: string | null
          autor_id: string
          criado_em: string | null
          data_fim: string | null
          data_inicio: string
          empresa_id: string
          id: string
          preco_promocional: number
          tipo_promocao: string
          veiculo_loja_id: string | null
        }
        Insert: {
          anuncio_id?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          autor_id: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio: string
          empresa_id: string
          id?: string
          preco_promocional: number
          tipo_promocao: string
          veiculo_loja_id?: string | null
        }
        Update: {
          anuncio_id?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          autor_id?: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          empresa_id?: string
          id?: string
          preco_promocional?: number
          tipo_promocao?: string
          veiculo_loja_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promocoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promocoes_veiculo_loja_id_fkey"
            columns: ["veiculo_loja_id"]
            isOneToOne: false
            referencedRelation: "veiculos_loja"
            referencedColumns: ["id"]
          },
        ]
      }
      repetidos: {
        Row: {
          alterado_em: string | null
          alterado_por: string | null
          ano_fabricacao_padrao: number
          ano_modelo_padrao: number
          cor_padrao: string
          empresa_id: string
          id: string
          max_hodometro: number
          min_hodometro: number
          modelo_id: string
          registrado_em: string | null
          registrado_por: string | null
        }
        Insert: {
          alterado_em?: string | null
          alterado_por?: string | null
          ano_fabricacao_padrao: number
          ano_modelo_padrao: number
          cor_padrao: string
          empresa_id: string
          id?: string
          max_hodometro: number
          min_hodometro: number
          modelo_id: string
          registrado_em?: string | null
          registrado_por?: string | null
        }
        Update: {
          alterado_em?: string | null
          alterado_por?: string | null
          ano_fabricacao_padrao?: number
          ano_modelo_padrao?: number
          cor_padrao?: string
          empresa_id?: string
          id?: string
          max_hodometro?: number
          min_hodometro?: number
          modelo_id?: string
          registrado_em?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repetidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repetidos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      tem_fotos: {
        Row: {
          empresa_id: string
          loja_id: string
          qtd_fotos: number
          ultima_atualizacao: string
          veiculo_id: string
        }
        Insert: {
          empresa_id: string
          loja_id: string
          qtd_fotos?: number
          ultima_atualizacao?: string
          veiculo_id: string
        }
        Update: {
          empresa_id?: string
          loja_id?: string
          qtd_fotos?: number
          ultima_atualizacao?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tem_fotos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tem_fotos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tem_fotos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          chassi: string | null
          cor: string
          editado_em: string
          editado_por: string
          empresa_id: string
          estado_veiculo: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao: string | null
          hodometro: number
          id: string
          local_id: string | null
          modelo_id: string | null
          observacao: string | null
          placa: string
          preco_venal: number | null
          registrado_em: string
          registrado_por: string
        }
        Insert: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          chassi?: string | null
          cor: string
          editado_em?: string
          editado_por?: string
          empresa_id: string
          estado_veiculo?: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao?: string | null
          hodometro: number
          id?: string
          local_id?: string | null
          modelo_id?: string | null
          observacao?: string | null
          placa: string
          preco_venal?: number | null
          registrado_em?: string
          registrado_por?: string
        }
        Update: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          chassi?: string | null
          cor?: string
          editado_em?: string
          editado_por?: string
          empresa_id?: string
          estado_veiculo?: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda?: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao?: string | null
          hodometro?: number
          id?: string
          local_id?: string | null
          modelo_id?: string | null
          observacao?: string | null
          placa?: string
          preco_venal?: number | null
          registrado_em?: string
          registrado_por?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_loja: {
        Row: {
          data_entrada: string
          empresa_id: string
          id: string
          loja_id: string
          preco: number | null
          veiculo_id: string
        }
        Insert: {
          data_entrada?: string
          empresa_id: string
          id?: string
          loja_id: string
          preco?: number | null
          veiculo_id: string
        }
        Update: {
          data_entrada?: string
          empresa_id?: string
          id?: string
          loja_id?: string
          preco?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_loja_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_loja_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_repetidos: {
        Row: {
          criado_em: string | null
          empresa_id: string
          id: string
          repetido_id: string
          similaridade_score: number | null
          veiculo_id: string
        }
        Insert: {
          criado_em?: string | null
          empresa_id: string
          id?: string
          repetido_id: string
          similaridade_score?: number | null
          veiculo_id: string
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string
          id?: string
          repetido_id?: string
          similaridade_score?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_repetidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_repetidos_repetido_id_fkey"
            columns: ["repetido_id"]
            isOneToOne: false
            referencedRelation: "repetidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_repetidos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_cpf_cnpj: string
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_nome: string
          cliente_telefone: string | null
          comissao_loja: number | null
          comissao_vendedor: number | null
          criado_em: string | null
          criado_por: string
          data_entrega: string | null
          data_previsao_entrega: string | null
          data_venda: string
          empresa_id: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          instituicao_financeira: string | null
          loja_id: string
          numero_parcelas: number | null
          observacoes: string | null
          preco_entrada: number | null
          preco_venda: number
          seguradora: string | null
          status_venda: Database["public"]["Enums"]["status_venda"]
          tem_seguro: boolean | null
          valor_financiado: number | null
          valor_parcela: number | null
          valor_seguro: number | null
          veiculo_id: string
          vendedor_id: string
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cpf_cnpj: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          comissao_loja?: number | null
          comissao_vendedor?: number | null
          criado_em?: string | null
          criado_por: string
          data_entrega?: string | null
          data_previsao_entrega?: string | null
          data_venda?: string
          empresa_id: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          instituicao_financeira?: string | null
          loja_id: string
          numero_parcelas?: number | null
          observacoes?: string | null
          preco_entrada?: number | null
          preco_venda: number
          seguradora?: string | null
          status_venda?: Database["public"]["Enums"]["status_venda"]
          tem_seguro?: boolean | null
          valor_financiado?: number | null
          valor_parcela?: number | null
          valor_seguro?: number | null
          veiculo_id: string
          vendedor_id: string
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_cpf_cnpj?: string
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          comissao_loja?: number | null
          comissao_vendedor?: number | null
          criado_em?: string | null
          criado_por?: string
          data_entrega?: string | null
          data_previsao_entrega?: string | null
          data_venda?: string
          empresa_id?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          instituicao_financeira?: string | null
          loja_id?: string
          numero_parcelas?: number | null
          observacoes?: string | null
          preco_entrada?: number | null
          preco_venda?: number
          seguradora?: string | null
          status_venda?: Database["public"]["Enums"]["status_venda"]
          tem_seguro?: boolean | null
          valor_financiado?: number | null
          valor_parcela?: number | null
          valor_seguro?: number | null
          veiculo_id?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convidar_membro: {
        Args: {
          p_convidado_por: string
          p_empresa_id: string
          p_papel: Database["public"]["Enums"]["papel_usuario_empresa"]
          p_usuario_convidado_id: string
        }
        Returns: Json
      }
      criar_empresa: {
        Args: { p_dominio?: string; p_nome: string }
        Returns: Json
      }
      empresa_do_usuario: {
        Args: Record<PropertyKey, never> | { p_empresa_id: string }
        Returns: boolean
      }
      executor: {
        Args: { p_operacao: string; p_payload: Json }
        Returns: Json
      }
      gerenciar_anuncios: {
        Args: {
          p_anuncio_id?: string
          p_dados: Json
          p_empresa_id: string
          p_operacao: string
        }
        Returns: Json
      }
      gerenciar_documentacao: {
        Args: {
          p_dados: Json
          p_empresa_id: string
          p_operacao: string
          p_veiculo_id?: string
        }
        Returns: Json
      }
      gerenciar_empresa: {
        Args: { p_dados: Json; p_empresa_id?: string; p_operacao: string }
        Returns: Json
      }
      gerenciar_membros: {
        Args: {
          p_dados_membro: Json
          p_empresa_id: string
          p_operacao: string
          p_usuario_alvo?: string
        }
        Returns: Json
      }
      gerenciar_promocoes: {
        Args: {
          p_dados: Json
          p_empresa_id: string
          p_operacao: string
          p_promocao_id?: string
        }
        Returns: Json
      }
      gerenciar_repetidos: {
        Args: {
          p_dados: Json
          p_empresa_id: string
          p_operacao: string
          p_repetido_id?: string
        }
        Returns: Json
      }
      rpc_atualizar_status_venda: {
        Args: {
          p_data_entrega: string
          p_observacoes: string
          p_status: Database["public"]["Enums"]["status_venda"]
          p_usuario_id: string
          p_venda_id: string
        }
        Returns: Json
      }
      rpc_configuracoes: {
        Args: { p_payload?: Json }
        Returns: Json
      }
      rpc_fotos: {
        Args: { p_payload?: Json }
        Returns: Json
      }
      rpc_gerenciar_fotos_veiculo_loja: {
        Args: {
          p_fotos: Json
          p_loja_id: string
          p_operacao: string
          p_usuario_id: string
          p_veiculo_id: string
        }
        Returns: Json
      }
      rpc_registrar_venda: {
        Args: { p_empresa_id: string; p_usuario_id: string; p_venda: Json }
        Returns: Json
      }
      rpc_veiculos: {
        Args: { p_payload?: Json }
        Returns: Json
      }
      rpc_vendas: {
        Args: { p_payload?: Json }
        Returns: Json
      }
    }
    Enums: {
      estado_veiculo:
        | "novo"
        | "seminovo"
        | "usado"
        | "sucata"
        | "limpo"
        | "sujo"
      estado_venda:
        | "disponivel"
        | "reservado"
        | "vendido"
        | "repassado"
        | "restrito"
      forma_pagamento:
        | "dinheiro"
        | "pix"
        | "transferencia"
        | "cartao_credito"
        | "cartao_debito"
        | "financiamento"
        | "consorcio"
        | "misto"
      papel_usuario_empresa:
        | "proprietario"
        | "administrador"
        | "gerente"
        | "consultor"
        | "usuario"
      status_documentacao:
        | "pendente"
        | "em_andamento"
        | "aguardando_cliente"
        | "aguardando_terceiros"
        | "concluida"
        | "com_pendencias"
        | "bloqueada"
      status_venda:
        | "negociacao"
        | "aprovada"
        | "finalizada"
        | "cancelada"
        | "devolvida"
      tipo_cambio: "manual" | "automatico" | "cvt" | "outro"
      tipo_carroceria:
        | "sedan"
        | "hatch"
        | "camioneta"
        | "suv"
        | "suv compacto"
        | "suv medio"
        | "van"
        | "buggy"
      tipo_combustivel:
        | "gasolina"
        | "alcool"
        | "flex"
        | "diesel"
        | "eletrico"
        | "hibrido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_veiculo: ["novo", "seminovo", "usado", "sucata", "limpo", "sujo"],
      estado_venda: [
        "disponivel",
        "reservado",
        "vendido",
        "repassado",
        "restrito",
      ],
      forma_pagamento: [
        "dinheiro",
        "pix",
        "transferencia",
        "cartao_credito",
        "cartao_debito",
        "financiamento",
        "consorcio",
        "misto",
      ],
      papel_usuario_empresa: [
        "proprietario",
        "administrador",
        "gerente",
        "consultor",
        "usuario",
      ],
      status_documentacao: [
        "pendente",
        "em_andamento",
        "aguardando_cliente",
        "aguardando_terceiros",
        "concluida",
        "com_pendencias",
        "bloqueada",
      ],
      status_venda: [
        "negociacao",
        "aprovada",
        "finalizada",
        "cancelada",
        "devolvida",
      ],
      tipo_cambio: ["manual", "automatico", "cvt", "outro"],
      tipo_carroceria: [
        "sedan",
        "hatch",
        "camioneta",
        "suv",
        "suv compacto",
        "suv medio",
        "van",
        "buggy",
      ],
      tipo_combustivel: [
        "gasolina",
        "alcool",
        "flex",
        "diesel",
        "eletrico",
        "hibrido",
      ],
    },
  },
} as const
