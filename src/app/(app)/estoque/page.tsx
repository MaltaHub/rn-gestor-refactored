// app/estoque/page.tsx (Server Component por padrão)
import { Suspense } from "react";
import EstoqueClient from "./EstoqueCliente";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { Permission } from "@/types/rbac";

export default function EstoquePage() {
  return (
    <PagePermissionGuard permission={Permission.ESTOQUE_VISUALIZAR}>
      <Suspense fallback={<div>Carregando estoque...</div>}>
        <EstoqueClient />
      </Suspense>
    </PagePermissionGuard>
  );
}
