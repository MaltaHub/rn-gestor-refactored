'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { Permission } from "@/types/rbac";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { usePermissions } from "@/hooks/use-permissions";
import { useAtualizarStatusVenda, useVenda } from "@/hooks/use-vendas";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const STATUS_VENDA_OPTIONS = ["negociacao", "aprovada", "finalizada", "cancelada", "devolvida"] as const;

const formatStatus = (value?: string | null) =>
  (value ?? "—")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function VendaDetalheContent() {
  const params = useParams<{ id: string }>();
  const vendaId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user } = useAuth();
  const { data: membroEmpresa, isLoading: isLoadingEmpresa } = useEmpresaDoUsuario();
  const { role, isAdmin } = usePermissions();
  const { mostrarToast } = useToast();
  const atualizarStatusMutation = useAtualizarStatusVenda();

  const empresaId = membroEmpresa?.empresa_id ?? null;
  const { data: venda, isLoading, error, refetch } = useVenda(vendaId, empresaId);

  const pageWrapperClass =
    "min-h-screen bg-gradient-to-br from-[#100924] via-[#161035] to-[#1f1747] px-6 py-10 text-slate-100";
  const cardSurfaceClass =
    "bg-white/95 text-slate-900 shadow-lg shadow-purple-900/10 dark:bg-[var(--surface-elevated)] dark:text-slate-100";
  const labelMutedClass = "text-sm text-slate-500 dark:text-slate-300";
  const valueStrongClass = "text-base font-medium text-slate-900 dark:text-slate-100";

  const canViewAll = role === "gerente" || isAdmin();
  const ehVendedorResponsavel = useMemo(() => {
    if (!venda || !user?.id) return false;
    return venda.vendedor_id === user.id;
  }, [venda, user?.id]);

  const [statusEdit, setStatusEdit] = useState<string>("");

  useEffect(() => {
    if (venda?.status_venda) {
      setStatusEdit(venda.status_venda);
    }
  }, [venda?.status_venda]);

  if (!vendaId) {
    return (
      <div className={pageWrapperClass}>
        <div className="mx-auto max-w-3xl text-center text-sm text-slate-300">
          Identificador da venda inválido.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageWrapperClass}>
        <div className="mx-auto max-w-3xl">
          <Alert
            type="error"
            message="Não foi possível carregar os dados da venda."
          />
          <Button variant="ghost" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const semAcesso = !isLoading && venda && !canViewAll && !ehVendedorResponsavel;

  if (semAcesso) {
    return (
      <div className={pageWrapperClass}>
        <div className="mx-auto max-w-3xl">
          <Alert
            type="warning"
            message="Você não tem permissão para visualizar os detalhes desta venda."
          />
          <Button asChild variant="ghost" className="mt-4">
            <Link href="/vendas">Voltar para o painel</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingEmpresa || !venda) {
    return (
      <div className={pageWrapperClass}>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-6 w-48 animate-pulse rounded-md bg-white/20" />
          <div className="h-40 rounded-xl bg-white/10" />
          <div className="h-40 rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  const podeEditarStatus = canViewAll;

  const handleAtualizarStatus = async () => {
    if (!statusEdit || statusEdit === venda.status_venda) return;
    try {
      await atualizarStatusMutation.mutateAsync({
        vendaId: venda.id,
        status: statusEdit as (typeof STATUS_VENDA_OPTIONS)[number],
        usuarioId: user?.id ?? null,
      });
      mostrarToast({
        titulo: "Status atualizado",
        mensagem: "O status da venda foi atualizado com sucesso.",
        tipo: "success",
      });
      refetch();
    } catch (err) {
      console.error("[Vendas] Erro ao atualizar status:", err);
      mostrarToast({
        titulo: "Erro",
        mensagem: err instanceof Error ? err.message : "Não foi possível atualizar o status.",
        tipo: "error",
      });
    }
  };

  return (
    <div className={pageWrapperClass}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/vendas"
              className="text-sm font-medium text-purple-200 transition-colors hover:text-purple-100"
            >
              ← Voltar para o painel
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">
              Venda #{venda.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-slate-300">
              {formatDate(venda.data_venda)} • Valor {formatCurrency(venda.preco_venda)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs uppercase tracking-wide text-slate-300">
              Status da venda
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                {formatStatus(venda.status_venda)}
              </span>
              {podeEditarStatus && (
                <div className="flex items-center gap-2">
                  <select
                    value={statusEdit}
                    onChange={(event) => setStatusEdit(event.target.value)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:border-slate-700 dark:bg-[var(--surface-dark)] dark:text-slate-100"
                  >
                    {STATUS_VENDA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {formatStatus(opt)}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={atualizarStatusMutation.isPending || statusEdit === venda.status_venda}
                    onClick={handleAtualizarStatus}
                  >
                    {atualizarStatusMutation.isPending ? "Atualizando..." : "Atualizar"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <Card variant="default" className={cardSurfaceClass}>
            <Card.Header title="Informações do cliente" />
            <Card.Body className="space-y-3 text-sm">
              <div>
                <span className={labelMutedClass}>Nome</span>
                <p className={valueStrongClass}>{venda.cliente_nome}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className={labelMutedClass}>CPF/CNPJ</span>
                  <p className={valueStrongClass}>{venda.cliente_cpf_cnpj}</p>
                </div>
                <div>
                  <span className={labelMutedClass}>Telefone</span>
                  <p className={valueStrongClass}>
                    {venda.cliente_telefone || "—"}
                  </p>
                </div>
              </div>
              <div>
                <span className={labelMutedClass}>E-mail</span>
                <p className={valueStrongClass}>
                  {venda.cliente_email || "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Endereço</span>
                <p className={`${valueStrongClass} whitespace-pre-line`}>
                  {venda.cliente_endereco || "—"}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="default" className={cardSurfaceClass}>
            <Card.Header title="Dados do veículo e loja" />
            <Card.Body className="space-y-3 text-sm">
              <div>
                <span className={labelMutedClass}>Veículo</span>
                <p className={valueStrongClass}>
                  {venda.veiculo?.modelo?.nome ?? "Não informado"}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className={labelMutedClass}>Placa</span>
                  <p className={valueStrongClass}>
                    {venda.veiculo?.placa ?? "—"}
                  </p>
                </div>
                <div>
                  <span className={labelMutedClass}>Loja responsável</span>
                  <p className={valueStrongClass}>
                    {venda.loja?.nome ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className={labelMutedClass}>Forma de pagamento</span>
                  <p className={valueStrongClass}>
                    {formatStatus(venda.forma_pagamento)}
                  </p>
                </div>
                <div>
                  <span className={labelMutedClass}>Entrada</span>
                  <p className={valueStrongClass}>
                    {venda.preco_entrada ? formatCurrency(venda.preco_entrada) : "—"}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card variant="default" className={cardSurfaceClass}>
            <Card.Header title="Financiamento e parcelas" />
            <Card.Body className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className={labelMutedClass}>Valor financiado</span>
                <p className={valueStrongClass}>
                  {venda.valor_financiado ? formatCurrency(venda.valor_financiado) : "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Nº de parcelas</span>
                <p className={valueStrongClass}>
                  {venda.numero_parcelas ?? "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Valor da parcela</span>
                <p className={valueStrongClass}>
                  {venda.valor_parcela ? formatCurrency(venda.valor_parcela) : "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Instituição financeira</span>
                <p className={valueStrongClass}>
                  {venda.instituicao_financeira ?? "—"}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="default" className={cardSurfaceClass}>
            <Card.Header title="Seguro e comissões" />
            <Card.Body className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className={labelMutedClass}>Seguro contratado</span>
                <p className={valueStrongClass}>
                  {venda.tem_seguro ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Seguradora</span>
                <p className={valueStrongClass}>
                  {venda.seguradora ?? "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Valor do seguro</span>
                <p className={valueStrongClass}>
                  {venda.valor_seguro ? formatCurrency(venda.valor_seguro) : "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Comissão do vendedor</span>
                <p className={valueStrongClass}>
                  {venda.comissao_vendedor ? formatCurrency(venda.comissao_vendedor) : "—"}
                </p>
              </div>
              <div>
                <span className={labelMutedClass}>Comissão da loja</span>
                <p className={valueStrongClass}>
                  {venda.comissao_loja ? formatCurrency(venda.comissao_loja) : "—"}
                </p>
              </div>
            </Card.Body>
          </Card>
        </section>

        <Card variant="default" className={cardSurfaceClass}>
          <Card.Header title="Entrega e observações" />
          <Card.Body className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <span className={labelMutedClass}>Previsão de entrega</span>
              <p className={valueStrongClass}>
                {venda.data_previsao_entrega ? formatDate(venda.data_previsao_entrega) : "—"}
              </p>
            </div>
            <div>
              <span className={labelMutedClass}>Entregue em</span>
              <p className={valueStrongClass}>
                {venda.data_entrega ? formatDate(venda.data_entrega) : "—"}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className={labelMutedClass}>Observações</span>
              <p className={`${valueStrongClass} whitespace-pre-line`}>
                {venda.observacoes ?? "Nenhuma observação registrada."}
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default function VendaDetalhePage() {
  return (
    <PagePermissionGuard permission={Permission.VENDAS_VISUALIZAR}>
      <VendaDetalheContent />
    </PagePermissionGuard>
  );
}
