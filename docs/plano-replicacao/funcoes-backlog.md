# Funções e recursos backend necessários

| Fluxo | Recurso Supabase | Expectativa de comportamento | Situação |
| --- | --- | --- | --- |
| Bootstrap de autenticação | `empresa_do_usuario` (RPC existente) | Receber o `empresa_id` associado ao usuário logado para popular `useAuthStore` e o contexto de tenant. | Validar assinatura e garantir retorno nulo quando o usuário não pertence a nenhuma empresa. |
| Provisionamento de tenant | `create_tenant` (RPC) | Criar empresa, loja principal e vincular o usuário como proprietário (utilizado em `CreateTenant.tsx`). | Confirmar presença no banco e definir política de acesso por usuário autenticado. |
| Aceite de convite | `accept_tenant_invite` (RPC) | Ativar convite e associar usuário convidado ao tenant (`JoinTenant.tsx`). | Necessário implementar lógica de expiração e auditoria. |
| Cadastro de veículos | `cadastrar_veiculo` (RPC) | Inserir veículo completo, associando características opcionais e registrando o usuário responsável (`VehiclesService.create`). | Implementado em `supabase/sql/funcoes_negocio.sql`; complementar com validações de duplicidade e limites de hodômetro. |
| Atualização de veículos | `atualizar_veiculo` (RPC) | Atualizar campos selecionados de um veículo e registrar `editado_em` (`VehiclesService.update`). | Implementado no script SQL com merge parcial e auditoria básica (ajustar regras de permissão). |
| Gestão de estado (remoção/outros) | `gerenciar_veiculos` (RPC) | Processar remoções, arquivamentos ou outras operações administrativas (`VehiclesService.remove`). | Implementado como stub no script SQL; ampliar com enum de operações e motivo obrigatório. |
| Veículos ociosos | `obter_veiculos_ociosos` (RPC) | Retornar veículos sem anúncios ativos agrupados por características (`useVeiculosOciosos`). | Função disponível no script SQL retornando visão agregada por veículo/loja. |
| Sugestões de duplicados | `view_sugestoes_duplicados` (view) | Consolidar possíveis duplicados de anúncios/veículos para a aba de repetidos (`useDuplicadosSugestoes`). | View criada no script SQL; avaliar índices e materialização. |
| Governança de lojas | Tabelas `veiculos_lojas`, triggers opcionais | Suportar inserção, atualização e exclusão com integridade referencial (`useVeiculosLoja` e mutações). | Avaliar triggers para sincronizar preços e flag de fotos. |
| Estoque unificado | Views auxiliares (ex.: `view_estoque_geral`) | Simplificar queries de dashboard e página `EstoqueGeral` com joins em modelos e características. | Opcional, mas recomendável para manter consultas performáticas. |

> **Observação**: todos os RPCs devem ser protegidos por Row Level Security e políticas que garantam acesso apenas ao tenant do usuário autenticado. Consulte `supabase/sql/funcoes_negocio.sql` para os esboços das funções mencionadas.
