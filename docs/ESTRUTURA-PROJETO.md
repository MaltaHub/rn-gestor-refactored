# Estrutura do Projeto RN Gestor

## 📁 Estrutura de Pastas

```
rn-gestor-refactored/
├── docs/                           # Documentação do projeto
│   ├── ESTRUTURA-PROJETO.md       # Este arquivo
│   └── SISTEMA-NOTIFICACOES.md    # Documentação do sistema de notificações
│
├── supabase/                       # Configuração Supabase
│   ├── config.toml                # Configuração do CLI
│   ├── functions/                 # Edge Functions
│   ├── migrations/                # Scripts SQL organizados
│   │   ├── README.md             # Guia de uso das migrations
│   │   ├── checks/               # Scripts de verificação
│   │   ├── fixes/                # Scripts de correção
│   │   ├── pending/              # Alterações pendentes
│   │   └── triggers/             # Triggers e funções
│   └── scripts/                   # Scripts auxiliares
│
├── src/                           # Código fonte
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/               # Layout principal
│   │   │   ├── admin/           # Área administrativa
│   │   │   │   └── notificacoes/
│   │   │   ├── notificacoes/    # Interface de notificações
│   │   │   └── vitrine/         # Sistema de vitrine
│   │   └── layout.tsx
│   ├── components/               # Componentes React
│   │   ├── ui/                  # Componentes de UI base
│   │   ├── vitrine/             # Componentes de vitrine
│   │   ├── firebase-register.tsx
│   │   ├── notificacoes-listener.tsx
│   │   ├── notificacoes-setup.tsx
│   │   └── sidebar.tsx
│   ├── hooks/                    # React Hooks customizados
│   └── lib/                      # Bibliotecas e utilitários
│       └── firebase-client.ts
│
├── public/                        # Arquivos estáticos
│   └── firebase-messaging-sw.js  # Service Worker Firebase
│
└── attached_assets/               # Assets anexados

```

## 🔧 Configuração

### Supabase
- **Project ID**: `rn-gestor-refactored`
- **Project Ref**: `udzrkapsvgqgsbjpgkxe`
- **Config**: `/workspaces/rn-gestor-refactored/supabase/config.toml`

### Variáveis de Ambiente
Arquivo: `.env.local`
- Configurações do Supabase
- Configurações do Firebase
- Outras variáveis de ambiente

## 📝 Migrations e Scripts SQL

Todas as migrations estão organizadas em `/supabase/migrations/`:

- **checks/**: Scripts de verificação e diagnóstico
- **fixes/**: Correções de RLS e permissões
- **triggers/**: Sistema de notificações e triggers
- **pending/**: Alterações ainda não aplicadas

Consulte `/supabase/migrations/README.md` para mais detalhes.

## 🔔 Sistema de Notificações

O projeto implementa um sistema completo de notificações com:
- Firebase Cloud Messaging (FCM)
- Triggers do Supabase
- Interface de administração
- Listeners em tempo real

Consulte `/docs/SISTEMA-NOTIFICACOES.md` para documentação completa.

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
```

### Supabase
```bash
npx supabase link --project-ref udzrkapsvgqgsbjpgkxe    # Conectar ao projeto
npx supabase db pull                                     # Baixar schema remoto
npx supabase db push                                     # Aplicar migrations locais
npx supabase db execute --file <path>                    # Executar SQL
npx supabase functions deploy                            # Deploy de functions
```

## 📦 Próximos Passos

1. Aplicar migrations pendentes em `/supabase/migrations/pending/`
2. Verificar e ajustar políticas RLS se necessário
3. Testar sistema de notificações
4. Revisar configurações de segurança

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
