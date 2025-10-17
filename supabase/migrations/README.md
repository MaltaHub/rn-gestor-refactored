# Migrations e Scripts SQL

Esta pasta contém todas as migrations e scripts SQL organizados por tipo.

## Estrutura

### 📋 checks/
Scripts de verificação e diagnóstico do banco de dados:
- `check-backend-status.sql` - Verifica status do backend
- `check-policies.sql` - Verifica políticas RLS

### 🔧 fixes/
Scripts de correção e ajustes:
- `fix-permissions.sql` - Corrige permissões
- `fix-rls-completo.sql` - Correção completa de RLS
- `fix-rls-notificacoes-tokens.sql` - Correção específica de RLS para notificações e tokens

### ⚡ triggers/
Triggers e funções do banco:
- `exemplo-trigger-notificacao.sql` - Exemplo de implementação de trigger
- `sistema-notificacoes-trigger.sql` - Sistema completo de notificações
- `sistema-notificacoes-trigger-simplificado.sql` - Versão simplificada

### 📦 pending/
Alterações pendentes que ainda não foram aplicadas:
- `supabase-migrations.sql` - Migrations principais pendentes

## Como usar

### Para verificar o banco
```bash
npx supabase db execute --file ./supabase/migrations/checks/check-backend-status.sql
```

### Para aplicar correções
```bash
npx supabase db execute --file ./supabase/migrations/fixes/fix-rls-completo.sql
```

### Para aplicar triggers
```bash
npx supabase db execute --file ./supabase/migrations/triggers/sistema-notificacoes-trigger.sql
```

### Para aplicar migrations pendentes
```bash
npx supabase db execute --file ./supabase/migrations/pending/supabase-migrations.sql
```

## Ordem recomendada de aplicação

1. Primeiro aplicar as migrations pendentes (pending/)
2. Aplicar as correções se necessário (fixes/)
3. Aplicar os triggers (triggers/)
4. Executar verificações (checks/)
