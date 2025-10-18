'use client';

import Link from "next/link";
import { useMemo } from "react";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { Permission } from "@/types/rbac";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { usePermissions } from "@/hooks/use-permissions";
import { useVendas } from "@/hooks/use-vendas";
import { formatCurrency, formatDate } from "@/lib/utils";

const formatStatus = (value?: string | null) =>
  (value ?? "sem status")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function VendasDashboardContent() {
  const { user } = useAuth();
  const { data: membroEmpresa, isLoading: isLoadingEmpresa } = useEmpresaDoUsuario();
  const { role, isAdmin } = usePermissions();

  const empresaId = membroEmpresa?.empresa_id ?? null;
  const vendedorId = useMemo(() => {
    if (!user?.id) return null;
    if (role === "gerente" || isAdmin()) return null;
    return user.id;
  }, [user?.id, role, isAdmin]);

  const { data: vendas = [], isLoading } = useVendas(empresaId, vendedorId, !isLoadingEmpresa);

  const resumo = useMemo(() => {
    if (!vendas || vendas.length === 0) {
      return {
        total: 0,
        totalValor: 0,
        porStatus: {} as Record<string, number>,
      };
    }

    return vendas.reduce(
      (acc, venda) => {
        acc.total += 1;
        acc.totalValor += venda.preco_venda ?? 0;
        const chave = venda.status_venda ?? "sem_status";
        acc.porStatus[chave] = (acc.porStatus[chave] ?? 0) + 1;
        return acc;
      },
      { total: 0, totalValor: 0, porStatus: {} as Record<string, number> }
    );
  }, [vendas]);

  const exibindoApenasMinhas = Boolean(vendedorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100924] via-[#161035] to-[#1f1747] px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">
              {exibindoApenasMinhas ? "Minhas vendas" : "Painel de vendas"}
            </h1>
            <p className="text-sm text-slate-300">
              {exibindoApenasMinhas
                ? "Acompanhe as vendas registradas por você."
                : "Resumo completo das vendas da empresa."}
            </p>
          </div>
          <Button asChild variant="primary" size="md">
            <Link href="/vendas/nova">Registrar nova venda</Link>
          </Button>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card variant="elevated" className="bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
            <Card.Header
              title="Vendas registradas"
              subtitle={exibindoApenasMinhas ? "Suas vendas" : "Total geral"}
            />
            <Card.Body>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? "—" : resumo.total}
              </p>
            </Card.Body>
          </Card>

          <Card variant="elevated" className="bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
            <Card.Header title="Volume vendido" subtitle="Valor bruto das vendas" />
            <Card.Body>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? "—" : formatCurrency(resumo.totalValor)}
              </p>
            </Card.Body>
          </Card>

          <Card variant="elevated" className="bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
            <Card.Header title="Status em negociação" subtitle="Aguardando conclusão" />
            <Card.Body>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? "—" : resumo.porStatus["negociacao"] ?? 0}
              </p>
            </Card.Body>
          </Card>

          <Card variant="elevated" className="bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
            <Card.Header title="Vendas finalizadas" subtitle="Negócios concluídos" />
            <Card.Body>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? "—" : resumo.porStatus["finalizada"] ?? 0}
              </p>
            </Card.Body>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Vendas recentes</h2>
            <span className="text-xs uppercase tracking-wide text-slate-300">
              {isLoading ? "Carregando..." : `${resumo.total} registros`}
            </span>
          </div>

          <Card variant="default" padding="lg" className="bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                Carregando vendas...
              </div>
            ) : vendas.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-300">
                <p>Nenhuma venda encontrada.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/vendas/nova">Registrar primeira venda</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      <th className="px-4 py-3 font-medium">Venda</th>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Veículo</th>
                      <th className="px-4 py-3 font-medium">Valor</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {vendas.map((venda) => (
                      <tr
                        key={venda.id}
                        className="text-slate-700 transition-colors hover:bg-slate-100/80 dark:text-slate-100 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              #{venda.id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-300">
                              {formatDate(venda.data_venda)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {venda.cliente_nome}
                            </span>
                            {venda.cliente_telefone && (
                              <span className="text-xs text-slate-500 dark:text-slate-300">
                                {venda.cliente_telefone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {venda.veiculo?.modelo?.nome ?? "Veículo"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-300">
                              Placa: {venda.veiculo?.placa ?? "n/d"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(venda.preco_venda)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                            {formatStatus(venda.status_venda)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-200 dark:hover:text-purple-100"
                          >
                            <Link href={`/vendas/${venda.id}`}>Detalhes</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

export default function VendasPage() {
  return (
    <PagePermissionGuard permission={Permission.VENDAS_VISUALIZAR}>
      <VendasDashboardContent />
    </PagePermissionGuard>
  );
}
