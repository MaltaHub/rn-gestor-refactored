# Guia Completo do Projeto `rn-gestor-refactored`

## 1. Visão Geral
Este repositório contém a refatoração do console web de um ERP automotivo multi-loja construído em **Next.js 14** (App Router) com **TypeScript**, **Tailwind CSS** e um núcleo de serviços tipados que imitam a camada RPC do back-end. Toda a experiência de desenvolvimento gira em torno de mocks determinísticos e de uma tipagem derivada do `schema.sql`, preparada para, no futuro, ser conectada a uma API real ou a uma camada Supabase/Postgres.

## 2. Fluxo de Desenvolvimento
1. **Instalação**
   ```bash
   npm install
   ```
2. **Carga de tipagens**
   - Tipos de banco são regenerados a partir de `src/types/schema.sql` e vivem em `src/types/database.ts`.
   - As view-models consumidas pelo front estão em `src/types/domain.ts` e derivam diretamente das colunas do schema.
3. **Mock Services**
   - O diretório `src/lib/services/` fornece clientes `readClient` e `writeClient` com mocks. Use-os para novas telas antes da integração real.
4. **Rodar em desenvolvimento**
   ```bash
   npm run dev
   ```
   Disponível em `http://localhost:3000`.
5. **Verificação contínua**
   - Type-check: `npx tsc --noEmit`
   - Lint: `npm run lint`
   - Build de produção: `npm run build`
6. **Fluxo de PR**
   - Crie feature branches.
   - Garanta que tipagem, lint e build passem.
   - Solicite review com link para evidências (printscreen ou vídeo) quando possível.

## 3. Pipeline de Finalização
1. **Garantir integridade tipada**: `npx tsc --noEmit`
2. **Lint/Format**: `npm run lint` (o projeto usa ESLint + Prettier via Next)
3. **Build final**: `npm run build`
4. **Snapshot da UI** (manual): conferir rapidamente as rotas principais `/`, `/login`, `/app`, `/app/estoque`, `/app/anuncios`, `/app/vendas`, `/app/promocoes`.
5. **Gerar changelog** (manual): resumo das alterações relevantes.
6. **Tag/Deploy**: conforme ambiente alvo (ver seção 4).

## 4. Implantação
Como não há integração direta com um back-end, o deploy hoje fecha apenas o front estático do Next:

1. **Variáveis de ambiente**: verifique `next.config.js` caso precise mapear domínios/API.
2. **Build**: `npm run build`.
3. **Start** (modo Node): `npm run start` com as variáveis de ambiente reais (`PORT`, `NEXT_PUBLIC_*`).
4. **Hospedagem alternativa**: Vercel/Netlify podem servir a app sem ajustes. Se precisar de SSR híbrido com dados reais, será necessário implementar as rotas de API ou conectar os serviços à camada de back-end.

## 5. Estrutura de Pastas e Arquivos
| Caminho | Finalidade |
| --- | --- |
| `next.config.js` | Configuração de build do Next.js, incluindo aliases e ajustes de runtime. |
| `package.json` | Metadados do projeto, scripts (`dev`, `build`, `start`, `lint`) e dependências. |
| `tailwind.config.js` / `postcss.config.js` | Personalização do Tailwind e pipeline de CSS. |
| `tsconfig.json` | Base TypeScript (inclui paths para `@/`). |
| `FLOW_MAP.md` | Fluxograma operacional da aplicação, descreve jornadas principais. |
| `SYSTEM_OVERVIEW.md` (este arquivo) | Guia completo de desenvolvimento/implantação e mapa dos artefatos. |
| `src/types/schema.sql` | Dump do schema relacional usado para derivar tipagem. |
| `src/types/database.ts` | Tipos `*Row` gerados a partir do schema, representando exatamente as colunas das tabelas. |
| `src/types/domain.ts` | Modelos de domínio consumidos pelo front (vehicle summaries, anúncios, promoções, filtros, etc.) derivando de `database.ts`. |
| `src/app/` | Rotas App Router (landing, login, dashboards, módulos). Cada subpasta corresponde a um segmento do Next. |
| `src/components/` | Componentes reutilizáveis (layout, UI, formulários). |
| `src/lib/services/core.ts` | Núcleo dos clientes `readClient` e `writeClient`, gerenciamento de escopo (`loja`) e registro dinâmico de handlers/mocks. |
| `src/lib/services/operations.ts` | Tabela verdade das operações suportadas (read/write), com metadata (domínio, descrição, requisito de loja). |
| `src/lib/services/mocks.ts` | Implementações mockadas para cada operação (busca estoque, listagem de anúncios, promoções, vendas, etc.). |
| `src/lib/services/mock-data.ts` | Fixtures tipadas (veículos, anúncios, promoções, vendas, permissões) baseadas em `domain.ts`. |
| `src/lib/services/domains/` | Fachadas por domínio (estoque, anúncios, vendas, promoções, usuários) que encapsulam chamadas ao core-service. |
| `src/lib/services/loja-state.ts` | Gerência o `globalLoja`, subscribers e overrides para escopo manual. |
| `src/lib/services/types.ts` | Declaração de tipos utilitários (`ReadHandler`, `WriteHandler`, `RequestScope`) usados no core. |

## 6. Como Estender
1. **Nova operação de leitura**
   - Atualize `src/types/domain.ts` com o modelo de dados desejado.
   - Adicione entrada correspondente em `ReadOperationMap` (`operations.ts`).
   - Crie mock em `mocks.ts` (opcionalmente fixtures em `mock-data.ts`).
   - Exponha via arquivo em `domains/` se desejar uma API específica.
2. **Nova rota/tela**
   - Crie diretório em `src/app/...` usando App Router.
   - Consuma os domínios via hooks/async server components.
3. **Integração real com back-end**
   - Substitua gradualmente chamadas dos mocks por fetches reais (REST, GraphQL ou Supabase) mantendo a tipagem forte do domínio.
   - Quando uma operação real estiver pronta, registre handler via `readClient.register`/`writeClient.register` ou remova a dependência do mock.

## 7. Roadmap sugerido
1. Conectar `readClient`/`writeClient` a endpoints reais conforme o back-end for disponibilizado.
2. Migrar os componentes de UI para consumir dados assíncronos do serviço ao invés de arrays internos.
3. Reativar módulos atualmente fictícios (ex.: vitrine) apenas quando o back-end possuir suporte.
4. Implementar autenticação real integrando o token obtido em `auth.login` com cookies/session.
5. Adicionar testes e2e (Playwright) para fluxos críticos (login, criação de veículo, ajuste promocional).

## 8. Resumo das Principais Dependências
- **Next.js 14**: roteamento App Router e bundler.
- **Tailwind CSS 3.4**: estilos utilitários.
- **Lucide React**: ícones.
- **clsx**: composição de classes.

Com este guia, um desenvolvedor pode entender a arquitetura atual, reproduzir o ambiente, evoluir funcionalidades, validar entregas e preparar o front-end para uma futura integração com o back-end oficial.
