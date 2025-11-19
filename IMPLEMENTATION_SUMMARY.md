# Table Render - Resumo da Implementação

## ✅ Arquitetura Implementada

### 1. **Tipos e Interfaces** (`types.ts`)
- `TableColumn` - Colunas reais e dinâmicas com suporte a expressões
- `TableRow` - Linhas de dados com ID único obrigatório
- `TableFilter` & `TableSort` - Filtros e ordenação
- `TableSnapshot` & `TableHistoryEntry` - Snapshots e histórico
- `TableConfig` & `ITable` - Configuração e interface pública

### 2. **Registry Centralizado** (`registry.ts`)
- `TableRegistry` - Singleton que armazena todas as tabelas
- Registro com ID único automático ou manual
- Validação de conflitos de ID e nome
- Métodos: `register()`, `get()`, `getByName()`, `getAll()`, `remove()`
- Separação entre tabelas reais e imaginárias

### 3. **Motor de Expressões** (`expression-engine.ts`)
- `ExpressionEngine` - Parser e compilador de expressões
- Suporte a:
  - Aritmética: `+`, `-`, `*`, `/`, `%`
  - Comparações: `==`, `!=`, `<`, `>`, `<=`, `>=`
  - Lógica: `&&`, `||`
  - Ternária: `condition ? true : false`
  - Referências: `columnName` ou `ref.tableId.columnName`
- Cache de expressões compiladas para performance
- Extração automática de dependências

### 4. **Stores Zustand** (`stores.ts`)
- `DataStore` - Gerencia linhas e colunas
- `FilterStore` - Gerencia filtros aplicados
- `SortStore` - Gerencia ordenação
- `HistoryStore` - Rastreia mudanças
- `SnapshotStore` - Armazena snapshots
- `DynamicColumnStore` - Cache de expressões compiladas

### 5. **Classe Table** (`Table.ts`)
- Instância de tabela com estado completo
- CRUD: `create()`, `update()`, `delete()` (apenas realEscope: true)
- Colunas: `addDynamicColumn()`, `updateColumn()`, `deleteColumn()`, `renameColumn()`
- Filtros: `applyFilter()`, `clearFilter()`
- Ordenação: `applySort()`
- Snapshots: `createSnapshot()`, `restoreSnapshot()`, `hydrate()`
- Validação de dados com regras customizáveis
- Computação de colunas dinâmicas com cache

### 6. **Hooks e Integração** (`useTableFramework.ts`)
- `useTable()` - Hook para consumir tabela em React
- `useTableManager()` - Gerenciar múltiplas tabelas
- `tableToLineListProps()` - Converter para formato do line-list
- `createRenderableTable()` - Factory para tabelas renderizáveis

### 7. **Índice Público** (`index.ts`)
- Exporta toda API: Types, Classes, Registry, Hooks
- Re-exports convenientes: `Column`, `Row`, `Config`

### 8. **Demonstração Prática** (`TableRenderDemo.tsx`)
- Exemplo completo com tabelas reais e imaginárias
- CRUD em tempo real
- Colunas dinâmicas funcionais
- Snapshots
- Log de operações

## 🎯 Conceitos Implementados

### Tabelas Reais (`realEscope: true`)
```typescript
// Permitem CRUD com callbacks
const products = new Table({
  realEscope: true,
  callbacks: {
    onCreate: async (row) => { /* salvar no BD */ },
    onUpdate: async (id, changes) => { /* atualizar no BD */ },
    onDelete: async (id) => { /* deletar do BD */ }
  }
});

// Usar:
const id = await products.create({ name: 'Novo' });
await products.update(id, { price: 100 });
await products.delete(id);
```

### Tabelas Imaginárias (`realEscope: false`)
```typescript
// Sem CRUD, apenas análise com colunas dinâmicas
const statistics = new Table({
  realEscope: false,
  columns: [
    {
      id: 'total',
      isDynamic: true,
      expression: 'quantity * price',  // Tipo Excel
      alias: '📊 Total'
    }
  ]
});

// Tentar CRUD:
await statistics.create(...);  // ❌ Error!
```

### Colunas Dinâmicas
```typescript
// Expressões que calculam valores
{
  id: 'margin',
  isDynamic: true,
  expression: '(preco_venda - preco_minimo) / preco_minimo * 100',
  alias: '📊 Margem (%)',
  isReadOnly: true  // Não pode editar colunas dinâmicas
}

// Ou com lookup de outra tabela:
{
  id: 'min_price',
  isDynamic: true,
  expression: 'ref.prices_table.minimum_price',  // PROCV
  alias: '📊 Preço Mínimo'
}
```

### Registry Centralizado
```typescript
// Registrar tabelas com ID único
tableRegistry.register(products, 'products_real');
tableRegistry.register(statistics, 'statistics_imaginary');

// Buscar:
const table = tableRegistry.get('products_real');
const stats = tableRegistry.getStats();  // 5 tabelas (3 reais, 2 imaginárias)
```

### Snapshots e Histórico
```typescript
// Criar snapshot
const snapshot = table.createSnapshot();  // Salva estado completo

// Restaurar:
table.restoreSnapshot(snapshot);

// Histórico:
const history = table.getHistory();
// [{operation: 'create', rowId: '...', timestamp: ..., ...}, ...]
```

### Validações
```typescript
// Definir validações
validations: {
  price: {
    required: true,
    min: 0,
    max: 100000,
    pattern: /^\d+(\.\d{2})?$/
  }
}

// Checadas automaticamente em create() e update()
await table.create({ price: -10 });  // ❌ Error!
```

## 📊 Arquivos Criados

```
app/framework/table-render/
├── types.ts                  # Todas as interfaces e tipos
├── registry.ts              # Registry centralizado
├── expression-engine.ts     # Parser de expressões
├── stores.ts                # Factories Zustand
├── Table.ts                 # Implementação principal
├── useTableFramework.ts     # Hooks React
├── index.ts                 # Exportações públicas
├── GUIDE.md                 # Guia de uso (este arquivo)
└── [demo]
    └── app/components/TableRenderDemo.tsx  # Exemplo prático
```

## 🚀 Como Usar

### Criar uma Tabela Real
```typescript
import { Table, tableRegistry } from '@/app/framework/table-render';

const table = new Table({
  name: 'Produtos',
  realEscope: true,
  rows: [...],
  columns: [...],
  callbacks: {
    onCreate: async (row) => { /* ... */ }
  }
});

tableRegistry.register(table, 'products');
```

### Em React
```typescript
import { useTable } from '@/app/framework/table-render';

function Component() {
  const table = useTable(myTable);
  
  return (
    <button onClick={() => table.create({ ... })}>
      Criar
    </button>
  );
}
```

### Com line-list
```typescript
import { tableToLineListProps } from '@/app/framework/table-render';
import { LineListShowcase } from '@/app/components/estoque/line-list';

<LineListShowcase {...tableToLineListProps(myTable)} />
```

## 🔍 Caracteres Especiais

- 📊 Indica coluna dinâmica (laranja na UI)
- ❌ Operação bloqueada (tabela imaginária)
- ✓ Callback executado com sucesso
- 🔄 Operação de sincronização

## 📝 Próximas Etapas (Opcional)

1. **Integração com line-list**: Adaptar o line-list para usar `useTable()`
2. **Validação em tempo real**: Mostrar erros enquanto usuario edita
3. **Multi-select de linhas**: Operações em batch
4. **Busca avançada**: Filtros complexos com UI
5. **Export de dados**: CSV, Excel, PDF
6. **Undo/Redo**: Navegação pelo histórico
7. **Sincronização**: Real-time com múltiplos usuários
