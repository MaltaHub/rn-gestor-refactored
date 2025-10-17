# Sistema de Notificações Push - Guia Completo

## 📋 Visão Geral

Sistema completo de notificações push usando Firebase Cloud Messaging (FCM) integrado com Supabase.

### Funcionalidades implementadas:

✅ Notificações push em background (app fechado)
✅ Notificações em foreground com toast (app aberto)
✅ Página de histórico de notificações
✅ Marcação de lidas/não lidas
✅ Sistema de tipos (info, success, warning, error)
✅ Integração com triggers do Supabase
✅ Edge Function para envio programático

---

## 🚀 Setup Inicial

### 1. Execute o SQL das tabelas no Supabase

No **SQL Editor** do Supabase Dashboard, execute o arquivo:
```sql
supabase-migrations.sql
```

Isso criará:
- Tabela `notificacoes_tokens` (tokens FCM dos usuários)
- Tabela `notificacoes` (histórico de notificações)
- Políticas RLS (segurança)
- Índices para performance

### 2. Deploy da Edge Function

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref seu-projeto-id

# Deploy da função
supabase functions deploy enviar-notificacao --no-verify-jwt
```

### 3. Configurar variável de ambiente no Supabase

No **Supabase Dashboard → Settings → Edge Functions → Environment Variables**:

```
FIREBASE_SERVER_KEY=sua-firebase-server-key
```

**Como obter a Server Key:**
1. Firebase Console → Project Settings → Cloud Messaging
2. Em "Cloud Messaging API (Legacy)", copie o **Server Key**

---

## 📱 Como Funciona

### Fluxo completo:

```
1. Usuário permite notificações
   ↓
2. Token FCM é gerado e salvo no banco (notificacoes_tokens)
   ↓
3. Trigger/API chama Edge Function "enviar-notificacao"
   ↓
4. Edge Function:
   - Salva notificação no banco (notificacoes)
   - Busca tokens do usuário
   - Envia push via Firebase
   ↓
5. Usuário recebe:
   - Push notification (se app fechado/background)
   - Toast (se app aberto)
```

---

## 💻 Como Usar no Código

### 1. Chamar a Edge Function manualmente

```typescript
import { supabase } from "@/lib/supabase";

async function enviarNotificacao() {
  const { data, error } = await supabase.functions.invoke("enviar-notificacao", {
    body: {
      user_id: "uuid-do-usuario",
      titulo: "Título da notificação",
      mensagem: "Mensagem detalhada aqui",
      tipo: "success", // info | success | warning | error
      data: {
        // Dados adicionais (opcional)
        link: "/estoque/123",
        acao: "ver_detalhes"
      }
    }
  });

  if (error) {
    console.error("Erro ao enviar notificação:", error);
  } else {
    console.log("Notificação enviada:", data);
  }
}
```

### 2. Criar um trigger no Supabase

Veja exemplos completos em: `exemplo-trigger-notificacao.sql`

**Exemplo básico:**

```sql
CREATE OR REPLACE FUNCTION notificar_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação direto na tabela
  INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
  VALUES (
    NEW.user_id,
    'Ação realizada',
    'Sua ação foi processada!',
    'success'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER meu_trigger
  AFTER INSERT ON minha_tabela
  FOR EACH ROW
  EXECUTE FUNCTION notificar_usuario();
```

### 3. Usar Toast manualmente no frontend

```typescript
"use client";

import { useToast } from "@/components/ui/toast";

export function MeuComponente() {
  const { mostrarToast } = useToast();

  function handleClick() {
    mostrarToast({
      titulo: "Sucesso!",
      mensagem: "Operação realizada com sucesso",
      tipo: "success",
      duracao: 5000 // ms (opcional)
    });
  }

  return <button onClick={handleClick}>Testar Toast</button>;
}
```

---

## 🎨 Tipos de Notificações

| Tipo | Cor | Ícone | Uso |
|------|-----|-------|-----|
| `info` | Azul | ℹ️ | Informações gerais |
| `success` | Verde | ✓ | Operações bem-sucedidas |
| `warning` | Amarelo | ⚠️ | Avisos importantes |
| `error` | Vermelho | ✕ | Erros e falhas |

---

## 📄 Páginas e Componentes

### Páginas:
- `/notificacoes` - Lista todas as notificações do usuário

### Componentes criados:

1. **`NotificacoesSetup`** (`src/components/notificacoes-setup.tsx`)
   - Solicita permissão ao usuário
   - Salva token FCM no banco

2. **`NotificacoesListener`** (`src/components/notificacoes-listener.tsx`)
   - Escuta notificações em foreground
   - Mostra toast quando app está aberto

3. **`ToastProvider`** (`src/components/ui/toast.tsx`)
   - Sistema de toast/notificações temporárias
   - Animações e auto-dismiss

4. **`FirebaseRegister`** (`src/components/firebase-register.tsx`)
   - Registra o Service Worker do Firebase

---

## 🔧 Testando o Sistema

### 1. Teste pelo Console do Firebase

1. Firebase Console → Cloud Messaging → "Send test message"
2. Adicione o token FCM (copiado do console do navegador)
3. Envie a mensagem

### 2. Teste pela Edge Function

No console do navegador (DevTools):

```javascript
// Obter o Supabase client
const supabase = window.supabase; // ou importe do seu código

// Enviar notificação de teste
const { data, error } = await supabase.functions.invoke("enviar-notificacao", {
  body: {
    user_id: "seu-user-id-aqui",
    titulo: "Teste de notificação",
    mensagem: "Esta é uma notificação de teste!",
    tipo: "info"
  }
});

console.log(data, error);
```

### 3. Teste direto pelo SQL

No SQL Editor do Supabase:

```sql
-- Inserir notificação diretamente
INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
VALUES (
  'uuid-do-usuario',
  'Teste SQL',
  'Notificação criada direto pelo SQL',
  'info'
);
```

---

## 🐛 Troubleshooting

### Notificações não estão chegando:

1. **Verificar permissão do navegador:**
   - Console → `Notification.permission` deve ser `"granted"`

2. **Verificar token FCM:**
   - Console → Deve aparecer "Token FCM: ..."
   - Verificar se está salvo no banco: `SELECT * FROM notificacoes_tokens;`

3. **Verificar Firebase Cloud Messaging API:**
   - Firebase Console → Project Settings → Cloud Messaging
   - API deve estar **habilitada**

4. **Verificar Service Worker:**
   - DevTools → Application → Service Workers
   - Deve ter `firebase-messaging-sw.js` registrado

5. **Verificar Edge Function:**
   - Supabase Dashboard → Edge Functions → Logs
   - Ver se há erros ao enviar

### Toast não aparece:

- Verificar se `ToastProvider` está no `layout.tsx`
- Verificar se `NotificacoesListener` está no layout da área autenticada

---

## 📊 Estrutura do Banco

### Tabela: `notificacoes_tokens`
```sql
id          | UUID      | PK
user_id     | UUID      | FK -> auth.users
token       | TEXT      | Token FCM
created_at  | TIMESTAMP
updated_at  | TIMESTAMP
```

### Tabela: `notificacoes`
```sql
id          | UUID      | PK
user_id     | UUID      | FK -> auth.users
titulo      | TEXT
mensagem    | TEXT
tipo        | TEXT      | info | success | warning | error
lida        | BOOLEAN   | default: false
data        | JSONB     | Dados adicionais
created_at  | TIMESTAMP
updated_at  | TIMESTAMP
```

---

## 🔒 Segurança

- ✅ RLS (Row Level Security) habilitado
- ✅ Usuários só veem suas próprias notificações
- ✅ Usuários só podem atualizar suas próprias notificações
- ✅ Service role pode inserir notificações (para triggers)
- ✅ Tokens FCM armazenados de forma segura

---

## 📚 Recursos Adicionais

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

## 🎯 Próximos Passos (Opcional)

- [ ] Badge com contador de não lidas no ícone do sidebar
- [ ] Som customizado para notificações
- [ ] Filtros avançados na página de notificações
- [ ] Notificações agrupadas por tipo
- [ ] Preferências de notificação por usuário
- [ ] Ações rápidas nas notificações (ex: "Ver agora", "Dispensar")

---

**Sistema completo e funcional! 🎉**
