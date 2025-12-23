# rn-gestor – Table Render Framework

Demo enxuta que concentra o framework de tabelas em uma única página. O foco agora é apenas no **Table Render Framework**, sem rotas ou páginas paralelas.

## Como rodar
```bash
npm install
npm run dev
# abra http://localhost:3000
```

## Estrutura essencial
- `app/page.tsx` — ponto de entrada único que exibe a demo completa.
- `app/components/TableRenderDemo.tsx` — playground do Table Render (filtros, ordenação, reordenação, snapshots).
- `app/framework/table-render` — núcleo do engine de tabelas (Table, hooks, tipos).
- `app/framework/table-render/render/RenderTable.tsx` — componente oficial de renderização com config centralizada.

## Como explorar
- **Tabelas**: altere filtros, ordenações, reordene colunas, salve snapshots e veja o console de eventos. Tudo parte do Table Render padrão.

## Próximos passos sugeridos
1. Formalizar o PDR do Table Render Framework para facilitar manutenção.
2. Expandir os testes automatizados e exemplos guiados dentro do próprio framework.
3. Evoluir integrações com backends reais (ex.: Supabase) mantendo o isolamento do sandbox.
