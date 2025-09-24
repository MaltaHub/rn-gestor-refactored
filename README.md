# Gestor Automotivo UI (Next.js)

Interface declarativa construída com Next.js 14 (App Router), focada em demonstrar os principais fluxos de um gestor automotivo sem dependências de back-end. Cada ação relevante possui comentários destacados (`// action:`) indicando onde conectar regras de negócio, integrações externas e automações — mantendo a simplicidade com proficiência operacional.

## Scripts

- `npm run dev` — inicia o servidor de desenvolvimento em modo App Router.
- `npm run build` — gera o build de produção.
- `npm run start` — inicia o build de produção.
- `npm run lint` — executa a verificação padrão do Next.js.

## Estrutura

- `src/app/(site)` — landing e login usando o layout público padrão (`MarketingLayout` + `StandardLayout`).
- `src/app/app` — cockpit interno com layout privado (`AppShell`) e módulos operacionais.
- `src/app/app/perfil` — módulo dedicado ao perfil pessoal e ajustes rápidos.
- `src/components/layout` — layouts compartilhados (`PageHeader`, `StandardLayout`, `MarketingLayout`, `AppShell`).
- `src/components/ui` — componentes atômicos e tipados (`Button`, `Card`, `Input`, `Badge`).
- `src/data` — descritores de módulos e highlights usados na landing e no app.

## Próximos passos sugeridos

1. Conectar provedores de autenticação no formulário de login (`src/app/(site)/login/page.tsx`).
2. Integrar serviços e hooks de dados nos módulos (`src/app/app/*`).
3. Configurar camada de design tokens/tema conforme identidade da empresa.
4. Automatizar testes de interface após adicionar lógica dinâmica.
