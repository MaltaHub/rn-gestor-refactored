'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { Permission } from "@/types/rbac";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useRegistrarVenda } from "@/hooks/use-vendas";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useLojaStore } from "@/stores/useLojaStore";

const FORMA_PAGAMENTO_OPTIONS = [
  "dinheiro",
  "pix",
  "transferencia",
  "cartao_credito",
  "cartao_debito",
  "financiamento",
  "consorcio",
  "misto",
] as const;

const STATUS_VENDA_OPTIONS = ["negociacao", "aprovada", "finalizada", "cancelada", "devolvida"] as const;

type FormaPagamento = (typeof FORMA_PAGAMENTO_OPTIONS)[number];
type StatusVenda = (typeof STATUS_VENDA_OPTIONS)[number];

const formatStatus = (value?: string | null) =>
  (value ?? "—")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type VeiculoOption = {
  id: string;
  display: string;
  precoVenal: number | null;
};

type LojaOption = {
  id: string;
  nome: string;
};

function NovaVendaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { data: membroEmpresa, isLoading: isLoadingEmpresa } = useEmpresaDoUsuario();
  const { mostrarToast } = useToast();
  const registrarVenda = useRegistrarVenda();
  const lojaSelecionadaStore = useLojaStore((state) => state.lojaSelecionada);

  const empresaId = membroEmpresa?.empresa_id ?? null;
  const lojaPadraoId = lojaSelecionadaStore?.id ?? null;
  const veiculoPrefill = searchParams.get("veiculoId");
  const precoLojaParamRaw = searchParams.get("preco");
  const precoLojaParamNumber =
    precoLojaParamRaw !== null && !Number.isNaN(Number(precoLojaParamRaw))
      ? Number(precoLojaParamRaw)
      : null;
  const precoLojaParamString = precoLojaParamNumber !== null ? String(precoLojaParamNumber) : "";
  const possuiPrecoParam = precoLojaParamNumber !== null;

  const [veiculos, setVeiculos] = useState<VeiculoOption[]>([]);
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [carregandoAux, setCarregandoAux] = useState(true);

  const [formState, setFormState] = useState({
    veiculo_id: veiculoPrefill ?? "",
    loja_id: lojaPadraoId ?? "",
    cliente_nome: "",
    cliente_cpf_cnpj: "",
    cliente_telefone: "",
    cliente_email: "",
    cliente_endereco: "",
    preco_venda: precoLojaParamString,
    preco_entrada: "",
    valor_financiado: "",
    numero_parcelas: "",
    valor_parcela: "",
    forma_pagamento: "dinheiro" as FormaPagamento,
    status_venda: "negociacao" as StatusVenda,
    observacoes: "",
    tem_seguro: false,
    seguradora: "",
    valor_seguro: "",
    comissao_loja: "",
    comissao_vendedor: "",
    instituicao_financeira: "",
    data_previsao_entrega: "",
    data_entrega: "",
  });

  useEffect(() => {
    if (!empresaId) {
      setVeiculos([]);
      setLojas([]);
      setCarregandoAux(false);
      return;
    }

    let ativo = true;
    setCarregandoAux(true);

    async function carregarDadosAuxiliares() {
      try {
        const [veiculosRes, lojasRes] = await Promise.all([
          supabase
            .from("veiculos")
            .select("id, placa, preco_venal, modelo: modelos ( nome )")
            .eq("empresa_id", empresaId)
            .order("registrado_em", { ascending: false }),
          supabase
            .from("lojas")
            .select("id, nome")
            .eq("empresa_id", empresaId)
            .order("nome", { ascending: true }),
        ]);

        if (!ativo) return;

        if (veiculosRes.error) throw veiculosRes.error;
        if (lojasRes.error) throw lojasRes.error;

        const veiculosList: VeiculoOption[] =
          (veiculosRes.data ?? []).map((item) => {
            const modeloRelation = (item as any).modelo;
            const modeloNome = Array.isArray(modeloRelation)
              ? modeloRelation[0]?.nome
              : modeloRelation?.nome;
            const precoVenal = typeof (item as any).preco_venal === "number" ? (item as any).preco_venal : null;
            return {
              id: item.id,
              display: `${modeloNome ?? "Modelo"} • ${item.placa ?? "sem placa"}`,
              precoVenal,
            };
          }) ?? [];

        const lojasList: LojaOption[] =
          (lojasRes.data ?? []).map((item) => ({
            id: item.id,
            nome: item.nome,
          })) ?? [];

        setVeiculos(veiculosList);
        setLojas(lojasList);
      } catch (error) {
        console.error("[Vendas] Erro ao carregar dados auxiliares:", error);
        mostrarToast({
          titulo: "Erro",
          mensagem: "Não foi possível carregar veículos ou lojas.",
          tipo: "error",
        });
      } finally {
        if (ativo) setCarregandoAux(false);
      }
    }

    carregarDadosAuxiliares();
    return () => {
      ativo = false;
    };
  }, [empresaId, mostrarToast]);

  useEffect(() => {
    if (lojaPadraoId && !formState.loja_id) {
      setFormState((prev) => ({ ...prev, loja_id: lojaPadraoId }));
    }
  }, [lojaPadraoId, formState.loja_id]);

  useEffect(() => {
    if (!formState.veiculo_id || possuiPrecoParam) return;
    const selecionado = veiculos.find((item) => item.id === formState.veiculo_id);
    if (!selecionado) return;
    setFormState((prev) => {
      if (prev.preco_venda.trim() !== "" || prev.veiculo_id !== formState.veiculo_id) {
        return prev;
      }
      return {
        ...prev,
        preco_venda: selecionado.precoVenal !== null ? String(selecionado.precoVenal) : "",
      };
    });
  }, [formState.veiculo_id, possuiPrecoParam, veiculos]);

  const veiculoSelecionado = useMemo(
    () => veiculos.find((item) => item.id === formState.veiculo_id) ?? null,
    [veiculos, formState.veiculo_id]
  );
  const precoVendaAtualNumber = Number(formState.preco_venda);
  const precoVenalReferencia = veiculoSelecionado?.precoVenal ?? null;
  const precoAbaixoVenal =
    precoVenalReferencia !== null &&
    Number.isFinite(precoVendaAtualNumber) &&
    precoVendaAtualNumber < precoVenalReferencia;

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!empresaId || !user?.id) {
      mostrarToast({
        titulo: "Erro",
        mensagem: "Informações da empresa ou usuário não encontradas.",
        tipo: "error",
      });
      return;
    }

    const veiculoId = formState.veiculo_id.trim();
    const lojaId = formState.loja_id.trim();
    const clienteNome = formState.cliente_nome.trim();
    const clienteDocumento = formState.cliente_cpf_cnpj.trim();
    const precoVendaNumber = Number(formState.preco_venda);

    if (!veiculoId || !lojaId || !clienteNome || !clienteDocumento || !formState.preco_venda) {
      mostrarToast({
        titulo: "Campos obrigatórios",
        mensagem: "Preencha veículo, loja, nome do cliente, documento e valor da venda.",
        tipo: "warning",
      });
      return;
    }

    if (!Number.isFinite(precoVendaNumber) || precoVendaNumber <= 0) {
      mostrarToast({
        titulo: "Valor inválido",
        mensagem: "Informe um valor de venda numérico maior que zero.",
        tipo: "warning",
      });
      return;
    }

    const MAX_NUMERIC_ABS = 99_999_999.99;
    if (Math.abs(precoVendaNumber) > MAX_NUMERIC_ABS) {
      mostrarToast({
        titulo: "Valor muito alto",
        mensagem: "O valor da venda ultrapassa o limite permitido (99.999.999,99).",
        tipo: "warning",
      });
      return;
    }

    const parseOptionalNumber = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return { value: null, empty: true, valid: true };
      }
      const normalized = Number(trimmed.replace(",", "."));
      if (!Number.isFinite(normalized)) {
        return { value: null, empty: false, valid: false };
      }
      if (Math.abs(normalized) > MAX_NUMERIC_ABS) {
        return { value: null, empty: false, valid: false, overflow: true };
      }
      return { value: normalized, empty: false, valid: true };
    };

    try {
      const precoEntradaParsed = parseOptionalNumber(formState.preco_entrada);
      if (!precoEntradaParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: precoEntradaParsed.overflow
            ? "O valor de entrada ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para a entrada.",
          tipo: "error",
        });
        return;
      }

      const valorFinanciadoParsed = parseOptionalNumber(formState.valor_financiado);
      if (!valorFinanciadoParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: valorFinanciadoParsed.overflow
            ? "O valor financiado ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para o montante financiado.",
          tipo: "error",
        });
        return;
      }

      const numeroParcelasParsed = parseOptionalNumber(formState.numero_parcelas);
      if (!numeroParcelasParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: "Informe um número válido de parcelas.",
          tipo: "error",
        });
        return;
      }

      const valorParcelaParsed = parseOptionalNumber(formState.valor_parcela);
      if (!valorParcelaParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: valorParcelaParsed.overflow
            ? "O valor da parcela ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para cada parcela.",
          tipo: "error",
        });
        return;
      }

      const valorSeguroParsed = parseOptionalNumber(formState.valor_seguro);
      if (!valorSeguroParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: valorSeguroParsed.overflow
            ? "O valor do seguro ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para o seguro.",
          tipo: "error",
        });
        return;
      }

      const comissaoLojaParsed = parseOptionalNumber(formState.comissao_loja);
      const comissaoVendedorParsed = parseOptionalNumber(formState.comissao_vendedor);
      const valorEntrada = precoEntradaParsed.value ?? 0;
      const valorFinanciado = valorFinanciadoParsed.value ?? 0;

      if (!comissaoLojaParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: comissaoLojaParsed.overflow
            ? "A comissão da loja ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para a comissão da loja.",
          tipo: "error",
        });
        return;
      }

      if (!comissaoVendedorParsed.valid) {
        mostrarToast({
          titulo: "Valor inválido",
          mensagem: comissaoVendedorParsed.overflow
            ? "A comissão do vendedor ultrapassa o limite permitido (99.999.999,99)."
            : "Informe um valor numérico válido para a comissão do vendedor.",
          tipo: "error",
        });
        return;
      }

      if (valorEntrada + valorFinanciado > precoVendaNumber) {
        mostrarToast({
          titulo: "Valores inconsistentes",
          mensagem: "Entrada + financiamento não pode ser maior que o valor da venda.",
          tipo: "error",
        });
        return;
      }

      const payload = {
        empresa_id: empresaId,
        veiculo_id: veiculoId,
        loja_id: lojaId,
        vendedor_id: user.id,
        criado_por: user.id,
        data_venda: new Date().toISOString(),
        forma_pagamento: formState.forma_pagamento,
        status_venda: formState.status_venda,
        cliente_nome: clienteNome,
        cliente_cpf_cnpj: clienteDocumento,
        cliente_email: formState.cliente_email.trim() || null,
        cliente_telefone: formState.cliente_telefone.trim() || null,
        cliente_endereco: formState.cliente_endereco.trim() || null,
        preco_venda: precoVendaNumber,
        preco_entrada: valorEntrada,
        valor_financiado: valorFinanciado,
        numero_parcelas: numeroParcelasParsed.value,
        valor_parcela: valorParcelaParsed.value,
        tem_seguro: formState.tem_seguro,
        seguradora: formState.tem_seguro ? formState.seguradora.trim() || null : null,
        valor_seguro: formState.tem_seguro ? valorSeguroParsed.value : null,
        comissao_loja: comissaoLojaParsed.valid ? comissaoLojaParsed.value : null,
        comissao_vendedor: comissaoVendedorParsed.valid ? comissaoVendedorParsed.value : null,
        instituicao_financeira: formState.instituicao_financeira.trim() || null,
        observacoes: formState.observacoes.trim() || null,
        data_previsao_entrega: formState.data_previsao_entrega || null,
        data_entrega: formState.data_entrega || null,
      };

      const resultado = await registrarVenda.mutateAsync(payload);
      mostrarToast({
        titulo: "Sucesso!",
        mensagem: "Venda registrada com sucesso.",
        tipo: "success",
      });
      router.replace(`/vendas/${resultado.id}`);
    } catch (error) {
      console.error("[Vendas] Erro ao registrar venda:", error);
      mostrarToast({
        titulo: "Erro",
        mensagem: error instanceof Error ? error.message : "Não foi possível salvar a venda.",
        tipo: "error",
      });
    }
  };

  const lojaSelecionadaItem = lojas.find((item) => item.id === formState.loja_id) ?? null;

  if (isLoadingEmpresa && !empresaId) {
    return (
      <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-36 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <Link href="/vendas" className="text-sm font-medium text-[var(--purple-light)] hover:text-[var(--purple-bright)]">
            ← Voltar para o painel
          </Link>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Registrar nova venda</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Preencha os dados da venda e confirme para gerar a ficha completa.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="default">
            <Card.Header
              title="Informações do veículo"
              subtitle="Selecione o veículo e a loja de origem."
            />
            <Card.Body className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Veículo</span>
                  <select
                    value={formState.veiculo_id}
                    onChange={handleChange("veiculo_id")}
                    className="h-11 rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 text-sm focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                    required
                    disabled={carregandoAux}
                  >
                    <option value="">{carregandoAux ? "Carregando..." : "Selecione um veículo"}</option>
                    {veiculos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.display}
                      </option>
                    ))}
                  </select>
                  {veiculoSelecionado && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      Selecionado: {veiculoSelecionado.display}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Loja responsável</span>
                  <select
                    value={formState.loja_id}
                    onChange={handleChange("loja_id")}
                    className="h-11 rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 text-sm focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                    required
                    disabled={carregandoAux}
                  >
                    <option value="">{carregandoAux ? "Carregando..." : "Selecione a loja"}</option>
                    {lojas.map((loja) => (
                      <option key={loja.id} value={loja.id}>
                        {loja.nome}
                      </option>
                    ))}
                  </select>
                  {lojaSelecionadaItem && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {lojaSelecionadaItem.nome}
                    </span>
                  )}
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Preço da venda (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formState.preco_venda}
                    onChange={handleChange("preco_venda")}
                    placeholder="Ex: 85000"
                    className={precoAbaixoVenal ? "border-red-400 focus:border-red-500 focus:ring-red-500/50" : undefined}
                  />
                  {precoVenalReferencia !== null && (
                    <span
                      className={`text-xs ${
                        precoAbaixoVenal ? "text-red-400" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Preço venal: {formatCurrency(precoVenalReferencia)}
                      {precoAbaixoVenal && " — abaixo do recomendado"}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Entrada (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.preco_entrada}
                    onChange={handleChange("preco_entrada")}
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Forma de pagamento</span>
                  <select
                    value={formState.forma_pagamento}
                    onChange={handleChange("forma_pagamento")}
                    className="h-11 rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 text-sm focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                  >
                    {FORMA_PAGAMENTO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {formatStatus(opt)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </Card.Body>
          </Card>

          <Card variant="default">
            <Card.Header
              title="Dados do cliente"
              subtitle="Informações obrigatórias para emissão e contato."
            />
            <Card.Body className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Nome completo</span>
                  <Input
                    value={formState.cliente_nome}
                    onChange={handleChange("cliente_nome")}
                    placeholder="Nome do cliente"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">CPF ou CNPJ</span>
                  <Input
                    value={formState.cliente_cpf_cnpj}
                    onChange={handleChange("cliente_cpf_cnpj")}
                    placeholder="000.000.000-00"
                    required
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Telefone</span>
                  <Input
                    value={formState.cliente_telefone}
                    onChange={handleChange("cliente_telefone")}
                    placeholder="(00) 90000-0000"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">E-mail</span>
                  <Input
                    type="email"
                    value={formState.cliente_email}
                    onChange={handleChange("cliente_email")}
                    placeholder="cliente@email.com"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Status da venda</span>
                  <select
                    value={formState.status_venda}
                    onChange={handleChange("status_venda")}
                    className="h-11 rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 text-sm focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                  >
                    {STATUS_VENDA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {formatStatus(opt)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-primary)]">Endereço</span>
                <textarea
                  rows={2}
                  value={formState.cliente_endereco}
                  onChange={handleChange("cliente_endereco")}
                  placeholder="Rua, número, bairro, cidade..."
                  className="min-h-[88px] w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                />
              </label>
            </Card.Body>
          </Card>

          <Card variant="default">
            <Card.Header
              title="Financiamento e seguro"
              subtitle="Informe dados de financiamento, parcelas e coberturas."
            />
            <Card.Body className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Valor financiado (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.valor_financiado}
                    onChange={handleChange("valor_financiado")}
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Nº de parcelas</span>
                  <Input
                    type="number"
                    min="0"
                    value={formState.numero_parcelas}
                    onChange={handleChange("numero_parcelas")}
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Valor da parcela (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.valor_parcela}
                    onChange={handleChange("valor_parcela")}
                    placeholder="Opcional"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={formState.tem_seguro}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, tem_seguro: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border border-[var(--border-default)] bg-[var(--surface-dark)] text-[var(--purple-magic)] focus:ring-[var(--purple-magic)]"
                  />
                  Venda inclui seguro
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Instituição financeira</span>
                  <Input
                    value={formState.instituicao_financeira}
                    onChange={handleChange("instituicao_financeira")}
                    placeholder="Banco, financeira..."
                  />
                </label>
              </div>
              {formState.tem_seguro && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">Seguradora</span>
                    <Input
                      value={formState.seguradora}
                      onChange={handleChange("seguradora")}
                      placeholder="Nome da seguradora"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">Valor do seguro (R$)</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.valor_seguro}
                      onChange={handleChange("valor_seguro")}
                      placeholder="Opcional"
                    />
                  </label>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card variant="default">
            <Card.Header
              title="Comissões e entrega"
              subtitle="Controle de comissões e prazos de entrega."
            />
            <Card.Body className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Comissão da loja (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.comissao_loja}
                    onChange={handleChange("comissao_loja")}
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Comissão do vendedor (R$)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.comissao_vendedor}
                    onChange={handleChange("comissao_vendedor")}
                    placeholder="Opcional"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Previsão de entrega</span>
                  <Input
                    type="date"
                    value={formState.data_previsao_entrega}
                    onChange={handleChange("data_previsao_entrega")}
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Entrega realizada em</span>
                  <Input
                    type="date"
                    value={formState.data_entrega}
                    onChange={handleChange("data_entrega")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--text-primary)]">Observações</span>
                  <textarea
                    rows={3}
                    value={formState.observacoes}
                    onChange={handleChange("observacoes")}
                    placeholder="Informações adicionais, condições especiais, etc."
                    className="min-h-[96px] w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)]"
                  />
                </label>
              </div>
            </Card.Body>
            <Card.Footer align="between">
              <div className="text-xs text-[var(--text-secondary)]">
                Valor total da venda:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {formState.preco_venda ? formatCurrency(Number(formState.preco_venda)) : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={registrarVenda.isPending}>
                  {registrarVenda.isPending ? "Salvando..." : "Registrar venda"}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function NovaVendaPage() {
  return (
    <PagePermissionGuard permission={Permission.VENDAS_CRIAR}>
      <NovaVendaContent />
    </PagePermissionGuard>
  );
}
