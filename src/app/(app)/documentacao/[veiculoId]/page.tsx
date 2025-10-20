"use client";

import { useParams } from "next/navigation";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { DocumentRepository } from "@/components/documentacao/DocumentRepository";
import { Permission } from "@/types/rbac";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function DocumentosVeiculoPage() {
  const { data: empresa } = useEmpresaDoUsuario();
  const params = useParams<{ veiculoId: string }>();
  const veiculoId = params?.veiculoId as string | undefined;
  const empresaId = empresa?.empresa_id;

  if (!empresaId || !veiculoId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-6 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PermissionGuard permission={Permission.DOCUMENTACAO_VISUALIZAR}>
          <DocumentRepository empresaId={empresaId} veiculoId={veiculoId} />
        </PermissionGuard>
      </div>
    </div>
  );
}
