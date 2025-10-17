# Tasklist - Finalização do Backend

## 📊 Status Atual do Backend

### ✅ O que JÁ ESTÁ IMPLEMENTADO

#### 1. Estrutura do Banco de Dados
- ✅ **27 tabelas criadas** com todos os relacionamentos
- ✅ **Auditoria** (`veiculos_audit`, `veiculos_loja_audit`)
- ✅ **Sistema de permissões** (RBAC com `user_roles`, `permissoes_papel`)
- ✅ **Sistema de empresas** (multi-tenant completo)
- ✅ **Gestão de veículos** e estoque
- ✅ **Sistema de vendas** e anúncios
- ✅ **Sistema de notificações** (tabelas `notificacoes` e `notificacoes_tokens`)

#### 2. Funções e Procedures
- ✅ **24 funções RPC** implementadas
- ✅ Funções de negócio: `gerenciar_empresa`, `gerenciar_membros`, `gerenciar_anuncios`
- ✅ Funções de veículos: `rpc_veiculos`, `fotos_gerenciar`
- ✅ Funções de vendas: `rpc_registrar_venda`, `rpc_atualizar_status_venda`
- ✅ Funções de configurações: `rpc_configuracoes`
- ✅ Funções de notificações: `limpar_notificacoes_antigas`

#### 3. Triggers
- ✅ **4 triggers** de auditoria e atualização
- ✅ `update_notificacoes_updated_at` - Atualiza timestamp
- ✅ `update_notificacoes_tokens_updated_at` - Atualiza timestamp
- ✅ `veiculos_audit_trig` - Auditoria de veículos
- ✅ `veiculos_loja_audit_trig` - Auditoria de movimentações

#### 4. Políticas RLS (Row Level Security)
- ✅ **70+ políticas RLS** configuradas
- ✅ Segurança por empresa/usuário em todas as tabelas
- ✅ Políticas de notificações implementadas:
  - Users can read their own notifications
  - Users can update their own notifications
  - Service role can insert notifications

#### 5. Índices
- ✅ Índices em tabelas críticas para performance
- ✅ `idx_notificacoes_tokens_user_id`
- ✅ `idx_notificacoes_user_id`
- ✅ `idx_notificacoes_created_at`

#### 6. Views
- ✅ `notificacoes_nao_lidas_count` - Contador de notificações não lidas

#### 7. Edge Functions
- ✅ **1 Edge Function** implementada
- ✅ `enviar-notificacao` - Envia notificações push via Firebase

---

## ⚠️ O que FALTA IMPLEMENTAR

### 1. Políticas RLS para `notificacoes_tokens` ✅ IMPLEMENTADO

**Status:** ✅ **JÁ ESTÁ NO BANCO!**

**Política consolidada implementada:**
```sql
CREATE POLICY "Users can manage their own tokens"
  ON notificacoes_tokens
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Esta política cobre todas as operações (SELECT, INSERT, UPDATE, DELETE) de forma consolidada.

**Verificado em:** `supabase/dump/full_dump_20251016_200129.sql`

~~**Prioridade:** 🔴 ALTA (Segurança crítica)~~ ✅ **CONCLUÍDO**

---

### 2. Deploy da Edge Function ❌

**Status:** Função criada mas não foi feito deploy

**Solução:**
```bash
# 1. Configurar variáveis de ambiente no Supabase Dashboard
# Settings → Edge Functions → Add secret
FIREBASE_SERVICE_ACCOUNT=<conteúdo-do-json-service-account>
SUPABASE_URL=https://udzrkapsvgqgsbjpgkxe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# 2. Deploy da função
npx supabase functions deploy enviar-notificacao --no-verify-jwt
```

**Onde obter as keys:**
- `FIREBASE_SERVICE_ACCOUNT`: Firebase Console → Project Settings → Service Accounts → Generate new private key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → service_role (secret)

**Prioridade:** 🔴 ALTA (Notificações não funcionarão sem isso)

---

### 3. Configurar Firebase Cloud Messaging no Backend ❌

**O que falta:**
1. Habilitar Firebase Cloud Messaging API
2. Configurar domínios autorizados
3. Adicionar Service Account no projeto

**Passos:**
1. Firebase Console → Project Settings → Cloud Messaging
2. Habilitar "Cloud Messaging API"
3. Settings → Service accounts → Generate new private key
4. Salvar JSON no Supabase Edge Functions (variável `FIREBASE_SERVICE_ACCOUNT`)

**Prioridade:** 🔴 ALTA

---

### 4. Trigger Automático para Notificações ⚠️

**Status:** Trigger exemplo existe em `migrations-backup/triggers/`, mas não está aplicado

**Opções:**

#### Opção A: Trigger ao criar venda
```sql
CREATE OR REPLACE FUNCTION notificar_nova_venda()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar administradores da empresa
  INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data)
  SELECT
    me.usuario_id,
    'Nova Venda Registrada',
    'Uma nova venda foi registrada no sistema',
    'success',
    jsonb_build_object(
      'venda_id', NEW.id,
      'valor', NEW.valor_total,
      'link', '/vendas/' || NEW.id
    )
  FROM membros_empresa me
  WHERE me.empresa_id = NEW.empresa_id
    AND me.papel IN ('admin', 'proprietario');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_nova_venda
  AFTER INSERT ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION notificar_nova_venda();
```

#### Opção B: Trigger ao adicionar veículo
```sql
CREATE OR REPLACE FUNCTION notificar_novo_veiculo()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar gerentes da loja
  INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data)
  SELECT
    me.usuario_id,
    'Novo Veículo Adicionado',
    'Um novo veículo foi adicionado ao estoque',
    'info',
    jsonb_build_object(
      'veiculo_id', NEW.veiculo_id,
      'loja_id', NEW.loja_id,
      'link', '/vitrine/' || NEW.veiculo_id
    )
  FROM membros_empresa me
  JOIN lojas l ON l.empresa_id = me.empresa_id
  WHERE l.id = NEW.loja_id
    AND me.papel IN ('gerente', 'admin', 'proprietario');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_novo_veiculo
  AFTER INSERT ON veiculos_loja
  FOR EACH ROW
  EXECUTE FUNCTION notificar_novo_veiculo();
```

**Prioridade:** 🟡 MÉDIA (Opcional, mas útil)

---

### 5. Limpeza Automática de Notificações Antigas ⚠️

**Status:** Função existe, mas precisa de agendamento

**Solução:** Usar pg_cron ou Edge Function agendada

#### Opção A: pg_cron (Supabase Pro)
```sql
-- Executar função toda semana
SELECT cron.schedule(
  'limpar-notificacoes-antigas',
  '0 0 * * 0', -- Todo domingo à meia-noite
  $$SELECT limpar_notificacoes_antigas()$$
);
```

#### Opção B: Edge Function agendada (Supabase Pro)
Criar função que roda a cada semana via webhook

**Prioridade:** 🟢 BAIXA (Manutenção)

---

### 6. Índice Composto para Consultas de Notificações ✅ IMPLEMENTADO

**Status:** ✅ **JÁ ESTÃO NO BANCO!**

**Índices implementados:**
```sql
-- Índices já criados e otimizados:
CREATE INDEX idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(user_id, lida);
CREATE INDEX idx_notificacoes_created_at ON notificacoes(created_at DESC);
CREATE INDEX idx_notificacoes_tokens_user_id ON notificacoes_tokens(user_id);
```

**Verificado em:** `supabase/dump/full_dump_20251016_200129.sql`

~~**Prioridade:** 🟡 MÉDIA (Performance)~~ ✅ **CONCLUÍDO**

---

### 7. Função para Marcar Todas como Lidas ⚠️

**Funcionalidade útil:**
```sql
CREATE OR REPLACE FUNCTION marcar_todas_lidas(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notificacoes
  SET lida = true
  WHERE user_id = p_user_id AND lida = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy
CREATE POLICY "Users can mark all as read"
  ON notificacoes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Prioridade:** 🟡 MÉDIA (UX)

---

### 8. Verificações de Integridade ✅ (Já existe script)

**Scripts disponíveis em `migrations-backup/checks/`:**
- ✅ `check-backend-status.sql` - Verifica status geral
- ✅ `check-policies.sql` - Verifica políticas RLS

**Ação:** Executar para validar o backend

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Segurança Crítica (FAZER AGORA)
- [ ] 1.1. Aplicar políticas RLS em `notificacoes_tokens`
- [ ] 1.2. Verificar todas as políticas com `check-policies.sql`
- [ ] 1.3. Testar permissões de usuários

### Fase 2: Funcionalidades Core (FAZER EM SEGUIDA)
- [ ] 2.1. Configurar Firebase Service Account
- [ ] 2.2. Deploy da Edge Function `enviar-notificacao`
- [ ] 2.3. Testar envio de notificações push
- [ ] 2.4. Verificar registro de tokens FCM

### Fase 3: Automações (OPCIONAL, MAS RECOMENDADO)
- [ ] 3.1. Criar trigger de notificação para vendas
- [ ] 3.2. Criar trigger de notificação para novos veículos
- [ ] 3.3. Implementar função "marcar todas como lidas"
- [ ] 3.4. Adicionar índice composto para performance

### Fase 4: Manutenção (PODE SER DEPOIS)
- [ ] 4.1. Configurar limpeza automática de notificações antigas
- [ ] 4.2. Monitorar performance das queries
- [ ] 4.3. Revisar logs da Edge Function

---

## 🔧 Scripts Prontos para Executar

### Script 1: Aplicar Políticas RLS Faltantes
**Arquivo:** `supabase/migrations-backup/fixes/fix-rls-notificacoes-tokens.sql`

```bash
npx supabase db execute --file supabase/migrations-backup/fixes/fix-rls-notificacoes-tokens.sql
```

### Script 2: Verificar Backend
```bash
npx supabase db execute --file supabase/migrations-backup/checks/check-backend-status.sql
npx supabase db execute --file supabase/migrations-backup/checks/check-policies.sql
```

### Script 3: Deploy Edge Function
```bash
# Definir secrets primeiro no Dashboard
npx supabase functions deploy enviar-notificacao --no-verify-jwt
```

---

## 📊 Resumo do Status (ATUALIZADO)

| Componente | Status | Ação Necessária |
|------------|--------|-----------------|
| Schema do Banco | ✅ Completo | Nenhuma |
| Funções RPC | ✅ Completo | Nenhuma |
| Triggers | ✅ Completo | Nenhuma |
| RLS - Geral | ✅ Completo | Nenhuma |
| RLS - Notificações Tokens | ✅ Completo | ~~Aplicar políticas~~ **JÁ APLICADO** |
| Índices de Performance | ✅ Completo | ~~Criar índices~~ **JÁ CRIADOS** |
| View de Não Lidas | ✅ Completo | ~~Criar view~~ **JÁ CRIADA** |
| Edge Function | ✅ Completo | ~~Fazer deploy~~ **JÁ DEPLOYADA (v6)** |
| Firebase Config | ❌ Faltando | **Configurar** |
| Triggers Automáticos | ⚠️ Opcional | Decidir e aplicar |
| Limpeza Automática | ⚠️ Opcional | Configurar cron |

---

## ✅ Próximos Passos Imediatos (ATUALIZADO)

### ✅ O que JÁ está pronto (após análise do dump):
1. ~~**Executar:** `fix-rls-notificacoes-tokens.sql`~~ ✅ **JÁ APLICADO**
2. ~~**Criar índices de performance**~~ ✅ **JÁ CRIADOS**
3. ~~**Criar view de não lidas**~~ ✅ **JÁ CRIADA**

### 🔴 O que REALMENTE falta (apenas 1 item!):
1. **Configurar:** Firebase Service Account no Supabase Dashboard
   - Settings → Edge Functions → Add Secret
   - Nome: `FIREBASE_SERVICE_ACCOUNT`
   - Valor: JSON do Service Account do Firebase

2. ~~**Deploy:** Edge Function `enviar-notificacao`~~ ✅ **JÁ DEPLOYADA!**
   - **Nome:** `enviar_notificacao` (com underscore)
   - **URL:** `https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao`
   - **Status:** ACTIVE (v6, atualizada em 2025-10-16 18:30:59)
   - **Verificado com:** `npx supabase functions list`

### 🟡 Opcional (melhorias):
3. **Criar triggers** de notificações automáticas (vendas, veículos)
4. **Configurar limpeza** automática via pg_cron

---

**CONCLUSÃO:** O backend de notificações está **99% completo**!

Falta apenas **1 configuração** para estar 100% funcional:
- ✅ Banco de dados: **100% pronto**
- ✅ Edge Function: **100% deployada e ativa** (v6)
- ❌ Firebase: **Precisa configurar Service Account**

🚀 **Após configuração do Firebase = Sistema 100% operacional!**

---

## 🎯 ATUALIZAÇÃO IMPORTANTE

### Edge Function Status

A Edge Function `enviar_notificacao` **JÁ ESTÁ DEPLOYADA E ATIVA**!

**Detalhes:**
- ✅ Nome: `enviar_notificacao` (underscore, não hífen)
- ✅ Status: ACTIVE
- ✅ Versão: v6
- ✅ Última atualização: 2025-10-16 18:30:59 UTC
- ✅ URL: `https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao`

**Teste realizado:**
```bash
curl https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao
# Resposta: {"code":401,"message":"Missing authorization header"}
```

✅ A função está respondendo corretamente (requer autenticação como esperado)
