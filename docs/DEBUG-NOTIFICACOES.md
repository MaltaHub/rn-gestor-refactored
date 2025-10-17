# Debug - Notificações não estão sendo enviadas pelo Frontend

## 🔍 Problema Identificado

**Situação:**
- ✅ CURL funciona (direto no terminal)
- ❌ Frontend não funciona (formulário)
- 📊 Logs mostram apenas **OPTIONS** (preflight), nenhum **POST**

## 🐛 Possíveis Causas

### 1. Requisição POST não está sendo enviada

**Sintoma:** Apenas requisições OPTIONS aparecem nos logs

**Diagnóstico:**
```javascript
// Abra o DevTools (F12) → Console
// Cole isso e execute:

const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
  body: {
    user_id: 'SEU-USER-ID-AQUI',
    titulo: 'Teste Debug',
    mensagem: 'Teste de debug direto do console',
    tipo: 'info'
  }
});

console.log('Resultado:', { data, error });
```

**O que verificar:**
- Se aparecer erro de CORS → Problema nos headers
- Se aparecer erro 401 → Problema de autenticação
- Se aparecer erro 404 → Nome da função errado
- Se funcionar → Problema está no formulário

---

### 2. Headers de Autenticação

**Verificação:**
```javascript
// No DevTools Console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Sessão ativa:', session);
console.log('Access Token:', session?.access_token);
```

**Se session for null:**
- Usuário não está autenticado
- Recarregue a página e faça login novamente

---

### 3. URL da Função

**Verificar se está chamando a URL correta:**

```javascript
// DevTools Console
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Função deveria estar em:', `${supabase.supabaseUrl}/functions/v1/enviar_notificacao`);
```

**URL esperada:**
```
https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao
```

---

### 4. Corpo da Requisição

**Verificar se o payload está correto:**

```javascript
// No formulário, adicione console.log antes do invoke:
console.log('Enviando payload:', {
  user_id: userId,
  titulo,
  mensagem,
  tipo,
  data: { ... }
});
```

---

## 🔧 Testes Recomendados

### Teste 1: Via DevTools Console (Rápido)

```javascript
// 1. Obter seu user_id
const { data: { user } } = await supabase.auth.getUser();
console.log('Meu User ID:', user?.id);

// 2. Testar envio direto
const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
  body: {
    user_id: user?.id,
    titulo: 'Teste Console',
    mensagem: 'Mensagem de teste',
    tipo: 'info'
  }
});

console.log('Resultado:', { data, error });
```

**Resultado esperado:**
- Se funcionar: Problema está no código do formulário
- Se não funcionar: Problema é mais profundo (auth, CORS, etc)

---

### Teste 2: Network Tab (Detalhado)

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Filtre por "enviar_notificacao"
4. Tente enviar uma notificação pelo formulário
5. Observe as requisições

**O que procurar:**
- ✅ Deve aparecer:
  - 1 requisição OPTIONS (preflight)
  - 1 requisição POST (dados reais)

- ❌ Se aparecer apenas OPTIONS:
  - Requisição POST foi bloqueada (CORS ou erro de JS)
  - Veja o console para erros JavaScript

---

### Teste 3: CURL (Baseline)

```bash
# Obtenha seu access token primeiro:
# DevTools Console:
const { data: { session } } = await supabase.auth.getSession();
console.log(session?.access_token);

# No terminal:
curl -X POST \
  https://udzrkapsvgqgsbjpgkxe.supabase.co/functions/v1/enviar_notificacao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU-ACCESS-TOKEN" \
  -d '{
    "user_id": "SEU-USER-ID",
    "titulo": "Teste CURL",
    "mensagem": "Teste via terminal"
  }'
```

---

## 🚨 Checklist de Diagnóstico

- [ ] 1. Usuário está logado? (session não é null)
- [ ] 2. User ID está correto? (UUID válido)
- [ ] 3. Função está com nome correto? (`enviar_notificacao`)
- [ ] 4. Console do navegador mostra erros?
- [ ] 5. Network tab mostra requisição POST?
- [ ] 6. Headers de Authorization estão sendo enviados?
- [ ] 7. Content-Type é application/json?
- [ ] 8. CURL funciona?

---

## 💡 Soluções Rápidas

### Solução 1: Forçar Headers
```typescript
const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
  body: {
    user_id: userId,
    titulo,
    mensagem,
    tipo
  },
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Solução 2: Verificar Autenticação
```typescript
// Antes de invocar:
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  console.error('Não autenticado!');
  return;
}
console.log('Autenticado como:', session.user.email);
```

### Solução 3: Adicionar Logs Detalhados
```typescript
async function handleEnviar(e: React.FormEvent) {
  e.preventDefault();

  console.log('🚀 Iniciando envio de notificação');
  console.log('📋 Payload:', { user_id: userId, titulo, mensagem, tipo });

  try {
    console.log('📡 Invocando função...');
    const result = await supabase.functions.invoke('enviar_notificacao', {
      body: { user_id: userId, titulo, mensagem, tipo }
    });

    console.log('✅ Resultado:', result);

    if (result.error) {
      console.error('❌ Erro:', result.error);
      throw result.error;
    }

    console.log('📦 Data:', result.data);
  } catch (error) {
    console.error('💥 Exceção:', error);
  }
}
```

---

## 📊 O que os Logs Mostram

**Logs atuais:**
```
📥 Nova requisição recebida: OPTIONS
⚙️ Preflight recebido
```

**Logs esperados (quando funcionar):**
```
📥 Nova requisição recebida: OPTIONS
⚙️ Preflight recebido
📥 Nova requisição recebida: POST
🧾 Headers: {...}
📦 Body recebido (raw): {...}
🔍 Dados parseados: {...}
🔎 Buscando tokens do usuário...
📤 Notificação enviada com sucesso
```

---

## 🎯 Próximo Passo

**Execute o Teste 1 no DevTools Console** e me envie:
1. O resultado do console.log
2. Qualquer erro que aparecer
3. Screenshot da aba Network (se possível)

Isso vai me dizer exatamente onde está o bloqueio!