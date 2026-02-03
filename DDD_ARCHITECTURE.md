# Arquitetura DDD - Refatoração

## Visão Geral

O projeto foi reorganizado seguindo os princípios do **Domain-Driven Design (DDD)**, criando uma arquitetura minimalista, sólida e escalável.

## Estrutura de Pastas

```
src/
├── domains/
│   ├── shared/                          # 🔄 Domínio Compartilhado
│   │   ├── domain/
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       ├── table.types.ts       # Core types (Table, Row, Column, Filter, Sort)
│   │   │       ├── row.types.ts         # Row-related types
│   │   │       ├── column.types.ts      # Column-related types
│   │   │       ├── filter.types.ts      # Filter types
│   │   │       └── sort.types.ts        # Sort types
│   │   └── index.ts
│   │
│   ├── datagrid/                        # 📊 Domínio DataGrid (core table logic)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── Table.ts             # Classe Table (core business logic)
│   │   │   ├── value-objects/           # (para futuras expansões)
│   │   │   └── services/                # (para futuras expansões)
│   │   ├── application/
│   │   │   └── use-cases/               # (para futuras expansões)
│   │   ├── infrastructure/
│   │   │   └── repositories/            # (para futuras expansões)
│   │   ├── presentation/
│   │   │   └── hooks/                   # (para futuras expansões)
│   │   └── index.ts                     # Barrel export
│   │
│   ├── linelist/                        # 📋 Domínio LineList (UI rendering)
│   │   ├── domain/
│   │   │   └── types.ts                 # Types para UI (DataItem, LineCardsProps, etc)
│   │   ├── application/                 # (para futuras expansões)
│   │   ├── infrastructure/
│   │   │   └── stores/                  # Zustand stores (state management)
│   │   │       ├── useDragStore.ts
│   │   │       ├── useEditStore.ts
│   │   │       ├── useFilterStore.ts
│   │   │       ├── useMenuStore.ts
│   │   │       └── useUIStore.ts
│   │   ├── presentation/
│   │   │   ├── LineList.tsx             # Main component
│   │   │   ├── components/              # React components
│   │   │   │   ├── DataRows.tsx
│   │   │   │   ├── EditRowDialog.tsx
│   │   │   │   ├── FilterDialog.tsx
│   │   │   │   ├── HeaderMenu.tsx
│   │   │   │   ├── HeaderRow.tsx
│   │   │   │   └── RowMenu.tsx
│   │   │   └── hooks/
│   │   │       └── useLineListState.ts  # Business logic hook
│   │   └── index.ts                     # Barrel export
│   │
│   └── shared/                          # Shared utilities (see above)
│
├── app/                                 # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...routes
│
└── config/                              # Configuration
```

## Domínios Principais

### 1. **Shared Domain** 🔄
**Responsabilidade:** Types e interfaces compartilhadas entre domínios

**Artefatos:**
- `src/domains/shared/domain/types/table.types.ts` - Core types (ITable, TableRow, TableColumn, etc)
- Tipos re-exportados para todos os outros domínios

**Por que?** Evita duplicação e garante que todo o projeto use a mesma interface para tabelas.

---

### 2. **DataGrid Domain** 📊
**Responsabilidade:** Lógica core de tabelas (CRUD, filtros, ordenação, colunas dinâmicas)

**Artefatos Principais:**
- `src/domains/datagrid/domain/entities/Table.ts` - Implementação da classe Table com toda business logic
  - ✅ CRUD de linhas (create, update, delete)
  - ✅ Gerenciamento de colunas
  - ✅ Filtros e ordenação (funcionalidades padrão SEMPRE habilitadas)
  - ✅ Colunas dinâmicas com expressões
  - ✅ Histórico e snapshots
  - ✅ Validações

**Dependências:**
- Usa `@/app/framework/table-render/stores` (Zustand stores)
- Usa `@/app/framework/table-render/expression-engine` (compilador de expressões)
- Usa tipos de `shared/domain/types`

**Isolamento:** Não depende de nenhum componente React, totalmente agnóstico a UI

---

### 3. **LineList Domain** 📋
**Responsabilidade:** UI para listas de linhas com edição, filtros, menus contextuais

**Sub-camadas:**

#### Infrastructure (Zustand Stores)
- `useUIStore.ts` - Estado de hover nas colunas
- `useDragStore.ts` - Estado de drag-and-drop
- `useFilterStore.ts` - Estado de filtros
- `useEditStore.ts` - Estado de edição de linhas
- `useMenuStore.ts` - Estado de menus contextuais

#### Presentation
**Components:**
- `HeaderRow.tsx` - Cabeçalho da tabela com drag-drop e hover (delay 2s)
- `DataRows.tsx` - Linhas de dados
- `HeaderMenu.tsx` - Menu de opções da coluna
- `RowMenu.tsx` - Menu de opções da linha
- `FilterDialog.tsx` - Dialog de filtro
- `EditRowDialog.tsx` - Dialog de edição de linha

**Hooks:**
- `useLineListState.ts` - Orquestra todo o estado da UI, conecta stores com componentes

**Main Component:**
- `LineList.tsx` - Componente principal que renderiza toda a lista

---

## Como Importar

### Importando do novo DDD
```typescript
// ✅ PREFERIDO: Imports específicos
import { Table } from '@/src/domains/datagrid';
import { LineList } from '@/src/domains/linelist';
import type { TableColumn, TableRow } from '@/src/domains/shared';

// ✅ Também funciona: Imports absolutos completos
import { Table } from '@/src/domains/datagrid/domain/entities/Table';
```

### Importações antigas ainda funcionam (compatibilidade)
```typescript
// ⚠️ AINDA FUNCIONA: Mas use os novos imports acima
import { Table } from '@/app/framework/table-render';
```

---

## Benefícios desta Arquitetura

### 1. **Separação clara de responsabilidades**
- DataGrid: Pure business logic (sem React)
- LineList: Apresentação e interação com usuário
- Shared: Tipos comuns

### 2. **Testabilidade**
- Classe Table pode ser testada sem dependências React
- Stores podem ser testados isoladamente
- Componentes podem ser testados com mocks

### 3. **Escalabilidade**
- Novos domínios podem ser adicionados facilmente
- Estrutura pronta para adicionar novos "renders" (ex: DataGridCompact, DataGridKanban)
- Fácil adicionar novos use cases em `application/use-cases`

### 4. **Manutenibilidade**
- Código organizado por domínio, não por tipo de arquivo
- Imports claros mostram dependências
- Menos acoplamento entre componentes

### 5. **Minimalismo**
- Removidos arquivos desnecessários do app/framework
- Estrutura enxuta sem files redundantes
- Apenas o essencial em cada domínio

---

## Fluxo de Dados

```
User Interaction (LineList Components)
         ↓
useLineListState Hook (Orquestração)
         ↓
Zustand Stores (State Management)
         ↓
Table Entity (Business Logic)
         ↓
applyFilters, applySort, create, update, delete...
         ↓
Zustand Stores (atualizam resultado)
         ↓
useLineListState (lê novo estado)
         ↓
LineList Component (re-render)
```

---

## Próximas Etapas (Expandindo DDD)

### Adicionar Use Cases
```typescript
// src/domains/datagrid/application/use-cases/CreateRowUseCase.ts
export class CreateRowUseCase {
  async execute(table: Table, data: Omit<TableRow, 'id'>): Promise<string> {
    // Lógica com validações, side effects, etc
    return table.create(data);
  }
}
```

### Adicionar Value Objects
```typescript
// src/domains/datagrid/domain/value-objects/ColumnId.ts
export class ColumnId {
  constructor(private value: string) {}
  getValue(): string { return this.value; }
  equals(other: ColumnId): boolean { return this.value === other.getValue(); }
}
```

### Adicionar Repositories
```typescript
// src/domains/datagrid/infrastructure/repositories/TableRepository.ts
export class TableRepository {
  async save(table: Table): Promise<void> { }
  async findById(id: string): Promise<Table | null> { }
}
```

---

## Resumo

| Aspecto | Before | After |
|---------|--------|-------|
| Estrutura | Bagunçado em `app/framework` | DDD com domínios bem definidos |
| Imports | Relativos complexos | Absolutos e claros |
| Testabilidade | Difícil | Fácil (logic separada de UI) |
| Escalabilidade | Acoplado | Modular e extensível |
| Documentação | Nenhuma | DDD pattern bem claro |
| Funcionalidade | 100% | 100% ✅ Nada mudou! |
| Design | 100% | 100% ✅ Nada mudou! |

---

**Arquitetura pronta para crescer! 🚀**
