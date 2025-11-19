# Table Render - Quick Start

## 5 Minutos para Começar

### 1️⃣ Criar uma Tabela Real (com CRUD)

```typescript
import { Table, tableRegistry } from '@/app/framework/table-render';

const table = new Table({
  name: 'Meus Produtos',
  realEscope: true, // ← Permite CRUD
  rows: [
    { id: '1', name: 'Notebook', price: 2500 },
    { id: '2', name: 'Mouse', price: 50 }
  ],
  columns: [
    { id: 'id', dataSource: 'id', dataType: 'string', isDynamic: false, order: 1 },
    { id: 'name', dataSource: 'name', dataType: 'string', isDynamic: false, order: 2 },
    { id: 'price', dataSource: 'price', dataType: 'currency', isDynamic: false, order: 3 }
  ],
  callbacks: {
    onCreate: async (row) => console.log('Criar:', row),
    onUpdate: async (id, changes) => console.log('Atualizar:', id, changes),
    onDelete: async (id) => console.log('Deletar:', id)
  }
});

// Registrar no registry
tableRegistry.register(table, 'meus_produtos');
```

### 2️⃣ Usar em React

```typescript
'use client';

import { useTable } from '@/app/framework/table-render';

function MeuComponente() {
  const table = useTable(myTable);

  return (
    <div>
      <h1>{table.name}</h1>
      <p>{table.rows.length} produtos</p>
      
      <button onClick={() => table.create({ name: 'Novo', price: 100 })}>
        Novo Produto
      </button>

      {table.rows.map(row => (
        <div key={row.id}>
          {row.name} - R$ {row.price}
          <button onClick={() => table.update(row.id, { price: 200 })}>Editar</button>
          <button onClick={() => table.delete(row.id)}>Deletar</button>
        </div>
      ))}
    </div>
  );
}
```

### 3️⃣ Tabela Imaginária (com Colunas Dinâmicas)

```typescript
const table = new Table({
  name: 'Estatísticas',
  realEscope: false, // ← Sem CRUD
  rows: [
    { id: '1', name: 'Notebook', quantity: 5, unit_price: 2500 },
    { id: '2', name: 'Mouse', quantity: 100, unit_price: 50 }
  ],
  columns: [
    { id: 'id', dataSource: 'id', dataType: 'string', isDynamic: false, order: 1 },
    { id: 'name', dataSource: 'name', dataType: 'string', isDynamic: false, order: 2 },
    { id: 'quantity', dataSource: 'quantity', dataType: 'number', isDynamic: false, order: 3 },
    { id: 'unit_price', dataSource: 'unit_price', dataType: 'currency', isDynamic: false, order: 4 },
    
    // 📊 Coluna dinâmica
    {
      id: 'total',
      dataSource: 'total',
      dataType: 'currency',
      isDynamic: true,
      expression: 'quantity * unit_price', // ← Tipo Excel
      alias: '📊 Total em Estoque',
      isReadOnly: true,
      order: 5
    }
  ]
});

// Usar:
const totalNotebook = table.getValue('1', 'total'); // 12500
```

### 4️⃣ Filtrar e Ordenar

```typescript
// Filtrar
table.applyFilter({
  id: 'filter_1',
  columnId: 'price',
  operator: 'gte', // >=
  value: 100
});

// Ordenar
table.applySort([
  { columnId: 'price', direction: 'desc' }
]);

// Limpar
table.clearFilter();
```

### 5️⃣ Snapshots e Histórico

```typescript
// Salvar estado
const snapshot = table.createSnapshot();

// Restaurar
table.restoreSnapshot(snapshot);

// Ver histórico
const history = table.getHistory();
```

---

## Próximos Passos

- Leia [GUIDE.md](./GUIDE.md) para documentação completa
- Veja [EXAMPLES_ADVANCED.ts](./EXAMPLES_ADVANCED.ts) para casos de uso reais
- Explore [TableRenderDemo.tsx](../../../components/TableRenderDemo.tsx) para exemplo interativo

## API Resumida

### Table

```typescript
// Leitura
table.getRows()              // todas as linhas
table.getColumns()           // todas as colunas
table.getValue(rowId, colId) // valor (inclui dinâmicas)

// CRUD (realEscope: true)
await table.create(row)                    // nova linha
await table.update(rowId, changes)         // atualizar
await table.delete(rowId)                  // deletar

// Colunas dinâmicas
await table.addDynamicColumn(column)       // adicionar
await table.updateColumn(colId, updates)   // atualizar
await table.deleteColumn(colId)            // deletar
await table.renameColumn(colId, newName)   // renomear

// Filtros/Ordenação
table.applyFilter(filter)                  // aplicar filtro
table.clearFilter(filterId?)               // remover filtro
table.applySort(sorts)                     // ordenar

// Snapshots
table.createSnapshot()                     // snapshot atual
table.restoreSnapshot(snapshot)            // restaurar

// Info
table.getHistory()                         // histórico
table.id                                   // ID
table.name                                 // Nome
table.realEscope                           // true/false
```

### Registry

```typescript
tableRegistry.register(table, id?)          // registrar
tableRegistry.get(id)                       // buscar por ID
tableRegistry.getByName(name)               // buscar por nome
tableRegistry.getAll()                      // todas
tableRegistry.getAllReal()                  // só reais
tableRegistry.getAllImaginary()             // só imaginárias
tableRegistry.remove(id)                    // remover
tableRegistry.getStats()                    // estatísticas
```

### Expressões Dinâmicas

```
Aritmética:  +  -  *  /  %
Comparação:  ==  !=  <  >  <=  >=
Lógica:      &&  ||
Ternária:    condition ? true : false
Referências: columnName
Lookups:     ref.tableId.columnName
```

---

## Conceitos-Chave

| Conceito | Descrição | Permite CRUD |
|----------|-----------|--------------|
| Tabela Real | Salva no banco, com callbacks | ✅ Sim |
| Tabela Imaginária | Apenas análise e comparação | ❌ Não |
| Coluna Real | Dados armazenados | ✅ Editável |
| Coluna Dinâmica | Calculada por expressão | ❌ Somente leitura |

---

## Exemplo Completo

```typescript
'use client';

import { Table, tableRegistry, useTable } from '@/app/framework/table-render';

export default function App() {
  // 1. Criar tabela
  const myTable = new Table({
    name: 'Vendas',
    realEscope: true,
    rows: [
      { id: '1', product: 'A', quantity: 5, price: 100 },
      { id: '2', product: 'B', quantity: 3, price: 200 }
    ],
    columns: [
      { id: 'id', dataSource: 'id', dataType: 'string', isDynamic: false, order: 1 },
      { id: 'product', dataSource: 'product', dataType: 'string', isDynamic: false, order: 2 },
      { id: 'quantity', dataSource: 'quantity', dataType: 'number', isDynamic: false, order: 3 },
      { id: 'price', dataSource: 'price', dataType: 'currency', isDynamic: false, order: 4 },
      {
        id: 'total',
        dataSource: 'total',
        dataType: 'currency',
        isDynamic: true,
        expression: 'quantity * price',
        alias: '📊 Total',
        isReadOnly: true,
        order: 5
      }
    ]
  });

  tableRegistry.register(myTable, 'vendas');

  // 2. Em React
  function Content() {
    const table = useTable(myTable);

    return (
      <div>
        <h1>{table.name}</h1>
        <table>
          <tr>
            {table.columns.map(col => (
              <th key={col.id}>
                {col.isDynamic ? '📊 ' : ''}{col.alias}
              </th>
            ))}
          </tr>
          {table.rows.map(row => (
            <tr key={row.id}>
              {table.columns.map(col => (
                <td key={`${row.id}_${col.id}`}>
                  {col.isDynamic
                    ? table.getValue(row.id, col.id)
                    : row[col.dataSource]
                  }
                </td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    );
  }

  return <Content />;
}
```

---

**Pronto para começar? Vamos! 🚀**
