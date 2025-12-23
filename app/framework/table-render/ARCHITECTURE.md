/**
 * ESTRUTURA DO TABLE RENDER FRAMEWORK
 * 
 * Reorganizada para melhor manutenção e compreensão
 * Com funcionalidades padrão (Filtro, Reordenação, Ordenação) integradas
 */

// ============================================================================
// CAMADA 1: DEFINIÇÕES E CONFIGURAÇÕES
// ============================================================================

app/framework/table-render/
├── types.ts                    // Interfaces e tipos principais
│   ├── TableColumn            // Configuração de coluna
│   ├── TableRow              // Linha de dados
│   ├── TableFilter           // Filtro aplicado
│   ├── TableSort             // Ordenação aplicada
│   ├── TableSnapshot         // Estado salvo
│   ├── TableHistoryEntry     // Registro de mudanças
│   ├── TableConfig           // Configuração inicial
│   └── ITable                // Interface pública
│
├── defaults.ts                // ⭐ NOVO: Configurações padrão
│   ├── DEFAULT_COLUMN_CONFIG  // { isFilterable: true, isSortable: true, ... }
│   ├── DEFAULT_TABLE_STATE    // Estado inicial
│   ├── FILTER_OPERATORS       // Operadores disponíveis
│   ├── DATA_TYPES             // Tipos de dados
│   └── applyColumnDefaults()  // Aplica defaults a colunas


// ============================================================================
// CAMADA 2: ESTADO E ARMAZENAMENTO
// ============================================================================

├── stores.ts                  // Zustand stores (estado reativo)
│   ├── createDataStore()      // Gerencia linhas e colunas
│   ├── createFilterStore()    // Gerencia filtros aplicados
│   ├── createSortStore()      // Gerencia ordenações
│   ├── createHistoryStore()   // Gerencia histórico
│   ├── createSnapshotStore()  // Gerencia snapshots
│   └── createDynamicColumnStore()  // Cache de expressões


// ============================================================================
// CAMADA 3: LÓGICA PRINCIPAL
// ============================================================================

├── Table.ts                   // ⭐ CLASSE PRINCIPAL
│   │
│   └── Métodos PADRÃO (sempre disponíveis):
│       ├── setColumnOrder()      ✓ Reordena colunas
│       ├── applyFilter()         ✓ Aplica filtro
│       ├── clearFilter()         ✓ Remove filtro
│       └── applySort()           ✓ Ordena linhas
│   │
│   ├── Métodos de CRUD:
│   │   ├── create()
│   │   ├── update()
│   │   └── delete()
│   │
│   ├── Métodos de Colunas:
│   │   ├── addDynamicColumn()
│   │   ├── updateColumn()
│   │   ├── deleteColumn()
│   │   └── renameColumn()
│   │
│   ├── Métodos de Dados:
│   │   ├── getRows()
│   │   ├── getColumns()
│   │   ├── getValue()
│   │   └── getVisibleRows()
│   │
│   └── Métodos de Persistência:
│       ├── createSnapshot()
│       ├── restoreSnapshot()
│       ├── getHistory()
│       └── getSnapshots()
│
├── expression-engine.ts       // Motor de expressões para colunas dinâmicas
│   ├── compile()             // Compila expressão em função
│   ├── validate()            // Valida expressão
│   └── compute()             // Calcula valor
│
├── registry.ts                // Registro global de tabelas
│   ├── registerTable()
│   ├── getTable()
│   ├── removeTable()
│   └── tableRegistry


// ============================================================================
// CAMADA 4: RENDERIZACAO
// ============================================================================

├── render/                    // Camada de renderizacao e configuracao
│   ├── config.ts              // Defaults, labels e permissoes
│   ├── types.ts               // Tipos de renderizacao
│   ├── RenderTable.tsx        // Componente oficial de renderizacao
│   └── line-list/             // Renderizador padrao (LineList)
│       ├── components/        // UI (HeaderRow, DataRows, menus)
│       ├── hooks/             // useLineListState
│       └── stores/            // Zustand stores dedicadas

// ============================================================================
// CAMADA 5: INTEGRAÇÃO REACT
// ============================================================================

├── useTableFramework.ts       // Hooks React
│   ├── useTable()             // Hook principal - Retorna API da tabela
│   └── useTableManager()      // Hook para gerenciar multiplas tabelas
│
└── index.ts                   // Exports publicos (API do framework)
    ├── Table
    ├── useTable
    ├── RenderTable
    ├── DEFAULT_COLUMN_CONFIG
    ├── applyColumnDefaults
    ├── FILTER_OPERATORS
    └── DATA_TYPES


// ============================================================================
// FLUXO DE DADOS
// ============================================================================

┌─────────────────────────────────────────────────────────────────┐
│ Componente React (RenderTable, TableRenderDemo, etc)           │
└────────────────────┬────────────────────────────────────────────┘
                     │ cria instância
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ new Table(config)                                               │
│ ├─ Aplica applyColumnDefaults() a cada coluna                  │
│ ├─ Garante isFilterable: true ✓                                │
│ ├─ Garante isSortable: true ✓                                  │
│ └─ Garante reordenação habilitada ✓                            │
└────────────────────┬────────────────────────────────────────────┘
                     │ usa
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ useTable(table)                                                 │
│ Retorna: {                                                      │
│   rows: [],              // Todas as linhas                     │
│   visibleRows: [],       // Após filtros/ordenação             │
│   columns: [],           // Com defaults aplicados              │
│   filters: [],           // Filtros ativos                      │
│   sorts: [],             // Ordenações ativas                   │
│                                                                  │
│   // Métodos PADRÃO:                                            │
│   applyFilter(),         // ✓ Sempre disponível                │
│   clearFilter(),         // ✓ Sempre disponível                │
│   applySort(),           // ✓ Sempre disponível                │
│   setColumnOrder(),      // ✓ Sempre disponível                │
│                                                                  │
│   // Outros métodos:                                            │
│   create(), update(), delete(),                                │
│   getValue(), getFilters(), getSorts()                         │
│ }                                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │ dispara
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Store (Zustand)                                                 │
│ ├─ dataStore: { rows, columns }                                │
│ ├─ filterStore: { filters }                                    │
│ ├─ sortStore: { sorts }                                        │
│ ├─ historyStore: { entries }                                   │
│ ├─ snapshotStore: { snapshots }                                │
│ └─ dynamicColumnStore: { compiledExpressions }                │
└────────────────────┬────────────────────────────────────────────┘
                     │ mantém
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Estado Reativo                                                  │
│ Quando muda → dispara listeners → component re-render          │
└─────────────────────────────────────────────────────────────────┘


// ============================================================================
// EXEMPLO DE USO
// ============================================================================

import { Table, useTable, applyColumnDefaults } from '@/app/framework/table-render';

// 1. Criar tabela (defaults aplicados automaticamente)
const table = new Table({
  name: 'Produtos',
  realEscope: true,
  rows: [...],
  columns: [
    {
      id: 'nome',
      dataSource: 'nome',
      dataType: 'string',
      isDynamic: false,
      order: 0,
      // ← Defaults aplicados aqui no construtor:
      // isFilterable: true ✓
      // isSortable: true ✓
      // isHidden: false ✓
      // isReadOnly: false ✓
    },
  ],
});

// 2. Usar no componente
function ProductTable() {
  const api = useTable(table);

  // 3. Usar funcionalidades PADRÃO
  return (
    <>
      {/* FILTRO - Sempre habilitado */}
      <button onClick={() => api.applyFilter({
        id: 'f1',
        columnId: 'nome',
        operator: 'contains',
        value: 'A'
      })}>
        Filtrar
      </button>

      {/* ORDENAÇÃO - Sempre habilitada */}
      <button onClick={() => api.applySort([
        { columnId: 'nome', direction: 'asc' }
      ])}>
        Ordenar A-Z
      </button>

      {/* REORDENAÇÃO - Sempre habilitada */}
      <button onClick={() => api.setColumnOrder(['nome', 'preco'])}>
        Reorganizar
      </button>

      {/* Renderizar com dados atualizados */}
      {api.visibleRows.map(row => (
        <div key={row.id}>
          {api.getValue(row.id, 'nome')}
        </div>
      ))}
    </>
  );
}


// ============================================================================
// BENEFÍCIOS DA REORGANIZAÇÃO
// ============================================================================

✅ CLAREZA
   • defaults.ts centraliza todas as configurações padrão
   • Nomes explícitos indicam responsabilidade de cada arquivo
   • Documentação inline descreve funcionalidades padrão

✅ MANUTENIBILIDADE
   • Mudar default de isFilterable? Mude em defaults.ts
   • Novos operadores? Adicione em FILTER_OPERATORS
   • Novas propriedades? Adicione em DEFAULT_COLUMN_CONFIG

✅ FUNCIONALIDADES PADRÃO GARANTIDAS
   • applyColumnDefaults() garante que nenhuma coluna seja criada sem os defaults
   • Construtor Table.ts aplica automaticamente
   • Não há forma de criar coluna sem filtro/ordenação/reordenação

✅ REUTILIZAÇÃO
   • applyColumnDefaults() pode ser usado fora do Table
   • FILTER_OPERATORS e DATA_TYPES disponíveis para UI
   • DEFAULT_TABLE_STATE define configurações iniciais

✅ EXTENSIBILIDADE
   • Adicione novos defaults sem quebrar código existente
   • Helpers em defaults.ts podem ser expandidos
   • Estrutura clara para novos tipos de operadores


// ============================================================================
// PRÓXIMAS OTIMIZAÇÕES POSSÍVEIS
// ============================================================================

1. cache.ts - Caching estratégico de resultados filtrados/ordenados
2. validation.ts - Validadores centralizados por dataType
3. formatters.ts - Formatadores de valores por dataType
4. middleware.ts - Middleware para logs, analytics, etc
5. plugins.ts - Sistema de plugins para estender funcionalidades
