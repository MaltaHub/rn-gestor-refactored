# Table Render Framework

**Um framework poderoso e intuitivo para tabelas React com funcionalidades padrão habilitadas.**

## 🎯 Funcionalidades Padrão (Sempre Habilitadas)

Todas as instâncias de `Table` vêm com estas funcionalidades **automaticamente habilitadas** em todas as colunas:

✅ **Filtros** - Filtrar dados por qualquer coluna  
✅ **Reordenação** - Reorganizar colunas via drag-and-drop  
✅ **Ordenação** - Ordenar linhas crescente/decrescente  
✅ **Histórico** - Rastrear todas as mudanças  
✅ **Snapshots** - Salvar estado da tabela  

## 🚀 Início Rápido

### 1. Criar uma Tabela

```typescript
import { Table } from '@/app/framework/table-render';

const table = new Table({
  name: 'Produtos',
  realEscope: true,
  rows: [
    { id: 1, nome: 'Produto A', preco: 100, status: 'ativo' },
    { id: 2, nome: 'Produto B', preco: 200, status: 'inativo' },
  ],
  columns: [
    {
      id: 'nome',
      dataSource: 'nome',
      dataType: 'string',
      isDynamic: false,
      order: 0,
      // Filtro, reordenação e ordenação já estão habilitados!
    },
    {
      id: 'preco',
      dataSource: 'preco',
      dataType: 'currency',
      isDynamic: false,
      order: 1,
    },
    {
      id: 'status',
      dataSource: 'status',
      dataType: 'string',
      isDynamic: false,
      order: 2,
    },
  ],
});
```

### 2. Usar no Componente React

```typescript
import { useTable } from '@/app/framework/table-render';

export function ProductTable() {
  const tableApi = useTable(table);

  return (
    <div>
      <button onClick={() => {
        // Filtrar: status = 'ativo'
        tableApi.applyFilter({
          id: 'f1',
          columnId: 'status',
          operator: 'eq',
          value: 'ativo',
        });
      }}>
        Filtrar por Ativo
      </button>

      <button onClick={() => {
        // Ordenar por preço (decrescente)
        tableApi.applySort([{ columnId: 'preco', direction: 'desc' }]);
      }}>
        Ordenar por Preço
      </button>

      <button onClick={() => {
        // Reorganizar colunas
        tableApi.setColumnOrder(['status', 'nome', 'preco']);
      }}>
        Reorganizar
      </button>

      {/* Renderizar tabela com dados filtrados/ordenados */}
      <table>
        <thead>
          <tr>
            {tableApi.columns
              .filter(c => !c.isHidden)
              .sort((a, b) => a.order - b.order)
              .map(col => <th key={col.id}>{col.alias || col.dataSource}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableApi.visibleRows.map(row => (
            <tr key={row.id}>
              {tableApi.columns
                .filter(c => !c.isHidden)
                .sort((a, b) => a.order - b.order)
                .map(col => (
                  <td key={col.id}>
                    {tableApi.getValue(row.id, col.id) ?? '—'}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 3. Renderizar com o componente oficial

```typescript
import { RenderTable } from '@/app/framework/table-render';

export function ProductTable() {
  return (
    <RenderTable
      table={table}
      mode="edit"
      config={{
        onColumnOrderChange: (order) => console.log('Nova ordem:', order),
      }}
    />
  );
}
```

## 📚 API Principal

### Métodos de Tabela

#### Filtros

```typescript
// Aplicar filtro
table.applyFilter({
  id: 'filter_1',           // ID único do filtro
  columnId: 'status',       // Coluna a filtrar
  operator: 'eq',           // Operador: eq, ne, gt, gte, lt, lte, contains, in, between
  value: 'ativo',           // Valor do filtro
  caseSensitive: false,     // Opcional: para contains
});

// Remover um filtro específico
table.clearFilter('filter_1');

// Remover todos os filtros
table.clearFilter();

// Obter filtros ativos
const filters = table.getFilters();
```

#### Ordenação

```typescript
// Ordenar por coluna
table.applySort([
  { columnId: 'preco', direction: 'asc' }   // 'asc' ou 'desc'
]);

// Múltiplas ordenações
table.applySort([
  { columnId: 'departamento', direction: 'asc' },
  { columnId: 'salario', direction: 'desc' },
]);

// Obter ordenações ativas
const sorts = table.getSorts();
```

#### Reordenação

```typescript
// Reorganizar colunas
table.setColumnOrder(['coluna3', 'coluna1', 'coluna2']);

// Obter colunas em ordem
const columns = table.getColumns(); // Já estão ordenadas
```

#### Dados

```typescript
// Obter todas as linhas
const allRows = table.getRows();

// Obter linhas visíveis (após filtros/ordenação)
const visibleRows = table.getVisibleRows();

// Obter valor de célula (suporta colunas dinâmicas)
const value = table.getValue(rowId, columnId);

// Obter todas as colunas
const columns = table.getColumns();
```

#### CRUD (apenas se realEscope: true)

```typescript
// Criar linha
const newId = await table.create({ nome: 'Novo', preco: 300 });

// Atualizar linha
await table.update(1, { status: 'inativo' });

// Deletar linha
await table.delete(1);
```

#### Snapshots e Histórico

```typescript
// Criar snapshot
const snapshot = table.createSnapshot();

// Restaurar snapshot
table.restoreSnapshot(snapshot);

// Obter histórico
const history = table.getHistory();

// Obter snapshots
const snapshots = table.getSnapshots();
```

## 🔧 Controle Granular por Coluna

### Desabilitar Filtro

```typescript
{
  id: 'id',
  dataSource: 'id',
  dataType: 'number',
  isDynamic: false,
  order: 0,
  isFilterable: false,    // ❌ Não pode ser filtrada
  isSortable: true,
}
```

### Desabilitar Ordenação

```typescript
{
  id: 'imagem',
  dataSource: 'imageUrl',
  dataType: 'custom',
  isDynamic: false,
  order: 0,
  isFilterable: false,
  isSortable: false,      // ❌ Não pode ser ordenada
}
```

### Ocultar Coluna

```typescript
{
  id: 'internal_key',
  dataSource: 'internalKey',
  dataType: 'string',
  isDynamic: false,
  order: 0,
  isHidden: true,         // ❌ Coluna oculta
}
```

### Coluna Dinâmica (Calculada)

```typescript
{
  id: 'preco_com_imposto',
  dataSource: 'preco',
  dataType: 'currency',
  isDynamic: true,        // ✓ Calculada por expressão
  order: 2,
  expression: 'preco * 1.15',  // +15% de imposto
  isFilterable: true,     // ✓ Pode filtrar resultado
  isSortable: true,       // ✓ Pode ordenar resultado
}
```

## 🎨 Operadores de Filtro

| Operador | Label | Usado em |
|----------|-------|----------|
| `eq` | Igual | Todos |
| `ne` | Não igual | Todos |
| `gt` | Maior que | Números, Datas |
| `gte` | Maior ou igual | Números, Datas |
| `lt` | Menor que | Números, Datas |
| `lte` | Menor ou igual | Números, Datas |
| `contains` | Contém | Strings |
| `in` | Em (lista) | Todos |
| `between` | Entre (range) | Números, Datas |

## 📂 Estrutura de Arquivos

```
app/framework/table-render/
├── Table.ts                    # Classe principal
├── types.ts                    # Definições de tipos
├── stores.ts                   # Zustand stores
├── defaults.ts                 # Configurações padrão ⭐ NOVO
├── expression-engine.ts        # Motor de expressões
├── registry.ts                 # Registro de tabelas
├── useTableFramework.ts        # Hook React
├── index.ts                    # Exports públicos
└── README.md                   # Este arquivo
```

## 🎯 Exemplo Completo: Dashboard de Vendas

```typescript
import { useTable } from '@/app/framework/table-render';
import { Table } from '@/app/framework/table-render';

export function SalesDashboard() {
  const salesTable = new Table({
    name: 'Vendas Mensais',
    realEscope: true,
    rows: [
      { id: 1, vendedor: 'João', mes: 'Janeiro', valor: 5000, status: 'completo' },
      { id: 2, vendedor: 'Maria', mes: 'Janeiro', valor: 7500, status: 'completo' },
      { id: 3, vendedor: 'Pedro', mes: 'Janeiro', valor: 3000, status: 'pendente' },
    ],
    columns: [
      {
        id: 'vendedor',
        dataSource: 'vendedor',
        dataType: 'string',
        isDynamic: false,
        order: 0,
      },
      {
        id: 'mes',
        dataSource: 'mes',
        dataType: 'string',
        isDynamic: false,
        order: 1,
      },
      {
        id: 'valor',
        dataSource: 'valor',
        dataType: 'currency',
        isDynamic: false,
        order: 2,
      },
      {
        id: 'comissao',
        dataSource: 'valor',
        dataType: 'currency',
        isDynamic: true,
        expression: 'valor * 0.1',  // 10% de comissão
        order: 3,
      },
      {
        id: 'status',
        dataSource: 'status',
        dataType: 'string',
        isDynamic: false,
        order: 4,
      },
    ],
  });

  const api = useTable(salesTable);

  // Aplicar filtros
  const handleShowCompleted = () => {
    api.applyFilter({
      id: 'status_filter',
      columnId: 'status',
      operator: 'eq',
      value: 'completo',
    });
  };

  // Ordenar
  const handleSortByValue = () => {
    api.applySort([{ columnId: 'valor', direction: 'desc' }]);
  };

  // Reorganizar
  const handleOptimizeView = () => {
    api.setColumnOrder(['vendedor', 'mes', 'comissao', 'valor', 'status']);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={handleShowCompleted}>Mostrar Completos</button>
        <button onClick={handleSortByValue}>Top Vendedores</button>
        <button onClick={handleOptimizeView}>Otimizar Visão</button>
      </div>

      {/* Renderizar dados */}
      <table>
        <thead>
          <tr>
            {api.columns
              .filter(c => !c.isHidden)
              .sort((a, b) => a.order - b.order)
              .map(col => (
                <th key={col.id}>
                  {col.alias || col.dataSource}
                  {col.isSortable && ' ↕'}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {api.visibleRows.map(row => (
            <tr key={row.id}>
              {api.columns
                .filter(c => !c.isHidden)
                .sort((a, b) => a.order - b.order)
                .map(col => (
                  <td key={col.id}>
                    {api.getValue(row.id, col.id) ?? '—'}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 🚨 Troubleshooting

### Problema: Filtro não funcionando

```typescript
// ✓ Verificar se coluna é filtrável
const column = table.getColumns().find(c => c.id === 'status');
console.log('isFilterable:', column?.isFilterable);  // Deve ser true

// ✓ Verificar se operador é válido para o tipo
// string: eq, ne, contains
// number: eq, ne, gt, gte, lt, lte, between
```

### Problema: Coluna não aparece ordenada

```typescript
// ✓ Verificar se coluna é ordenável
const column = table.getColumns().find(c => c.id === 'preco');
console.log('isSortable:', column?.isSortable);  // Deve ser true

// ✓ Verificar se applySort foi chamado corretamente
console.log('Sorts ativos:', table.getSorts());
```

### Problema: Reorganização não funciona

```typescript
// ✓ Verificar IDs das colunas
const validIds = table.getColumns().map(c => c.id);
console.log('IDs válidos:', validIds);

// ✓ Passar todos os IDs na ordem desejada
table.setColumnOrder(['col1', 'col2', 'col3']);
```

## 📖 Documentação

- **tipos.ts** - Definições completas de interfaces
- **defaults.ts** - Configurações padrão e helpers
- **Table.ts** - Implementação e lógica principal
- **expression-engine.ts** - Motor de expressões dinâmicas

## 💡 Dicas de Performance

1. Use `isFilterable: false` em colunas que nunca serão filtradas
2. Use `isSortable: false` em colunas que nunca serão ordenadas
3. Expressões dinâmicas são compiladas uma vez e cacheadas
4. Use memoização nos componentes React para evitar re-renders

## 🔐 Segurança

- Expressões são compiladas e validadas antes de execução
- IDs de coluna são validados antes de reordenação
- Filtros aplicados são tipados e validados
- Histórico oferece auditoria completa de mudanças

---

**Developed with ❤️ | Table Render Framework**
