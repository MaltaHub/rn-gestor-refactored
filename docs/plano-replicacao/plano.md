# Plano de replicação da lógica de negócio do `rn-gestor-auto`

## 1. Visão geral da referência
- O projeto original organiza o domínio em camadas de `entities`, `hooks` e `pages`, centralizando a lógica de negócios em modelos como `entities/veiculo/model.ts` e nos serviços de API (`entities/veiculo/api.ts`).
- Os fluxos críticos percorrem hooks especializados (`useVeiculos`, `useVeiculosLoja`, `useEstoqueGeral`, `useAnuncios`, `useVeiculosOciosos`) que consultam tabelas e RPCs Supabase, sempre contextualizados pelo tenant corrente (`contexts/TenantContext.tsx`).
- A UI reutiliza um kit de componentes com utilidades (`components/ui/*`, `lib/utils.ts`) e persistência de preferências no store `stores/uiStore.ts`.

## 1.1. Mapa de rotas replicadas na web
- `/` – landing institucional (`LandingPage`) com redirecionamento automático para `/app` quando autenticado.
- `/login` – autenticação corporativa equivalente à tela `Auth` do projeto de origem.
- `/convites/:token` – aceite de convites multi-tenant (`JoinCompany`).
- `/setup/empresa` – criação de tenant e aceite de convites listados (`SetupCompany`).
- `/app` – layout autenticado (`AppLayout`) com as subseções:
  - `index` → `Dashboard`.
  - `/app/estoque` → `Inventory` com abertura rápida de cadastro.
  - `/app/estoque/cadastrar` → `RegisterVehicle`.
  - `/app/veiculos/:vehicleId` → `VehicleDetails`.
  - `/app/veiculos/:vehicleId/editar` → `EditVehicle`.
  - `/app/anuncios`, `/app/vendas`, `/app/promocoes`, `/app/membros`, `/app/lojas` → fluxos setoriais já existentes.

## 2. Diagnóstico da base atual (`rn-gestor-refactored`)
- A aplicação já possui bootstrap de sessão (`src/components/SessionBootstrap.tsx`) e guarda a empresa na store de autenticação (`src/store/authStore.ts`).
- Os fluxos de veículos ainda utilizam serviços parciais (`src/services/veiculos/index.ts`) e hooks consolidados (`src/hooks/useVehicles.ts`), mas faltam camadas para lojas, anúncios e estatísticas por tenant.
- A navegação está pronta para dashboards setoriais (`src/App.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Inventory.tsx`, `src/pages/Anuncios.tsx`, etc.), restando conectar cada tela às queries equivalentes do projeto de referência.

## 3. Fase 1 – Fundamentos de contexto e autenticação
1. **Normalizar o cliente Supabase**: garantir que `src/lib/supabaseClient.ts` espelhe as opções avançadas do projeto original (persistência, headers e helpers). Avaliar extração de helpers recorrentes (`supabaseHelpers`).
2. **Contexto de tenant e lojas**:
   - Converter `src/hooks/useCurrentStore.ts` em um provider `TenantProvider` que carregue tenant, lojas e mantenha seleção persistida (similar a `contexts/TenantContext.tsx`).
   - Propagar o provider pelo `AppLayout` para que todos os hooks tenham acesso imediato ao tenant e à loja.
3. **UI Store**: replicar preferências globais de filtros (`stores/uiStore.ts`) criando uma store Zustand equivalente e integrar com os filtros das páginas.

## 4. Fase 2 – Estoque global do tenant
1. **Hooks de estoque**:
   - Implementar `useEstoqueGeral` e `useEstoqueGeralStats` usando o tenant do contexto e consultas ao Supabase (`veiculos`, `modelos`, `caracteristicas`).
   - Disponibilizar modelos de domínio (`VeiculoModel`) para encapsular regras como formatação de estado, preço e idade (ver `entities/veiculo/model.ts`).
2. **Página `Inventory`**:
   - Refatorar para consumir os novos hooks, separar filtros persistentes (armazenados em store) e habilitar paginação/ordenação com React Query (`QueryOptions`).
   - Ajustar cadastro/edição para usar os RPCs `cadastrar_veiculo` e `atualizar_veiculo` do serviço central.
3. **Dashboard**:
   - Reutilizar as métricas de estoque (totais, disponíveis, reservados, vendidos) carregadas pelos hooks para alimentar cards e gráficos.

## 5. Fase 3 – Vínculo veículo/loja e vitrine
1. **Hooks `useVeiculos` e `useVeiculosLoja`**:
   - Criar hook filtrando `veiculos_lojas` pela loja selecionada, com joins em `veiculos` e `modelos`, replicando lógica de `hooks/useVeiculos.ts` e `useVeiculosLoja.ts` do projeto original.
   - Implementar mutações `useAddVeiculoToLoja`, `useUpdateVeiculoLoja` e `useRemoveVeiculoFromLoja` integradas às tabelas Supabase e invalidando caches relevantes.
2. **Componente `VeiculoLojaManager`**:
   - Adaptar o componente do projeto original para a base atual, garantindo integração com os hooks acima e com o seletor de loja (`useCurrentStore`/`TenantContext`).
3. **Galeria de fotos**:
   - Completar `GalleryManager` para seguir o fluxo do original (`useVeiculoLojaFotos`, armazenamento no bucket `fotos_veiculos_loja`, ordenação com `@dnd-kit`).

## 6. Fase 4 – Documentação e compliance
1. **Hooks `useDocumentacao`**:
   - Recriar o fetch de `documentacao_veiculos` com join em `veiculos`, filtros por tenant e ordenação por atualização.
   - Conectar o resultado à futura página de compliance documental (`/app/compliance`), espelhando o resumo de pendências, concluídos e alertas e sincronizando estado com `useVersionStore`.
2. **Integração com fluxo de cadastro/edição**:
   - Garantir que atualizações de estado do veículo (ex.: `estado_veiculo`, `estado_venda`) reflitam automaticamente na documentação e invalidem as queries relacionadas.

## 7. Fase 5 – Anúncios, duplicados e sugestões
1. **Hooks de anúncios**:
   - Implementar `useAnuncios` e `useAnunciosStats` com joins em `anuncios`, `plataformas`, `veiculos_loja` e `veiculos`, filtrando por loja selecionada.
   - Adicionar filtros locais (status, busca) conforme a UI do projeto original e preparar mutations para criação/edição futura.
2. **Veículos ociosos e duplicados**:
   - Consumir a RPC `obter_veiculos_ociosos` e a view `view_sugestoes_duplicados` para alimentar as tabs de recomendações.
   - Criar fallback local caso a view/RPC não esteja disponível, mantendo componentes responsivos na UI.
3. **Integração com página `Vitrine` e `CriarAnuncio`** (quando existentes) para permitir seleção de veículos elegíveis (`useVeiculosParaAnuncio`).

## 8. Fase 6 – Vendas e métricas complementares
1. **Hook `useVendas`**:
   - Substituir mocks por consultas reais assim que a tabela `vendas` existir; até lá, manter estrutura que suporte a futura migração.
2. **Dashboard consolidado**:
   - Alimentar cards e gráficos com dados agregados das seções anteriores (estoque, anúncios, vendas, promoções).

## 9. Considerações transversais
- **React Query**: configurar chaves compostas (`queryKey`) e tempos de stale/gc conforme referência para evitar requisições redundantes.
- **Tratamento de erros**: padronizar mensagens utilizando um helper tipo `ApiClient.execute` antes de propagar para `toast` ou banners.
- **Design System**: garantir consistência ao portar componentes (botões, cards, badges) e ajustar temas/dark mode se adotarmos a mesma store de UI.
- **Testes e observabilidade**: preparar mocks para Supabase em testes de integração e definir métricas de logs para monitorar RPCs críticos.

## 10. Entregáveis por fase
- Repositório atualizado com hooks e serviços equivalentes aos do `rn-gestor-auto`.
- Documentação técnica por fluxo (Estoque, Lojas, Anúncios, Documentação).
- Lista de dependências backend (ver `funcoes-backlog.md`).
- Guias de migração para equipes de suporte e operação.
