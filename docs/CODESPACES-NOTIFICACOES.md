# 🚨 Notificações no GitHub Codespaces

## ⚠️ IMPORTANTE: Limitações do Codespaces

O GitHub Codespaces tem **restrições** que podem impedir o funcionamento de notificações push!

---

## 🔍 Problemas Conhecidos no Codespaces

### 1. Service Workers podem não funcionar
- Codespaces usa proxy reverso
- Service Workers exigem HTTPS "real"
- Firebase Messaging precisa de Service Worker

### 2. Permissões de Notificação
- Browser pode bloquear notificações em ambientes de desenvolvimento
- Codespaces roda em domínio temporário (`*.github.dev`)

### 3. CORS e Headers
- Proxy do Codespaces pode modificar headers
- Pode causar problemas com CORS preflight

---

## ✅ O que FUNCIONA no Codespaces

1. ✅ **Chamadas diretas via CURL** → Funciona (você testou!)
2. ✅ **Banco de dados Supabase** → Funciona
3. ✅ **Edge Functions** → Funcionam
4. ❌ **Service Workers / FCM** → Pode não funcionar
5. ❌ **Push Notifications** → Pode não funcionar

---

## 🔧 Testes Recomendados

### Teste 1: Verificar se o problema é o Codespaces

**No DevTools Console do Codespaces:**
```javascript
// Verificar se Service Worker está registrado
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Verificar permissão de notificações
console.log('Permissão:', Notification.permission);

// Verificar HTTPS
console.log('Protocolo:', window.location.protocol);
console.log('Host:', window.location.host);
```

**Resultado esperado:**
- Protocol: `https:`
- Host: `*.github.dev`
- Permission: `granted` ou `default`

---

### Teste 2: Chamar a Edge Function DIRETAMENTE (sem FCM)

A Edge Function tem 2 partes:
1. Salvar notificação no banco ✅ (deve funcionar)
2. Enviar push via Firebase ❌ (pode não funcionar)

**Teste simplificado:**
```javascript
// No DevTools Console
const { data: { user } } = await supabase.auth.getUser();

// Inserir notificação DIRETO no banco (bypass da Edge Function)
const { data, error } = await supabase
  .from('notificacoes')
  .insert({
    user_id: user.id,
    titulo: 'Teste Direto',
    mensagem: 'Notificação inserida direto no banco',
    tipo: 'info'
  })
  .select()
  .single();

console.log('Resultado:', { data, error });

// Verificar se apareceu
const { data: notifs } = await supabase
  .from('notificacoes')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1);

console.log('Última notificação:', notifs);
```

---

### Teste 3: Testar Edge Function (sem esperar push)

```javascript
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
  body: {
    user_id: user.id,
    titulo: 'Teste Edge Function',
    mensagem: 'Testando só a função, não o push'
  }
});

console.log('Resultado:', { data, error });

// Se error for null, a função foi executada!
// Se data tiver "status": "ok", funcionou!
```

---

## 🎯 Diagnóstico Rápido

Execute este código no DevTools Console:

```javascript
async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO\n');

  // 1. Ambiente
  console.log('1️⃣ AMBIENTE');
  console.log('   Protocol:', window.location.protocol);
  console.log('   Host:', window.location.host);
  console.log('   Codespaces:', window.location.host.includes('github.dev'));
  console.log('');

  // 2. Autenticação
  console.log('2️⃣ AUTENTICAÇÃO');
  const { data: { user, session } } = await supabase.auth.getUser();
  console.log('   Autenticado:', !!user);
  console.log('   User ID:', user?.id);
  console.log('   Token:', session?.access_token ? 'Presente' : 'Ausente');
  console.log('');

  // 3. Service Worker
  console.log('3️⃣ SERVICE WORKER');
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('   Registrados:', registrations.length);
  registrations.forEach(reg => {
    console.log('   -', reg.active?.scriptURL || 'Inativo');
  });
  console.log('');

  // 4. Notificações
  console.log('4️⃣ NOTIFICAÇÕES');
  console.log('   Permissão:', Notification.permission);
  console.log('   API disponível:', 'Notification' in window);
  console.log('');

  // 5. Tokens FCM
  console.log('5️⃣ TOKENS FCM');
  const { data: tokens } = await supabase
    .from('notificacoes_tokens')
    .select('token')
    .eq('user_id', user?.id);
  console.log('   Tokens salvos:', tokens?.length || 0);
  console.log('');

  // 6. Teste da Edge Function
  console.log('6️⃣ TESTE EDGE FUNCTION');
  console.log('   Invocando...');
  const inicio = Date.now();

  const { data, error } = await supabase.functions.invoke('enviar_notificacao', {
    body: {
      user_id: user?.id,
      titulo: 'Diagnóstico',
      mensagem: 'Teste automático',
      tipo: 'info'
    }
  });

  const duracao = Date.now() - inicio;
  console.log('   Tempo:', duracao + 'ms');
  console.log('   Erro:', error ? error.message : 'Nenhum');
  console.log('   Data:', data);
  console.log('');

  // 7. Verificar no banco
  console.log('7️⃣ BANCO DE DADOS');
  const { data: ultimaNotif } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (ultimaNotif && ultimaNotif.length > 0) {
    console.log('   ✅ Última notificação:', ultimaNotif[0].titulo);
    console.log('   ⏰ Criada há:', Math.round((Date.now() - new Date(ultimaNotif[0].created_at).getTime()) / 1000) + 's');
  } else {
    console.log('   ❌ Nenhuma notificação encontrada');
  }

  console.log('\n✅ DIAGNÓSTICO COMPLETO');
}

diagnosticoCompleto();
```

---

## 💡 Soluções

### Se a Edge Function funciona mas o push não:

**É limitação do Codespaces!** Firebase push precisa de:
- HTTPS real (não proxy)
- Service Worker funcionando
- Permissão de notificações

**Solução:** Testar em ambiente real (não Codespaces)

### Se a Edge Function não funciona:

1. **Verificar console do browser** (F12) para erros
2. **Verificar Network tab** se a requisição POST está sendo enviada
3. **Verificar autenticação** (session válida)

---

## 🚀 Alternativa: Testar em Produção

Para testar notificações push REALMENTE funcionando:

1. **Deploy da aplicação** (Vercel, Netlify, etc)
2. **Acesse via domínio real** (não `.github.dev`)
3. **Teste as notificações** lá

---

## 📊 Checklist Codespaces

- [ ] CURL funciona? (já testado ✅)
- [ ] Edge Function responde? (testar)
- [ ] Notificação é salva no banco? (testar)
- [ ] Service Worker está registrado? (testar)
- [ ] Permissão de notificações concedida? (testar)
- [ ] Token FCM está salvo? (testar)

Se os 3 primeiros funcionam, o backend está OK!
Se os 3 últimos não funcionam, é limitação do Codespaces.

---

## 🎯 Execute o Diagnóstico

Cole o código do "Diagnóstico Completo" no console e me envie o resultado!
Isso vai mostrar exatamente onde está o bloqueio.