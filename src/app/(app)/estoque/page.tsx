// app/estoque/page.tsx (Server Component por padrão)
import { Suspense } from "react";
import EstoqueClient from "./EstoqueCliente";

export default function EstoquePage() {
  return (
    <Suspense fallback={<div>Carregando estoque...</div>}>
      <EstoqueClient />
    </Suspense>
  );
}
