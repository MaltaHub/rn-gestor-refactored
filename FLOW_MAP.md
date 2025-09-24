# Fluxograma operacional do front-end

Arquitetura operacional sugerida (minimalista):
- `readClient.fetch(resource, params?, scope?)`: serviço único de leitura tipada. `scope` é opcional e anexa metadados como `loja` automaticamente a partir do `globalLojaAtual`.
- `writeClient.execute(action, payload, scope?)`: serviço único de escrita que aplica padrões de auditoria e envia mutações ao backend.
- `globalLojaAtual`: valor global definido após o login; atualizado instantaneamente por `LojaSwitch`, disponível para qualquer operação que requer contexto de loja.
- `LojaSwitch`: componente/switch presente nas telas que manipulam dados por loja (estoque > fotos, promoções, vitrine) e que ajusta o `scope.loja` quando acionado.
- Chamadas RPC específicas são destacadas quando relevantes (ex.: `readClient.fetch('rpc.empresa_do_usuario')`).

1. Landing `/`
   1.1 Usuário acessa a landing e visualiza hero com o posicionamento "ERP automotivo para concessionárias multi-loja", destacando que o produto centraliza operações e estoque (conteúdo dinâmico carregado via `readClient.fetch('marketing.hero')` quando disponível).
   1.2 CTA principal `Entrar no console` redireciona para 2 (Login), mantendo o foco em converter o visitante.
   1.3 Sessão de valor apresenta cards sobre o estoque único compartilhado entre lojas, orquestração comercial e visão unificada de anúncios/vitrine, reforçando o diferencial do ERP; dados reais, quando disponíveis, usam `readClient.fetch('marketing.diferenciais')`.
   1.4 Bloco de demonstração exibe prévias das interfaces (Dashboard, Estoque, Vitrine) acompanhadas de copy comercial; quaisquer CTAs secundários também levam ao login.
   1.5 Rodapé resume os benefícios e repete o botão `Começar agora`, novamente direcionando para 2.

2. Login `/login`
   2.1 Usuário preenche os campos obrigatórios `email` e `password`.
   2.2 Ação `Entrar` envia as credenciais para `writeClient.execute('auth.login', { email, password })`, que autentica o usuário, registra log e retorna o token de sessão.
   2.3 Link `Voltar para a landing page` retorna para 1.
   2.4 Middleware `resolveDestinoInicial` consulta o backend usando `readClient.fetch('rpc.empresa_do_usuario')` para identificar vínculos ativos:
       2.4.1 Se o usuário já possui empresa ou vínculo ativo, o middleware seta `globalLojaAtual`, inicializa o contexto e redireciona diretamente para 3.4 (Console central).
       2.4.2 Se não houver cadastro, o usuário segue para 2.5 (Lobby de onboarding).
   2.5 Lobby `/lobby`
       2.5.1 Botão `Criar empresa` aciona `writeClient.execute('empresas.criar', payload)` com os dados do formulário inicial.
       2.5.2 Card `Já tenho convite` solicita o token, valida via `readClient.fetch('convites.validarToken', { token })` e, ao submeter, chama `writeClient.execute('convites.aceitar', { token })`, que aciona `/api/convite?token=<token>`.
       2.5.3 Seções informativas explicam como funciona o convite e apontam atalhos para suporte ou documentação.

3. AppShell e módulos `/app`
   3.1 Qualquer rota `/app/*` carrega o layout `AppShell`, que utiliza `readClient.fetch('contexto.concessionaria')` para garantir o compartilhamento do estoque entre lojas.
   3.2 Sidebar lista `Visão geral` e os módulos operacionais (`Estoque`, `Anúncios`, `Vendas`, `Promoções`, `Vitrine`, `Configurações`, `Avisos`) com permissões obtidas em `readClient.fetch('permissoes.modulos')`.
   3.3 Topbar exibe o nome do módulo ativo, um indicador da `globalLojaAtual` e o ícone de perfil (sem texto) que leva para 3.10 (Perfil pessoal). Alterações via `LojaSwitch` disparam `writeClient.execute('usuarios.definirLojaAtual', { loja })` e atualizam o `globalLojaAtual`.

   3.4 Dashboard `/app`
       3.4.1 Cabeçalho destaca métricas consolidadas do estoque único, lojas ativas e performance comercial, carregadas através de `readClient.fetch('dashboard.metricas')` (sem necessidade de `scope.loja`).
        3.4.2 Cards de métricas exibem indicadores sem ações destrutivas; botões utilitários como `Atualizar painel` reexecutam `readClient.fetch('dashboard.metricas')`.
       3.4.3 Lista `Últimos veículos` consome `readClient.fetch('estoque.recentes')` e oferece atalho `Ver estoque` que navega para 3.5.
       3.4.4 Seção `Atalhos operacionais` apresenta links para Estoque, Anúncios, Vendas e Promoções, reforçando a continuidade da jornada.

   3.5 Gestão de estoque `/app/estoque`
       3.5.1 Cabeçalho concentra as ações de criação: botão `Novo veículo` abre o fluxo 3.12.1 que utiliza `writeClient.execute('estoque.criar', payload)`; `Importar planilha` permanece como placeholder para `writeClient.execute('estoque.importarLote', arquivo)`.
       3.5.2 Campo de busca executa consultas incrementais via `readClient.fetch('estoque.buscar', { termo, filtros })`, sem anexar `scope.loja` automaticamente (somente caso o usuário aplique filtro explícito).
       3.5.3 Botão `Ajustar filtros` abre filtros avançados (preço, quilometragem, cor, ano); os resultados usam `readClient.fetch('estoque.listar', filtrosSelecionados)`.
       3.5.4 Controle `Visualização` alterna entre `Tabela`, `Cards horizontais` (sem capa) e `Cards horizontais com capa`, apenas mudando a renderização local.
       3.5.5 Cada veículo apresenta ações de `Detalhar` (transição para 3.12.1 via `router.push`) além de `Duplicar` (`writeClient.execute('estoque.duplicar', { idVeiculo })`) e `Arquivar` (`writeClient.execute('estoque.arquivar', { idVeiculo })`).

   3.6 Gestão de anúncios `/app/anuncios`
       3.6.1 Página carrega o estoque agrupado por plataforma usando `readClient.fetch('anuncios.listarPorPlataforma', filtros, { loja: globalLojaAtual })`, garantindo que cada consulta respeite a loja vigente.
       3.6.2 Filtros permitem selecionar plataformas, status de publicação e loja responsável; sempre que `LojaSwitch` muda, o `scope.loja` é atualizado.
       3.6.3 Para cada veículo/plataforma, ações `Adicionar anúncio`, `Editar anúncio` e `Remover anúncio` mapeiam respectivamente para `writeClient.execute('anuncios.publicar', payload, { loja: globalLojaAtual })`, `writeClient.execute('anuncios.atualizar', payload, { loja: globalLojaAtual })` e `writeClient.execute('anuncios.remover', payload, { loja: globalLojaAtual })`.
       3.6.4 Card `Upload massivo` permanece como placeholder para `writeClient.execute('anuncios.syncLote', arquivo, { loja: globalLojaAtual })`.

   3.7 Gestão de vendas `/app/vendas`
       3.7.1 Painel resume insights de vendas (volume, ticket médio, desempenho por loja) com filtros por período, loja, vendedor e status, alimentados por `readClient.fetch('vendas.insights', filtros)`. O `scope.loja` só é aplicado quando a loja é explicitamente filtrada.
       3.7.2 Botão `Fazer nova venda` inicia o fluxo 3.12.3, que persiste os dados via `writeClient.execute('vendas.registrar', payload, { loja: globalLojaAtual })`.
       3.7.3 Lista principal exibe as últimas vendas concluídas consumindo `readClient.fetch('vendas.recentes', filtros)` e permitindo abrir/editar cada registro.
       3.7.4 Cards de acompanhamento exibem pipeline e performance recalculados com `readClient.fetch('vendas.pipeline', filtros)`.
       3.7.5 Seção `Análises` oferece gráficos ou destaques baseados em `readClient.fetch('vendas.analisesComparativas', filtros)`.

   3.8 Campanhas e promoções `/app/promocoes`
       3.8.1 Tabela apresenta os veículos do estoque único com os preços praticados em cada loja usando `readClient.fetch('promocoes.tabelaPrecos', filtros, { loja: globalLojaAtualViaSwitch })`. Nesta tela o `LojaSwitch` controla explicitamente o `scope.loja`.
       3.8.2 Ações `Aplicar ajuste`, `Editar` e `Reverter` executam `writeClient.execute('promocoes.aplicarAjuste', payload, { loja: lojaDoSwitch })`, `writeClient.execute('promocoes.atualizar', payload, { loja: lojaDoSwitch })` e `writeClient.execute('promocoes.reverter', payload, { loja: lojaDoSwitch })`.
       3.8.3 Cards informativos sinalizam campanhas ativas e futuras via `readClient.fetch('promocoes.campanhas', filtros, { loja: lojaDoSwitch })`.

   3.9 Vitrine `/app/vitrine`
       3.9.1 Listagem exibe apenas os veículos da `globalLojaAtual`, consultando `readClient.fetch('vitrine.listar', filtros, { loja: globalLojaAtual })`.
       3.9.2 Cards com capa mostram informações essenciais vindas de `readClient.fetch('vitrine.resumo', { veiculoId }, { loja: globalLojaAtual })`.
       3.9.3 Ao ativar o modo `Editar vitrine`, cada card ganha ações para `Remover da loja` (`writeClient.execute('vitrine.removerVeiculo', { veiculoId }, { loja: globalLojaAtual })`), enquanto veículos fora da loja aparecem com transparência graças a `readClient.fetch('vitrine.disponiveis', filtros, { loja: globalLojaAtual })`, oferecendo o botão `Adicionar à loja` (`writeClient.execute('vitrine.adicionarVeiculo', { veiculoId }, { loja: globalLojaAtual })`).
       3.9.4 Painel lateral indica o relacionamento com outras lojas e reforça que as alterações respeitam o estoque único, consumindo `readClient.fetch('vitrine.relacionamentos', {}, { loja: globalLojaAtual })`.
       3.9.5 Ação `Visualizar detalhes` abre 3.12.4, abastecida por `readClient.fetch('vitrine.detalhes', { veiculoId }, { loja: globalLojaAtual })`.

   3.10 Perfil pessoal `/app/perfil`
       3.10.1 Cabeçalho mantém ações `Reverter` (reset local) e `Salvar alterações` (`writeClient.execute('usuarios.atualizarPerfil', payload)`).
       3.10.2 Widget `LojaAtual` consome `readClient.fetch('usuarios.lojasDisponiveis')` e persiste a seleção via `writeClient.execute('usuarios.definirLojaAtual', { loja })`, atualizando o `globalLojaAtual`.
       3.10.3 Seção `Dados básicos` usa `readClient.fetch('usuarios.perfil')` e `writeClient.execute('usuarios.atualizarCampos', payload)` conforme necessário.
       3.10.4 Seção `Preferências rápidas` alterna flags com `writeClient.execute('usuarios.atualizarPreferencias', payload)` após carregar dados via `readClient.fetch('usuarios.preferencias')`.
       3.10.5 Seção `Segurança e auditoria` mantém os placeholders de `Alterar senha` e `Ativar MFA`, planejados para `writeClient.execute('usuarios.alterarSenha', payload)` e `writeClient.execute('usuarios.ativarMFA', payload)`.

   3.11 Cadastros operacionais `/app/configuracoes`
       3.11.1 Barra de abas define contextos carregados com `readClient.fetch('cadastros.contextos')` para `stores`, `characteristics`, `platforms`, `locations`, `models`.
       3.11.2 Abas simples usam `SimpleManager` que aciona `readClient.fetch('cadastros.listar', { tipo })` para popular os dados e `writeClient.execute('cadastros.salvar', payload)` / `writeClient.execute('cadastros.excluir', payload)` para mutações.
       3.11.3 Aba `Modelos` utiliza formulário completo com `readClient.fetch('modelos.detalhes', { id })` e ações `writeClient.execute('modelos.criar', payload)`, `writeClient.execute('modelos.atualizar', payload)`, `writeClient.execute('modelos.remover', payload)`.
       3.11.4 Trocar de aba fora de `Modelos` reseta o formulário para evitar estados inconsistentes (operação local).

   3.12 Ferramentas dedicadas
       3.12.1 Edição de veículo `/app/estoque/:id` carrega dados via `readClient.fetch('estoque.detalhes', { id })`. Na seção de fotos, o `LojaSwitch` define `scope.loja`; cada alteração executa `writeClient.execute('estoque.atualizar', payload)` ou `writeClient.execute('estoque.gerenciarMidia', payload, { loja: lojaDoSwitch })`.
       3.12.2 Edição de anúncio `/app/anuncios/:vehicleId/:platform` usa `readClient.fetch('anuncios.detalhes', { vehicleId, platform }, { loja: globalLojaAtual })` e salva alterações com `writeClient.execute('anuncios.atualizar', payload, { loja: globalLojaAtual })`.
       3.12.3 Edição de venda `/app/vendas/:id` consulta `readClient.fetch('vendas.detalhes', { id })` e permite ajustes via `writeClient.execute('vendas.atualizar', payload, { loja: globalLojaAtual })`.
       3.12.4 Visualização da vitrine `/app/vitrine/:vehicleId` mostra detalhes carregados por `readClient.fetch('vitrine.detalhes', { vehicleId }, { loja: globalLojaAtual })` com contexto de promoções.
       3.12.5 Avisos `/app/avisos` agrega dados de `readClient.fetch('avisos.pendencias')` (sem fotos, sem anúncios, anúncios desatualizados) e apresenta atalhos que disparam os fluxos de correção correspondentes.

4. Fluxos cruzados
   4.1 Navegação global ocorre pela sidebar (3.2), atalhos do Dashboard (3.4.3) e redirecionamentos pós-login (2.4), sempre respeitando a necessidade de autenticação.
   4.2 `globalLojaAtual` influencia automaticamente as operações de leitura e escrita em Anúncios (3.6), Vendas (3.7 apenas para writes), Promoções (3.8), Vitrine (3.9) e ferramentas dedicadas correspondentes, enquanto o `LojaSwitch` pode sobrepor o `scope.loja` em telas que gerenciam dados multi-loja.
   4.3 A transição Estoque → Edição de veículo (3.5.5 → 3.12.1) preserva o contexto do veículo; demais atalhos seguem o mesmo padrão, mantendo consistência entre consultas e mutações.
   4.4 Todas as ações críticas partem do estoque único compartilhado, evitando duplicidade entre lojas. Os serviços reutilizam as mesmas estruturas de dados e logs instrumentados com `console.info` indicam pontos de integração futura.
