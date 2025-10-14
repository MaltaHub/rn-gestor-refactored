'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Edit2, X, Save } from "lucide-react";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { useCaracteristicas, useLocais, useModelos, useLojas } from "@/hooks/use-configuracoes";
import { atualizarVeiculo, calcularDiffCaracteristicas } from "@/services/estoque";
import { useQueryClient } from "@tanstack/react-query";
import { PhotoGallery } from "@/components/Gallery";
import { LojaSelector } from "@/components/LojaSelector";
import { supabase } from "@/lib/supabase";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";
import { useLojaStore } from "@/stores/useLojaStore";
import { Button } from "@/components/ui/button";

type EstadoVendaOption = VeiculoUI["estado_venda"];
type EstadoVeiculoOption = NonNullable<VeiculoUI["estado_veiculo"]>;
type CaracteristicaFormValue = { id: string; nome: string };

const ESTADO_VENDA_OPTIONS: EstadoVendaOption[] = [
  "disponivel", "reservado", "vendido", "repassado", "restrito",
];

const ESTADO_VEICULO_OPTIONS: EstadoVeiculoOption[] = [
  "novo", "seminovo", "usado", "sucata", "limpo", "sujo",
];

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const sortEnumOptions = <T extends string>(options: readonly T[]) =>
  [...options].sort((a, b) =>
    formatEnumLabel(a).localeCompare(formatEnumLabel(b), "pt-BR")
  );

interface VehicleFormState {
  placa: string;
  cor: string;
  chassi: string;
  ano_fabricacao: string;
  ano_modelo: string;
  hodometro: string;
  estado_venda: EstadoVendaOption;
  estado_veiculo: EstadoVeiculoOption | "";
  preco_venal: string;
  observacao: string;
  modelo_id: string;
  local_id: string;
  estagio_documentacao: string;
  caracteristicas: CaracteristicaFormValue[];
}

const buildFormStateFromVeiculo = (v: VeiculoUI): VehicleFormState => ({
  placa: v.placa ?? "",
  cor: v.cor ?? "",
  chassi: v.chassi ?? "",
  ano_fabricacao: v.ano_fabricacao?.toString() ?? "",
  ano_modelo: v.ano_modelo?.toString() ?? "",
  hodometro: v.hodometro?.toString() ?? "",
  estado_venda: v.estado_venda,
  estado_veiculo: v.estado_veiculo ?? "",
  preco_venal: v.preco_venal?.toString() ?? "",
  observacao: v.observacao ?? "",
  modelo_id: v.modelo_id ?? v.modelo?.id ?? "",
  local_id: v.local_id ?? v.local?.id ?? "",
  estagio_documentacao: v.estagio_documentacao ?? "",
  caracteristicas:
    v.caracteristicas?.map((c) => ({ id: c.id, nome: c.nome })) ?? [],
});

function isVeiculoUI(value: unknown): value is VeiculoUI {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<VeiculoUI>;
  return typeof v.id === "string" && typeof v.placa === "string";
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "—";
  return currencyFormatter.format(value);
}

function formatNumber(value?: number | null, suffix = "") {
  if (typeof value !== "number") return "—";
  const formatted = value.toLocaleString("pt-BR");
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatEnum(value?: string | null) {
  if (!value) return "Não informado";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

function formatText(value?: string | null) {
  if (!value) return "—";
  return value;
}

const sectionClasses =
  "rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg";
const inputBaseClasses =
  "rounded-md border border-[var(--border-default)] bg-[var(--surface-dark)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--purple-magic)] focus:ring-2 focus:ring-[var(--purple-magic)] focus:outline-none transition-all duration-150";
const checkboxClasses =
  "rounded border-[var(--border-default)] bg-[var(--surface-dark)] text-[var(--purple-magic)] focus:ring-[var(--purple-magic)] transition-all duration-150";

export default function VeiculoDetalhePage() {
  const params = useParams<{ id: string }>();
  const veiculoId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const { data: veiculoData, isLoading } = useVeiculosUI(veiculoId);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicasDisponiveis = [] } =
    useCaracteristicas() as { data: CaracteristicaFormValue[] };
  const queryClient = useQueryClient();
  const lojaSelecionadaId = useLojaStore((s) => s.lojaSelecionada?.id ?? null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState<VehicleFormState | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const veiculo = isVeiculoUI(veiculoData) ? veiculoData : null;

  const estadoVendaOptionsOrdenadas = useMemo(
    () => sortEnumOptions(ESTADO_VENDA_OPTIONS),
    []
  );

  const estadoVeiculoOptionsOrdenadas = useMemo(
    () => sortEnumOptions(ESTADO_VEICULO_OPTIONS),
    []
  );

  const caracteristicasOrdenadas = useMemo(
    () =>
      [...caracteristicasDisponiveis].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      ),
    [caracteristicasDisponiveis]
  );

  const lojaNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    lojas.forEach((l) => l.id && map.set(l.id, l.nome));
    return map;
  }, [lojas]);

  const alvoPreferencialId = lojaSelecionadaId ?? veiculo?.localLojaId ?? null;
  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertence = alvoPreferencialId ? local.loja_id === alvoPreferencialId : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertence ? 0 : local.loja_id ? 1 : 2;
        return { value: local.id, label, pertence, prioridade } as const;
      })
      .sort((a, b) => a.prioridade - b.prioridade || a.label.localeCompare(b.label, "pt-BR"));
  }, [locais, lojaNomePorId, alvoPreferencialId]);

  const modelosComNomeCompleto = useMemo(
    () =>
      modelos
        .map((m) => ({ ...m, nomeCompleto: buildModeloNomeCompletoOrDefault(m) }))
        .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto, "pt-BR")),
    [modelos]
  );

  const modeloSelecionado = useMemo(
    () => modelosComNomeCompleto.find((m) => m.id === formState?.modelo_id) ?? null,
    [formState?.modelo_id, modelosComNomeCompleto]
  );

  // Inicializa o formulário quando o veículo carregou ou mudou de id.
  // Evita laço de atualização quando o objeto "veiculo" muda de identidade a cada render.
  useEffect(() => {
    if (!veiculo) return;
    setFormState(buildFormStateFromVeiculo(veiculo));
  }, [veiculo]);

  if (!veiculoId) {
    return (
      <div className="bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Veículo inválido</h1>
          <p className="text-sm text-[var(--text-secondary)]">Não foi possível identificar o veículo solicitado.</p>
          <Link className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--purple-magic)]" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  if (isLoading || !formState) {
    return (
      <div className="bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-[var(--text-secondary)]">Carregando informações do veículo...</p>
        </main>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="bg-[var(--surface-dark)] px-6 py-10 text-[var(--foreground)]">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Veículo não encontrado</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            O veículo solicitado não está disponível ou foi removido do estoque.
          </p>
          <Link className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--purple-magic)]" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  const handleChange =
    (field: keyof VehicleFormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormState((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  const handleToggleCaracteristica = (c: CaracteristicaFormValue) =>
    setFormState((prev) =>
      prev
        ? {
          ...prev,
          caracteristicas: prev.caracteristicas.some((x) => x.id === c.id)
            ? prev.caracteristicas.filter((x) => x.id !== c.id)
            : [...prev.caracteristicas, c],
        }
        : prev
    );

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.reportValidity() || !formState) {
      setFeedback({ type: "error", message: "Preencha todos os campos obrigatórios." });
      return;
    }

    try {
      setIsSaving(true);
      const toNumberOrNull = (v: string) =>
        v.trim() === "" ? null : isNaN(Number(v)) ? null : Number(v);
      const toValueOrNull = (v: string) => (v.trim() === "" ? null : v);
      const hodometro = Number(formState.hodometro.trim());
      if (isNaN(hodometro)) throw new Error("Informe um valor numérico válido para o hodômetro.");

      const { adicionar, remover } = calcularDiffCaracteristicas(
        veiculo.caracteristicas ?? [],
        formState.caracteristicas
      );

      const payload: Parameters<typeof atualizarVeiculo>[1] = {
        placa: formState.placa,
        cor: formState.cor,
        chassi: toValueOrNull(formState.chassi),
        ano_fabricacao: toNumberOrNull(formState.ano_fabricacao),
        ano_modelo: toNumberOrNull(formState.ano_modelo),
        hodometro,
        estado_venda: formState.estado_venda,
        estado_veiculo: formState.estado_veiculo || null,
        preco_venal: toNumberOrNull(formState.preco_venal),
        observacao: toValueOrNull(formState.observacao),
        modelo_id: formState.modelo_id || null,
        local_id: formState.local_id || null,
        estagio_documentacao: toValueOrNull(formState.estagio_documentacao),
        adicionar_caracteristicas: adicionar,
        remover_caracteristicas: remover,
      };

      await atualizarVeiculo(veiculo.id, payload);
      invalidateVeiculos(queryClient);
      setFeedback({ type: "success", message: "✅ Dados atualizados com sucesso!" });
      setIsEditMode(false);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar veículo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (veiculo) {
      setFormState(buildFormStateFromVeiculo(veiculo));
    }
    setFeedback(null);
  };

  const marca = veiculo.modelo?.marca ?? "Marca não informada";
  const modeloNome = veiculo.modelo?.nome ?? "Modelo não informado";

  return (
    <div className="relative min-h-screen bg-[var(--surface-dark)] pb-24 text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-[var(--border-default)] pb-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--foreground)]">
              {formatEnum(veiculo.estado_venda)}
            </span>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {marca} {modeloNome}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Placa {veiculo.placa} • Chassi {veiculo.chassi || "—"}
            </p>
          </div>

          <div className="flex gap-2">
            {!isEditMode ? (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Edit2 className="w-4 h-4" />}
                onClick={() => setIsEditMode(true)}
              >
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={() => {
                    const form = document.getElementById('form-editar-veiculo') as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            )}
            <Button variant="ghost" size="md" asChild>
              <Link href="/estoque">Voltar</Link>
            </Button>
          </div>
        </header>

        {feedback && (
          <div
            className={`rounded-md px-4 py-3 text-sm shadow-sm border ${feedback.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/40 bg-red-500/10 text-red-200"
              }`}
          >
            {feedback.message}
          </div>
        )}

        {!isEditMode ? (
          <ViewMode veiculo={veiculo} />
        ) : (
          <EditMode
            formState={formState}
            handleChange={handleChange}
            handleToggleCaracteristica={handleToggleCaracteristica}
            handleSubmit={handleSubmit}
            modelosComNomeCompleto={modelosComNomeCompleto}
            modeloSelecionado={modeloSelecionado}
            localOptions={localOptions}
            caracteristicasDisponiveis={caracteristicasOrdenadas}
            estadoVendaOptions={estadoVendaOptionsOrdenadas}
            estadoVeiculoOptions={estadoVeiculoOptionsOrdenadas}
          />
        )}

        {/* Loja e fotos */}
        <section className={sectionClasses}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className="text-[var(--foreground)] hover:text-[var(--purple-magic)]">•</span> Loja e fotos
          </h2>
          <div className="mt-4 space-y-6">
            <LojaSelector />
            <PhotoGallery
              veiculoId={veiculo.id}
              supabase={supabase}
              empresaId={veiculo.empresa_id}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ViewMode({ veiculo }: { veiculo: VeiculoUI }) {
  const informacoesGerais = [
    { label: "Ano fabricação", value: formatText(veiculo.ano_fabricacao?.toString()) },
    { label: "Ano modelo", value: formatText(veiculo.ano_modelo?.toString()) },
    { label: "Cor", value: formatText(veiculo.cor) },
    { label: "Hodômetro", value: formatNumber(veiculo.hodometro, "km") },
    { label: "Motor", value: formatText(veiculo.modelo?.motor) },
    { label: "Combustível", value: formatEnum(veiculo.modelo?.combustivel) },
    { label: "Câmbio", value: formatEnum(veiculo.modelo?.tipo_cambio) },
    { label: "Portas", value: formatText(veiculo.modelo?.portas?.toString()) },
    { label: "Lugares", value: formatText(veiculo.modelo?.lugares?.toString()) },
  ];

  const resumoSituacao = [
    { label: "Estado de venda", value: formatEnum(veiculo.estado_venda) },
    { label: "Estado do veículo", value: formatEnum(veiculo.estado_veiculo) },
    { label: "Situação da documentação", value: formatEnum(veiculo.estagio_documentacao) },
    { label: "Registrado em", value: formatDate(veiculo.registrado_em) },
    { label: "Última atualização", value: formatDate(veiculo.editado_em) },
  ];

  return (
    <>
      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Informações gerais</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {informacoesGerais.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{item.label}</dt>
              <dd className="mt-1 text-sm text-[var(--text-primary)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Situação</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {resumoSituacao.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{item.label}</dt>
              <dd className="mt-1 text-sm text-[var(--text-primary)]">{item.value}</dd>
            </div>
          ))}
        </dl>
        {veiculo.preco_venal && (
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <dt className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Preço vitrine</dt>
            <dd className="mt-1 text-2xl font-bold text-emerald-300">{formatCurrency(veiculo.preco_venal)}</dd>
          </div>
        )}
      </section>

      {veiculo.caracteristicas && veiculo.caracteristicas.length > 0 && (
        <section className={sectionClasses}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Características</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {veiculo.caracteristicas.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <span className="text-[var(--foreground)] hover:text-[var(--purple-magic)]">✓</span>
                {c.nome}
              </li>
            ))}
          </ul>
        </section>
      )}

      {veiculo.observacao && (
        <section className={sectionClasses}>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Observações</h2>
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{veiculo.observacao}</p>
        </section>
      )}
    </>
  );
}

function EditMode({
  formState,
  handleChange,
  handleToggleCaracteristica,
  handleSubmit,
  modelosComNomeCompleto,
  modeloSelecionado,
  localOptions,
  caracteristicasDisponiveis,
  estadoVendaOptions,
  estadoVeiculoOptions,
}: {
  formState: VehicleFormState;
  handleChange: (field: keyof VehicleFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleToggleCaracteristica: (c: CaracteristicaFormValue) => void;
  handleSubmit: React.FormEventHandler;
  modelosComNomeCompleto: Array<{ id?: string; marca: string; nome: string; nomeCompleto: string }>;
  modeloSelecionado: { id?: string; marca: string; nome: string; nomeCompleto: string } | null;
  localOptions: Array<{ value: string; label: string; pertence: boolean; prioridade: number }>;
  caracteristicasDisponiveis: CaracteristicaFormValue[];
  estadoVendaOptions: EstadoVendaOption[];
  estadoVeiculoOptions: EstadoVeiculoOption[];
}) {
  return (
    <form id="form-editar-veiculo" onSubmit={handleSubmit} className="space-y-6">
      {/* Dados principais */}
      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Dados principais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Placa</span>
            <input
              value={formState.placa.toLocaleUpperCase()}
              onChange={handleChange("placa")}
              className={`${inputBaseClasses} h-11`}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Chassi</span>
            <input
              value={formState.chassi}
              onChange={handleChange("chassi")}
              className={`${inputBaseClasses} h-11`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Cor</span>
            <input
              value={formState.cor}
              onChange={handleChange("cor")}
              className={`${inputBaseClasses} h-11`}
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text-primary)]">Observações</span>
          <textarea
            value={formState.observacao}
            onChange={handleChange("observacao")}
            className={`${inputBaseClasses} min-h-[150px] resize-y`}
            rows={4}
          />
        </label>
      </section>

      {/* Especificações */}
      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Especificações</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Ano de fabricação</span>
            <input
              type="number"
              value={formState.ano_fabricacao}
              onChange={handleChange("ano_fabricacao")}
              className={`${inputBaseClasses} h-11`}
              min={1900}
              max={9999}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Ano do modelo</span>
            <input
              type="number"
              value={formState.ano_modelo}
              onChange={handleChange("ano_modelo")}
              className={`${inputBaseClasses} h-11`}
              min={1900}
              max={9999}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Hodômetro</span>
            <input
              type="number"
              value={formState.hodometro}
              onChange={handleChange("hodometro")}
              className={`${inputBaseClasses} h-11`}
              min={0}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Preço venal</span>
            <input
              type="number"
              value={formState.preco_venal}
              onChange={handleChange("preco_venal")}
              className={`${inputBaseClasses} h-11`}
              min={0}
              step="0.01"
            />
          </label>
        </div>
      </section>

      {/* Status e localização */}
      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Status e localização</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Estado de venda</span>
            <select
              value={formState.estado_venda}
              onChange={handleChange("estado_venda")}
              className={`${inputBaseClasses} h-11`}
              required
            >
              {estadoVendaOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Estado do veículo</span>
            <select
              value={formState.estado_veiculo}
              onChange={handleChange("estado_veiculo")}
              className={`${inputBaseClasses} h-11`}
            >
              <option value="">Sem definição</option>
              {estadoVeiculoOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Estágio da documentação</span>
            <input
              value={formState.estagio_documentacao}
              onChange={handleChange("estagio_documentacao")}
              className={`${inputBaseClasses} h-11`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Modelo</span>
            <select
              value={formState.modelo_id}
              onChange={handleChange("modelo_id")}
              className={`${inputBaseClasses} h-11`}
            >
              <option value="">Selecione um modelo</option>
              {modelosComNomeCompleto
                .filter((modelo) => Boolean(modelo.id))
                .map((modelo) => (
                  <option key={modelo.id as string} value={modelo.id as string}>
                    {modelo.nomeCompleto}
                  </option>
                ))}
            </select>
            <span className="text-xs text-[var(--text-secondary)]">
              {formState.modelo_id
                ? modeloSelecionado?.nomeCompleto ?? "Modelo não encontrado nas configurações."
                : "Selecione um modelo para ver o nome completo."}
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Local</span>
            <select
              value={formState.local_id}
              onChange={handleChange("local_id")}
              className={`${inputBaseClasses} h-11`}
            >
              <option value="">Selecione um local</option>
              {localOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Características */}
      <section className={sectionClasses}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Características</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {caracteristicasDisponiveis.map((caracteristica) => (
            <li key={caracteristica.id}>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.caracteristicas.some(
                    (selecionada) => selecionada.id === caracteristica.id,
                  )}
                  onChange={() => handleToggleCaracteristica({
                    id: caracteristica.id,
                    nome: caracteristica.nome,
                  })}
                  className={checkboxClasses}
                />
                {caracteristica.nome}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </form>
  );
}
