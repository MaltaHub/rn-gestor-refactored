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
      <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto max-w-3xl text-center text-sm text-[var(--text-secondary)]">
          Identificador da venda inválido.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
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
      <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
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
      <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-6 w-48 animate-pulse rounded-md bg-white/10" />
          <div className="h-40 rounded-xl bg-white/5" />
          <div className="h-40 rounded-xl bg-white/5" />
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
    <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/vendas"
              className="text-sm font-medium text-[var(--purple-light)] hover:text-[var(--purple-bright)]"
            >
              ← Voltar para o painel
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
              Venda #{venda.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatDate(venda.data_venda)} • Valor {formatCurrency(venda.preco_venda)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              Status da venda
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {formatStatus(venda.status_venda)}
              </span>
              {podeEditarStatus && (
                <div className="flex items-center gap-2">
                  <select
                    value={statusEdit}
                    onChange={(event) => setStatusEdit(event.target.value)}
                    className="h-10 rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 text-sm focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
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
          <Card variant="default">
            <Card.Header title="Informações do cliente" />
            <Card.Body className="space-y-3 text-sm">
              <div>
                <span className="text-[var(--text-secondary)]">Nome</span>
                <p className="text-[var(--text-primary)] font-medium">{venda.cliente_nome}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className="text-[var(--text-secondary)]">CPF/CNPJ</span>
                  <p className="text-[var(--text-primary)] font-medium">{venda.cliente_cpf_cnpj}</p>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Telefone</span>
                  <p className="text-[var(--text-primary)] font-medium">
                    {venda.cliente_telefone || "—"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">E-mail</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.cliente_email || "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Endereço</span>
                <p className="text-[var(--text-primary)] font-medium whitespace-pre-line">
                  {venda.cliente_endereco || "—"}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="default">
            <Card.Header title="Dados do veículo e loja" />
            <Card.Body className="space-y-3 text-sm">
              <div>
                <span className="text-[var(--text-secondary)]">Veículo</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.veiculo?.modelo?.nome ?? "Não informado"}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className="text-[var(--text-secondary)]">Placa</span>
                  <p className="text-[var(--text-primary)] font-medium">
                    {venda.veiculo?.placa ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Loja responsável</span>
                  <p className="text-[var(--text-primary)] font-medium">
                    {venda.loja?.nome ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className="text-[var(--text-secondary)]">Forma de pagamento</span>
                  <p className="text-[var(--text-primary)] font-medium">
                    {formatStatus(venda.forma_pagamento)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Entrada</span>
                  <p className="text-[var(--text-primary)] font-medium">
                    {venda.preco_entrada ? formatCurrency(venda.preco_entrada) : "—"}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card variant="default">
            <Card.Header title="Financiamento e parcelas" />
            <Card.Body className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-[var(--text-secondary)]">Valor financiado</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.valor_financiado ? formatCurrency(venda.valor_financiado) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Nº de parcelas</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.numero_parcelas ?? "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Valor da parcela</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.valor_parcela ? formatCurrency(venda.valor_parcela) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Instituição financeira</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.instituicao_financeira ?? "—"}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="default">
            <Card.Header title="Seguro e comissões" />
            <Card.Body className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-[var(--text-secondary)]">Seguro contratado</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.tem_seguro ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Seguradora</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.seguradora ?? "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Valor do seguro</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.valor_seguro ? formatCurrency(venda.valor_seguro) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Comissão do vendedor</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.comissao_vendedor ? formatCurrency(venda.comissao_vendedor) : "—"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Comissão da loja</span>
                <p className="text-[var(--text-primary)] font-medium">
                  {venda.comissao_loja ? formatCurrency(venda.comissao_loja) : "—"}
                </p>
              </div>
            </Card.Body>
          </Card>
        </section>

        <Card variant="default">
          <Card.Header title="Entrega e observações" />
          <Card.Body className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="text-[var(--text-secondary)]">Previsão de entrega</span>
              <p className="text-[var(--text-primary)] font-medium">
                {venda.data_previsao_entrega ? formatDate(venda.data_previsao_entrega) : "—"}
              </p>
            </div>
            <div>
              <span className="text-[var(--text-secondary)]">Entregue em</span>
              <p className="text-[var(--text-primary)] font-medium">
                {venda.data_entrega ? formatDate(venda.data_entrega) : "—"}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-[var(--text-secondary)]">Observações</span>
              <p className="text-[var(--text-primary)] font-medium whitespace-pre-line">
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
