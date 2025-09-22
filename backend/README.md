# Orquestração da fronteira backend ↔ frontend

Este diretório centraliza o que o frontend precisa saber sobre o schema do Supabase: quais tabelas/views/RPCs existem por domínio e onde cada operação é utilizada na interface. O formato é propositalmente simples para manter o sistema minimalista:

- Cada domínio (`modules/*.ts`) expõe operações como objetos `BackendOperation`, contendo apenas `id`, `label`, domínio, tipo (`query` ou `command`), a fonte no banco (`source`) e a lista de superfícies do frontend que consomem aquele dado.
- `fixtures.ts` concentra *mocks* em memória coerentes com as tabelas reais. Enquanto o backend não está plugado, o frontend chama `operation.mock(...)` para continuar funcional.
- `types.ts` define o contrato enxuto usado pelos módulos e pelo agregador.
- `index.ts` monta um registro (`backendModules`, `backendOperations`, `operationList`) que pode ser reutilizado para documentação, testes ou geração de clientes.
- `boundary-map.ts` transforma o registro em uma matriz plana (`boundaryMatrix`) que pode alimentar planilhas, dashboards ou verificação automática de cobertura.

## Como ligar o backend real

1. Gere os tipos do Supabase em `src/types/supabase.ts` (`supabase gen types typescript --project-id ...`).
2. Crie helpers de client (ex.: `src/lib/supabase-client.ts`) e injete-os nas chamadas `run` das operações.
3. Para cada operação, implemente `run` respeitando a fonte declarada em `source`. Exemplo:

```ts
const listVehicles: BackendOperation<ListInventoryArgs, InventoryVehicle[]> = {
  // ...
  run: async ({ search }, { client }) => {
    const supabase = client as SupabaseClient<Database>;
    const query = supabase
      .from("veiculos")
      .select("id, placa, modelo:modelo_id(nome), estado_venda, preco_venal, atualizado_em")
      .order("atualizado_em", { ascending: false });

    if (search) {
      query.ilike("placa", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapToInventoryVehicle);
  },
  mock: async ({ search }) => /* ... */
};
```

4. Troque as chamadas `operation.mock` no frontend por `operation.run` assim que o backend estiver disponível (ou injete lógica que escolha `run`/`mock` conforme o ambiente).

## Domínios disponíveis

| Domínio | Arquivo | Propósito resumido |
| ------- | ------- | ------------------ |
| dashboard | `modules/dashboard.ts` | Métricas globais, checklist e últimos veículos |
| estoque | `modules/estoque.ts` | Ciclo de vida dos veículos e status de venda |
| anúncios | `modules/anuncios.ts` | Monitoramento de plataformas e reprocessamentos |
| vendas | `modules/vendas.ts` | Pipeline comercial e avanços de etapa |
| promoções | `modules/promocoes.ts` | Campanhas comerciais e agendamentos |
| perfil | `modules/perfil.ts` | Dados pessoais, preferências e segurança do usuário |
| configuracoes | `modules/configuracoes.ts` | Identidade da empresa e feature flags |
| auth | `modules/auth.ts` | Autenticação e controle de sessão |

Para uma visão consolidada da fronteira, veja `BOUNDARY.md` ou consuma `boundaryMatrix` direto em código.
