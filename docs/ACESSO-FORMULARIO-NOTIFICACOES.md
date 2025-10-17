# Como Acessar o Formulário de Notificações

## 📍 Localização

### Opção 1: Via URL Direta
```
/admin/notificacoes
```

### Opção 2: Via Interface
1. Faça login no sistema
2. Clique em **"Notificações"** no menu lateral (ícone de sino 🔔)
3. Na página de notificações, clique no link **"Enviar Notificação"** no topo

## 🔐 Requisitos de Acesso

### Permissão Necessária
- ✅ Usuário deve estar **autenticado**
- ✅ Usuário deve ter papel de **Proprietário**

### Se não for Proprietário
Você verá a mensagem:
> "Acesso Negado - Apenas proprietários podem enviar notificações"

## 🎯 Funcionalidades do Formulário

### 1. Tipo de Notificação
Escolha entre 4 tipos:
- 🔵 **Info** - Informações gerais
- 🟢 **Sucesso** - Operações bem-sucedidas
- 🟡 **Aviso** - Avisos importantes
- 🔴 **Erro** - Erros e falhas

### 2. Destinatário
Duas opções:
- **Todos da Empresa** - Envia para todos os membros ativos
- **Usuário Específico** - Envia para um usuário pelo UUID

### 3. Campos do Formulário
- **Título*** (obrigatório)
- **Mensagem*** (obrigatória)
- **User ID** (se destinatário específico)

## 🚀 Como Usar

### Enviar para Todos
1. Selecione o **tipo** da notificação
2. Escolha **"Todos da Empresa"**
3. Digite o **título**
4. Digite a **mensagem**
5. Clique em **"Enviar Notificação"**

### Enviar para Usuário Específico
1. Selecione o **tipo** da notificação
2. Escolha **"Usuário Específico"**
3. Cole o **UUID do usuário**
4. Digite o **título**
5. Digite a **mensagem**
6. Clique em **"Enviar Notificação"**

## 📊 Feedback

Após enviar, você verá um toast com:
- ✅ **Sucesso**: "Notificação enviada para X usuários"
- ❌ **Erro**: Mensagem de erro específica

## 🔍 Como Obter o UUID de um Usuário

### Método 1: Via Banco de Dados
```sql
SELECT id, email FROM auth.users WHERE email = 'usuario@email.com';
```

### Método 2: Via Console do Navegador
```javascript
// No console do navegador (DevTools)
const { data } = await supabase.auth.getUser();
console.log(data.user.id); // UUID do usuário logado
```

### Método 3: Via Supabase Dashboard
1. Supabase Dashboard → Authentication → Users
2. Clique no usuário desejado
3. Copie o UUID

## 🐛 Troubleshooting

### Não vejo o formulário
- Verifique se você é **Proprietário** da empresa
- Tente acessar diretamente: `/admin/notificacoes`

### Erro ao enviar
1. Verifique se o Firebase está configurado
2. Veja o console do navegador (F12) para erros
3. Verifique os logs da Edge Function no Supabase Dashboard

### Nenhuma notificação chega
1. Verifique se o usuário tem token FCM salvo
2. Consulte: `SELECT * FROM notificacoes_tokens WHERE user_id = 'uuid';`
3. Verifique se Firebase Service Account está configurado

## 📱 Links Relacionados

- **Ver Notificações**: `/notificacoes`
- **Enviar Notificações**: `/admin/notificacoes`
- **Admin Dashboard**: `/admin`

## ✅ Status Atual

- ✅ Formulário implementado
- ✅ Validações funcionando
- ✅ Bug do nome da função corrigido
- ✅ Build compilando sem erros
- ❌ **Falta**: Configurar Firebase Service Account para enviar push

---

**Última atualização**: 2025-10-16