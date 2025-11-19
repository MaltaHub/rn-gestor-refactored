#!/bin/bash

# Script para visualizar a estrutura do Table Render
# Mostra arquivos criados e sua finalidade

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════════╗
║                    TABLE RENDER - ESTRUTURA COMPLETA                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📁 app/framework/table-render/
│
├── 📄 types.ts                          [1.200+ linhas]
│   └─ Define todas as interfaces TypeScript
│      ├─ TableColumn       - Coluna real ou dinâmica
│      ├─ TableRow         - Linha de dados
│      ├─ TableFilter      - Filtro aplicável
│      ├─ TableSort        - Ordenação
│      ├─ TableSnapshot    - Snapshot de estado
│      ├─ TableHistoryEntry - Entrada de histórico
│      ├─ TableConfig      - Configuração de tabela
│      ├─ TableCallbacks   - Callbacks para operações CRUD
│      ├─ ColumnValidation - Regras de validação
│      ├─ CompiledExpression - Expressão compilada
│      └─ ExpressionContext - Contexto de execução
│
├── 📄 registry.ts                       [200+ linhas]
│   └─ Singleton Registry centralizado
│      ├─ register(table, customId?)    - Registrar nova tabela
│      ├─ get(id)                       - Buscar por ID
│      ├─ getByName(name)               - Buscar por nome
│      ├─ getAll()                      - Todas as tabelas
│      ├─ getAllReal()                  - Apenas reais
│      ├─ getAllImaginary()             - Apenas imaginárias
│      ├─ remove(id)                    - Remover tabela
│      ├─ getStats()                    - Estatísticas
│      └─ export()                      - Exportar estado
│
├── 📄 expression-engine.ts              [400+ linhas]
│   └─ Parser e compilador de expressões
│      ├─ tokenize(expr)                - Tokenizar entrada
│      ├─ parse(expr)                   - Parse em AST
│      ├─ compile(expr)                 - Compilar em função
│      ├─ extractReferences()           - Extrair dependências
│      └─ evaluate(ast, row, tables)    - Executar expressão
│
│   Suporta:
│   ├─ Aritmética:  +  -  *  /  %
│   ├─ Comparações: == != < > <= >=
│   ├─ Lógica:      && ||
│   ├─ Ternária:    condition ? true : false
│   ├─ Referências: columnName
│   └─ Lookups:     ref.tableId.columnName
│
├── 📄 stores.ts                         [300+ linhas]
│   └─ Factories para stores Zustand
│      ├─ createDataStore()             - Dados e colunas
│      ├─ createFilterStore()           - Filtros
│      ├─ createSortStore()             - Ordenação
│      ├─ createHistoryStore()          - Histórico
│      ├─ createSnapshotStore()         - Snapshots
│      └─ createDynamicColumnStore()    - Cache de expressões
│
├── 📄 Table.ts                          [800+ linhas]
│   └─ Classe principal de instância de tabela
│      ├─ Propriedades:
│      │  ├─ id: string
│      │  ├─ name: string
│      │  ├─ realEscope: boolean
│      │  ├─ description: string
│      │  └─ allowDynamicColumns: boolean
│      │
│      ├─ Leitura de dados:
│      │  ├─ getRows()                  - Todas as linhas
│      │  ├─ getColumns()               - Todas as colunas
│      │  ├─ getSnapshots()             - Snapshots salvos
│      │  ├─ getHistory()               - Histórico de mudanças
│      │  └─ getValue(rowId, columnId)  - Valor (com dinâmicas)
│      │
│      ├─ CRUD (apenas realEscope: true):
│      │  ├─ create(row)                - Nova linha
│      │  ├─ update(rowId, changes)     - Atualizar linha
│      │  └─ delete(rowId)              - Deletar linha
│      │
│      ├─ Colunas:
│      │  ├─ addDynamicColumn(col)      - Adicionar dinâmica
│      │  ├─ updateColumn(id, updates)  - Atualizar coluna
│      │  ├─ deleteColumn(id)           - Deletar coluna
│      │  └─ renameColumn(id, alias)    - Renomear
│      │
│      ├─ Filtros e Ordenação:
│      │  ├─ applyFilter(filter)        - Aplicar filtro
│      │  ├─ clearFilter(filterId?)     - Remover filtro
│      │  ├─ applySort(sorts)           - Aplicar ordenação
│      │  └─ computeDynamicColumns()    - Calcular dinâmicas
│      │
│      ├─ Snapshots:
│      │  ├─ createSnapshot()           - Snapshot atual
│      │  ├─ restoreSnapshot(snapshot)  - Restaurar
│      │  ├─ getSnapshot()              - Snapshot para sync
│      │  └─ hydrate(snapshot)          - Carregar snapshot
│      │
│      └─ Utilitários:
│         ├─ destroy()                  - Limpar recursos
│         └─ validateRow(row)           - Validar dados
│
├── 📄 useTableFramework.ts              [200+ linhas]
│   └─ Hooks e adaptadores React
│      ├─ useTable(table)               - Hook principal
│      │  └─ Retorna: rows, columns, create, update, delete,
│      │            applyFilter, getValue, createSnapshot, ...
│      │
│      ├─ useTableManager()             - Gerenciar múltiplas
│      │  └─ addTable, getTable, removeTable, getTables
│      │
│      ├─ tableToLineListProps(table)   - Converter formato
│      └─ createRenderableTable(table)  - Factory renderizável
│
├── 📄 index.ts                          [60+ linhas]
│   └─ Exportações públicas da API
│      ├─ Tipos (TableColumn, TableRow, etc)
│      ├─ Classes (Table)
│      ├─ Registry (tableRegistry, registerTable, etc)
│      ├─ Engine (expressionEngine)
│      ├─ Stores (createDataStore, etc)
│      └─ Hooks (useTable, useTableManager, etc)
│
├── 📄 GUIDE.md                          [500+ linhas]
│   └─ Guia completo de uso
│      ├─ Conceitos fundamentais
│      ├─ Criação de tabelas
│      ├─ Operações básicas
│      ├─ Registry centralizado
│      ├─ Filtros e ordenação
│      ├─ Snapshots e histórico
│      ├─ Validações
│      ├─ Integração com React
│      └─ Exemplo completo
│
└── 📁 Não está aqui mas será criado:
    app/components/
   └── TableRenderDemo.tsx              [500+ linhas]
        └─ Demonstração prática
           ├─ Tabela real de produtos
           ├─ Tabela real de preços
           ├─ Tabela imaginária (estatísticas)
           ├─ CRUD em tempo real
           ├─ Colunas dinâmicas
           ├─ Snapshots
           └─ Log de operações

═══════════════════════════════════════════════════════════════════════════════

📊 RESUMO ESTATÍSTICO

Total de linhas de código:  ~4.000+ linhas
Arquivos principais:         8 arquivos
Tipos/Interfaces:            15+ interfaces
Classes:                      1 classe principal (Table)
Stores Zustand:              6 stores especializadas
Hooks React:                 3 hooks
Métodos da Table:            20+ métodos públicos

═══════════════════════════════════════════════════════════════════════════════

🎯 FUNCIONALIDADES PRINCIPAIS

✅ TABELAS REAIS (realEscope: true)
   • Create, Update, Delete com callbacks
   • Operações em banco de dados
   • Histórico rastreado
   • Validação de dados

✅ TABELAS IMAGINÁRIAS (realEscope: false)
   • Apenas leitura e análise
   • Colunas dinâmicas com expressões
   • Sem acesso a CRUD
   • Referências a outras tabelas

✅ COLUNAS DINÂMICAS
   • Expressões tipo Excel
   • Cache automático
   • Suporte a lookups entre tabelas
   • Ternárias e operadores lógicos

✅ REGISTRY CENTRALIZADO
   • ID único automático ou manual
   • Busca por ID ou nome
   • Validação de conflitos
   • Estatísticas

✅ SNAPSHOTS E HISTÓRICO
   • Salvar estado completo
   • Restaurar ponto anterior
   • Rastrear todas as mudanças
   • Hash para detectar conflitos

✅ VALIDAÇÕES
   • Regras por coluna
   • Validadores customizados
   • Checagem automática em CRUD
   • Mensagens de erro customizadas

✅ INTEGRAÇÃO REACT
   • Hook useTable() para reatividade
   • Adaptor para line-list existente
   • Sem necessidade de renderização
   • Uso em lógica pura

═══════════════════════════════════════════════════════════════════════════════

🔗 FLUXO DE DADOS

1. Criar Table
   └─ new Table(config)

2. Registrar no Registry
   └─ tableRegistry.register(table, id)

3. Usar em React
   ├─ const table = useTable(tableInstance)
   └─ Retorna: rows, columns, create, update, delete, ...

4. Operações
   ├─ CRUD (realEscope: true)
   │  └─ create → validar → callback → histórico → snapshot
   ├─ Filtros
   │  └─ applyFilter → recalcular visíveis → cache dinâmicas
   └─ Colunas dinâmicas
      └─ compile → cache → execute na renderização

5. Snapshots
   └─ createSnapshot → store → restaurar quando necessário

═══════════════════════════════════════════════════════════════════════════════

🚀 PRÓXIMOS PASSOS

1. Integrar com line-list existente
2. Criar UI para colunas dinâmicas (cor alaranjada)
3. Adaptar LineListShowcase para usar useTable()
4. Adicionar suporte a multi-select de linhas
5. Implementar busca avançada com filtros complexos
6. Export de dados (CSV, Excel, PDF)
7. Undo/Redo com histórico
8. Sincronização em real-time (WebSocket)

═══════════════════════════════════════════════════════════════════════════════

EOF
