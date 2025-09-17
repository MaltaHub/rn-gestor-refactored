# RPC operacoes - setembro 2025

## Visao geral
- As assinaturas de RPC estao listadas em `src/types/supabase.ts` (enum `operacao_sistema` e funcao `executor`).
- O front consome RPCs diretas via `supabase.rpc` (`src/services` e `src/store`), sem passar pelo hub `executor`.
- O backend provisionado em `supabase/sql/funcoes_negocio.sql` implementa um subconjunto dessas operacoes.

## Mapeamento atual
### Front chama e backend possui
- `criar_empresa` (`src/services/empresa/index.ts:20` -> `supabase/sql/funcoes_negocio.sql:9`).
- `gerenciar_membros` com `criar_convite` e `aceitar_convite` (`src/services/empresa/index.ts:32,49` -> `supabase/sql/funcoes_negocio.sql:41`).
- `cadastrar_veiculo` (`src/services/veiculos/index.ts:60` -> `supabase/sql/funcoes_negocio.sql:122`).
- `atualizar_veiculo` (`src/services/veiculos/index.ts:73` -> `supabase/sql/funcoes_negocio.sql:188`).
- `gerenciar_veiculos` com `remover` (`src/services/veiculos/index.ts:86` -> `supabase/sql/funcoes_negocio.sql:222`).
- `empresa_do_usuario` (`src/store/authStore.ts:11` -> `supabase/sql/funcoes_negocio.sql:298`).

### Backend implementa mas o front nao usa
- `executor` (definido em `src/types/supabase.ts:1332`, ausente em `supabase/sql/funcoes_negocio.sql`).
- `aplicar_caracteristicas_lote` (preparada no backend para lote de caracteristicas).
- Conjunto de funcoes agregadoras: `gerenciar_anuncios`, `gerenciar_configuracoes`, `gerenciar_documentacao`, `gerenciar_empresa`, `gerenciar_fotos`, `gerenciar_promocoes`, `gerenciar_repetidos`, `gerenciar_vendas`, `transferir_veiculo_entre_lojas`, `verificar_permissao` (todas tipadas em `src/types/supabase.ts:1341-1438`).
- Operacoes internas de `gerenciar_membros`: `revogar_convite`, `remover_membro` (supabase/sql/funcoes_negocio.sql:105,110) que ainda nao aparecem no front nem no enum.

### Operacoes presentes apenas no enum
- Administracao de empresa: `atualizar_empresa`, `deletar_empresa`, `visualizar_empresa`.
- Pessoas: `visualizar_membros`, `gerenciar_proprietario`, `gerenciar_administrador`, `gerenciar_gerente`, `gerenciar_usuario`.
- Veiculos: `deletar_veiculo`, `visualizar_veiculo`, `transferir_veiculo`, `alterar_status_veiculo`.
- Midia: `upload_fotos`, `atualizar_fotos`, `deletar_fotos`, `visualizar_fotos`, `definir_foto_capa`, `gerenciar_fotos_loja`.
- Vendas e documentacao: `registrar_venda`, `atualizar_venda`, `cancelar_venda`, `finalizar_venda`, `visualizar_vendas`, `gerenciar_comissoes`, `atualizar_documentacao`, `visualizar_documentacao`, `gerenciar_transferencia`, `gerenciar_vistoria`, `upload_documentos`.
- Comercial/analytics: `criar_anuncio`, `atualizar_anuncio`, `deletar_anuncio`, `visualizar_anuncios`, `sincronizar_anuncio`, `criar_promocao`, `atualizar_promocao`, `deletar_promocao`, `visualizar_promocoes`, `configurar_buckets`, `gerenciar_lojas`, `gerenciar_plataformas`, `gerenciar_modelos`, `gerenciar_caracteristicas`, `gerenciar_locais`, `visualizar_dashboard`, `gerar_relatorios`, `exportar_dados`, `visualizar_metricas`.

## Pontos de atencao
- Padronizar o uso do hub `executor` para centralizar autorizacao e auditoria, desestimulando chamadas diretas de RPC no front.
- Revisar o enum `operacao_sistema` para incluir strings ja aceitas pelo backend (`criar_convite`, `aceitar_convite`, `revogar_convite`, `remover`) ou criar uma camada de traducao no hub.
- Priorizar a exposicao gradual das funcoes agregadoras (fotos, documentos, anuncios, vendas) para habilitar fluxos criticos antes de construir novas telas.
