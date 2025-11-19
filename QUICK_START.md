# 🚀 Quick Start - Table Render Framework

## 5 Minutos para Entender Tudo

### 1️⃣ Criar uma Tabela

```typescript
import { Table } from '@/app/framework/table-render';

const table = new Table({
  name: 'Minha Tabela',
  realEscope: true,
  rows: [
    { id: 1, nome: 'Item A', valor: 100 },
    { id: 2, nome: 'Item B', valor: 200 },
  ],
  columns: [
    {
      id: 'nome',
      dataSource: 'nome',
      dataType: 'string',
      isDynamic: false,
      order: 0,
    },
    {
      id: 'valor',
      dataSource: 'valor',
      dataType: 'currency',
      isDynamic: false,
      order: 1,
    },
  ],
});
```

**Automático:** Filtro, reordenação e ordenação já estão habilitados! ✅

---

### 2️⃣ Usar em Componente React

```typescript
import { useTable } from '@/app/framework/table-render';

export function MyTable() {
  const api = useTable(table);

  return (
    <table>
      <thead>
        <tr>
          {api.columns.map(col => (
            <th key={col.id}>{col.dataSource}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {api.visibleRows.map(row => (
          <tr key={row.id}>
            {api.columns.map(col => (
              <td key={col.id}>
                {api.getValue(row.id, col.id)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 3️⃣ Usar Funcionalidades Padrão

#### Filtro ✓

```typescript
// Mostrar apenas valor > 150
api.applyFilter({
  id: 'filter_valor',
  columnId: 'valor',
  operator: 'gt',
  value: 150,
});

// Remover filtro
api.clearFilter('filter_valor');
```

#### Ordenação ✓

```typescript
// Ordenar por nome (A-Z)
api.applySort([
  { columnId: 'nome', direction: 'asc' }
]);

// Ordenar por valor (maior primeiro)
api.applySort([
  { columnId: 'valor', direction: 'desc' }
]);
```

#### Reordenação ✓

```typescript
// Colocar valor antes de nome
api.setColumnOrder(['valor', 'nome']);
```

---

### 4️⃣ Obter Estados Atuais

```typescript
// Linhas filtradas/ordenadas
api.visibleRows     // Array<TableRow>

// Filtros ativos
api.filters         // Array<TableFilter>

// Ordenações ativas
api.sorts           // Array<TableSort>

// Colunas com settings atuais
api.columns         // Array<TableColumn>
```

---

## 🎯 Operadores de Filtro

| Operador | Exemplo | Resultado |
|----------|---------|-----------|
| `eq` | `valor eq 100` | Valor = 100 |
| `ne` | `status ne 'ativo'` | Status ≠ 'ativo' |
| `gt` | `preco gt 50` | Preço > 50 |
| `gte` | `idade gte 18` | Idade ≥ 18 |
| `lt` | `estoque lt 10` | Estoque < 10 |
| `lte` | `idade lte 65` | Idade ≤ 65 |
| `contains` | `nome contains 'João'` | Nome contém 'João' |
| `in` | `status in ['ativo', 'pending']` | Status em lista |
| `between` | `preco between [100, 500]` | Preço entre 100-500 |

---

## 🎨 Tipos de Dados

| Tipo | Uso | Operadores Válidos |
|------|-----|-------------------|
| `string` | Textos | eq, ne, contains |
| `number` | Números | eq, ne, gt, gte, lt, lte, between |
| `boolean` | Sim/Não | eq, ne |
| `date` | Datas | eq, ne, gt, gte, lt, lte, between |
| `currency` | Valores | eq, ne, gt, gte, lt, lte, between |
| `custom` | Customizado | eq, ne, contains |

---

## 🔧 Controlar Funcionalidades por Coluna

### Desabilitar Filtro

```typescript
{
  id: 'id',
  isFilterable: false,  // ❌ Não pode filtrar
  isSortable: true,
}
```

### Desabilitar Ordenação

```typescript
{
  id: 'imagem',
  isFilterable: true,
  isSortable: false,    // ❌ Não pode ordenar
}
```

### Ocultar Coluna

```typescript
{
  id: 'internal',
  isHidden: true,       // ❌ Não mostra
}
```

### Coluna Calculada

```typescript
{
  id: 'comissao',
  dataSource: 'valor',
  isDynamic: true,
  expression: 'valor * 0.1',  // 10% de valor
  isFilterable: true,
  isSortable: true,
}
```

---

## 💾 CRUD (Se realEscope: true)

```typescript
// Criar
const newId = await api.create({ nome: 'Novo', valor: 300 });

// Atualizar
await api.update(1, { valor: 250 });

// Deletar
await api.delete(1);
```

---

## 📸 Snapshots

```typescript
// Salvar estado
const snapshot = api.createSnapshot();

// Restaurar depois
api.restoreSnapshot(snapshot);

// Ver histórico
const history = api.getHistory();
```

---

## 🎓 Exemplo Completo: Dashboard de Vendas

```typescript
import { Table, useTable } from '@/app/framework/table-render';

// 1. Criar tabela
const table = new Table({
  name: 'Vendas Mensais',
  realEscope: true,
  rows: [
    { id: 1, vendedor: 'João', mes: 'Jan', valor: 5000 },
    { id: 2, vendedor: 'Maria', mes: 'Jan', valor: 7500 },
    { id: 3, vendedor: 'Pedro', mes: 'Jan', valor: 3000 },
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
      id: 'valor',
      dataSource: 'valor',
      dataType: 'currency',
      isDynamic: false,
      order: 1,
    },
    {
      id: 'comissao',
      dataSource: 'valor',
      dataType: 'currency',
      isDynamic: true,
      expression: 'valor * 0.1',
      order: 2,
    },
  ],
});

// 2. Usar em componente
export function Dashboard() {
  const api = useTable(table);

  const handleShowTopSellers = () => {
    api.applyFilter({
      id: 'top_sellers',
      columnId: 'valor',
      operator: 'gte',
      value: 5000,
    });
  };

  const handleSortByCommission = () => {
    api.applySort([{ columnId: 'comissao', direction: 'desc' }]);
  };

  return (
    <div>
      <button onClick={handleShowTopSellers}>Top Sellers</button>
      <button onClick={handleSortByCommission}>Maior Comissão</button>

      <table>
        <thead>
          <tr>
            {api.columns.map(col => (
              <th key={col.id}>{col.dataSource}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {api.visibleRows.map(row => (
            <tr key={row.id}>
              {api.columns.map(col => (
                <td key={col.id}>
                  {api.getValue(row.id, col.id)}
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

---

## 🆘 Troubleshooting Rápido

### Filtro não funciona?
```typescript
// Verificar se coluna é filtrável
console.log(api.columns.find(c => c.id === 'status')?.isFilterable);

// Se false, mudar para true na definição da coluna
```

### Dados não aparecem?
```typescript
// Verificar linhas visíveis (após filtros)
console.log(api.visibleRows);

// Verificar todas as linhas
console.log(api.rows);
```

### Ordenação estranha?
```typescript
// Ver ordenações ativas
console.log(api.sorts);

// Limpar ordenação
api.applySort([]);
```

---

## 📚 Leia Mais

- **README.md** - Guia completo
- **ARCHITECTURE.md** - Design do sistema
- **app/framework/table-render/types.ts** - Definições de tipos

---

**Pronto para começar! 🚀**
