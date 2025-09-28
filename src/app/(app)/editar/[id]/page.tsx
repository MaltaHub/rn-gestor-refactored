'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useConfiguracoesSnapshot } from "@/hooks/use-configuracoes";
import { useUpdateVeiculo, useVeiculo } from "@/hooks/use-veiculos";
import type { Veiculo } from "@/types/estoque";
import type { DocumentacaoVeiculo } from "@/types/supabase";
import type {
  EstadoVeiculo,
  EstadoVenda,
  StatusDocumentacao,
} from "@/types/supabase_enums";

const ESTADO_VENDA_OPTIONS: EstadoVenda[] = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
];

const ESTADO_VEICULO_OPTIONS: EstadoVeiculo[] = [
  "novo",
  "seminovo",
  "usado",
  "sucata",
  "limpo",
  "sujo",
];

const STATUS_DOCUMENTACAO_OPTIONS: StatusDocumentacao[] = [
  "pendente",
  "em_andamento",
  "aguardando_cliente",
  "aguardando_terceiros",
  "concluida",
  "com_pendencias",
  "bloqueada",
];

const DOCUMENTACAO_FLAG_FIELDS = [
  { key: "tem_multas", label: "Multas" },
  { key: "tem_manual", label: "Manual" },
  { key: "tem_chave_reserva", label: "Chave reserva" },
  { key: "tem_nf_compra", label: "Nota fiscal" },
  { key: "tem_crv", label: "CRV" },
  { key: "tem_crlv", label: "CRLV" },
  { key: "tem_dividas_ativas", label: "Dívidas ativas" },
  { key: "tem_restricoes", label: "Restrições" },
  { key: "transferencia_iniciada", label: "Transferência iniciada" },
  { key: "transferencia_concluida", label: "Transferência concluída" },
  { key: "vistoria_realizada", label: "Vistoria realizada" },
  { key: "aprovada_vistoria", label: "Vistoria aprovada" },
] satisfies Array<{ key: keyof DocumentacaoVeiculo; label: string }>;

type DocumentacaoFlagKey = (typeof DOCUMENTACAO_FLAG_FIELDS)[number]["key"];

interface VehicleFormState {
  placa: string;
  chassi: string;
  hodometro: string;
  cor: string;
  estado_venda: string;
  estado_veiculo: string;
  estagio_documentacao: string;
  ano_modelo: string;
  ano_fabricacao: string;
  preco_venal: string;
  observacao: string;
  modelo_id: string;
  local_id: string;
  loja_id: string;
  loja_preco: string;
  loja_data_entrada: string;
  documentacao_status: string;
  documentacao_flags: Record<DocumentacaoFlagKey, boolean>;
  documentacao_observacoes_gerais: string;
  documentacao_observacoes_multas: string;
  documentacao_observacoes_restricoes: string;
  caracteristicas_ids: string[];
}

const formatEnumLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const parseOptionalNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = Number(trimmed.replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(normalized) ? normalized : null;
};

const buildFormStateFromVeiculo = (veiculo: Veiculo): VehicleFormState => {
  const flags = DOCUMENTACAO_FLAG_FIELDS.reduce(
    (accumulator, field) => ({
      ...accumulator,
      [field.key]: Boolean(veiculo.documentacao?.[field.key] ?? false),
    }),
    {} as Record<DocumentacaoFlagKey, boolean>,
  );

  const caracteristicasIds = (veiculo.caracteristicas ?? [])
    .map((caracteristica) => caracteristica.id)
    .filter((id): id is string => Boolean(id));

  return {
    placa: veiculo.placa ?? "",
    chassi: veiculo.chassi ?? "",
    hodometro: veiculo.hodometro?.toString() ?? "",
    cor: veiculo.cor ?? "",
    estado_venda: veiculo.estado_venda ?? "disponivel",
    estado_veiculo: veiculo.estado_veiculo ?? "",
    estagio_documentacao: veiculo.estagio_documentacao ?? "",
    ano_modelo: veiculo.ano_modelo?.toString() ?? "",
    ano_fabricacao: veiculo.ano_fabricacao?.toString() ?? "",
    preco_venal: veiculo.preco_venal?.toString() ?? "",
    observacao: veiculo.observacao ?? "",
    modelo_id: veiculo.modelo_id ?? "",
    local_id: veiculo.local_id ?? "",
    loja_id: veiculo.loja?.loja_id ?? "",
    loja_preco: veiculo.loja?.preco != null ? veiculo.loja.preco.toString() : "",
    loja_data_entrada: veiculo.loja?.data_entrada ?? "",
    documentacao_status: veiculo.documentacao?.status_geral ?? "",
    documentacao_flags: flags,
    documentacao_observacoes_gerais:
      veiculo.documentacao?.observacoes_gerais ?? "",
    documentacao_observacoes_multas:
      veiculo.documentacao?.observacoes_multas ?? "",
    documentacao_observacoes_restricoes:
      veiculo.documentacao?.observacoes_restricoes ?? "",
    caracteristicas_ids: caracteristicasIds,
  };
};

export default function EditarVeiculoPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const veiculoId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const {
    data: veiculo,
    isLoading: isVeiculoLoading,
  } = useVeiculo(veiculoId, { enabled: Boolean(veiculoId) });
  const {
    data: configuracoes,
    isLoading: isConfiguracoesLoading,
  } = useConfiguracoesSnapshot();
  const updateMutation = useUpdateVeiculo();

  const [formState, setFormState] = useState<VehicleFormState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (veiculo && !formState) {
      setFormState(buildFormStateFromVeiculo(veiculo));
    }
  }, [veiculo, formState]);

  const modelos = useMemo(
    () =>
      [...(configuracoes?.modelos ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.modelos],
  );

  const lojas = useMemo(
    () =>
      [...(configuracoes?.lojas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.lojas],
  );

  const locais = useMemo(
    () =>
      [...(configuracoes?.locais ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.locais],
  );

  const caracteristicas = useMemo(
    () =>
      [...(configuracoes?.caracteristicas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.caracteristicas],
  );

  if (!veiculoId) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo inválido
          </h1>
          <p className="text-sm text-zinc-500">
            Não foi possível identificar o veículo solicitado para edição.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  if (isVeiculoLoading || isConfiguracoesLoading || !formState || !configuracoes) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-zinc-600">
            Carregando dados para edição do veículo...
          </p>
        </main>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo não encontrado
          </h1>
          <p className="text-sm text-zinc-500">
            O veículo solicitado não está disponível ou foi removido do estoque.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  const handleChange = (
    field: keyof VehicleFormState,
  ): React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> =>
    (event) => {
      const { value } = event.target;
      setFormState((previous) =>
        previous ? { ...previous, [field]: value } : previous,
      );
    };

  const handleToggleCaracteristica = (id: string) => {
    setFormState((previous) => {
      if (!previous) return previous;
      const alreadySelected = previous.caracteristicas_ids.includes(id);
      return {
        ...previous,
        caracteristicas_ids: alreadySelected
          ? previous.caracteristicas_ids.filter((item) => item !== id)
          : [...previous.caracteristicas_ids, id],
      };
    });
  };

  const handleDocumentacaoFlagChange = (
    key: DocumentacaoFlagKey,
  ): React.ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      const { checked } = event.target;
      setFormState((previous) =>
        previous
          ? {
              ...previous,
              documentacao_flags: {
                ...previous.documentacao_flags,
                [key]: checked,
              },
            }
          : previous,
      );
    };

  const buildPayload = () => {
    if (!formState) {
      return null;
    }

    const validationErrors: string[] = [];

    if (!formState.placa.trim()) {
      validationErrors.push("Informe a placa do veículo.");
    }

    const hodometroValue = parseOptionalNumber(formState.hodometro);
    if (hodometroValue == null) {
      validationErrors.push("Informe o hodômetro do veículo.");
    }

    if (!formState.estado_venda) {
      validationErrors.push("Selecione o estado de venda.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return null;
    }

    const documentacaoPayload: Partial<DocumentacaoVeiculo> = {
      status_geral: formState.documentacao_status || undefined,
      observacoes_gerais:
        formState.documentacao_observacoes_gerais.trim() || null,
      observacoes_multas:
        formState.documentacao_observacoes_multas.trim() || null,
      observacoes_restricoes:
        formState.documentacao_observacoes_restricoes.trim() || null,
    };

    documentacaoPayload.loja_id =
      formState.loja_id !== "" ? formState.loja_id : undefined;

    DOCUMENTACAO_FLAG_FIELDS.forEach(({ key }) => {
      documentacaoPayload[key] = formState.documentacao_flags[key] as never;
    });

    const payload = {
      placa: formState.placa.trim(),
      chassi: formState.chassi.trim() || null,
      hodometro: hodometroValue ?? undefined,
      cor: formState.cor.trim(),
      estado_venda: formState.estado_venda as EstadoVenda,
      estado_veiculo: formState.estado_veiculo
        ? (formState.estado_veiculo as EstadoVeiculo)
        : null,
      estagio_documentacao: formState.estagio_documentacao
        ? (formState.estagio_documentacao as StatusDocumentacao)
        : null,
      ano_modelo: parseOptionalNumber(formState.ano_modelo),
      ano_fabricacao: parseOptionalNumber(formState.ano_fabricacao),
      preco_venal: parseOptionalNumber(formState.preco_venal),
      observacao: formState.observacao.trim() || null,
      modelo_id: formState.modelo_id || null,
      local_id: formState.local_id || null,
      loja:
        formState.loja_id
          ? {
              id: veiculo.loja?.id,
              loja_id: formState.loja_id,
              preco: parseOptionalNumber(formState.loja_preco),
              data_entrada: formState.loja_data_entrada || null,
            }
          : null,
      documentacao: documentacaoPayload,
      caracteristicas_ids: formState.caracteristicas_ids,
    };

    return payload;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrors([]);
    setFeedback(null);

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: veiculo.id,
        data: payload,
      });
      setFeedback({
        type: "success",
        message: "Dados do veículo atualizados com sucesso.",
      });
      setFormState(buildFormStateFromVeiculo(updated));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao atualizar o veículo.",
      });
    }
  };

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
              Editar veículo
            </p>
            <h1 className="text-3xl font-semibold text-zinc-900">
              {veiculo.modelo?.marca ?? "Veículo"} {veiculo.modelo?.nome ?? "sem modelo"}
            </h1>
            <p className="text-sm text-zinc-500">
              Placa {veiculo.placa}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              href={`/estoque/${veiculo.id}`}
            >
              Ver detalhes
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
              href="/estoque"
            >
              Voltar ao estoque
            </Link>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {feedback && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-semibold">Corrija os campos antes de continuar:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Dados principais</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Placa</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.placa}
                  onChange={handleChange("placa")}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Chassi</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.chassi}
                  onChange={handleChange("chassi")}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Hodômetro (km)</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.hodometro}
                  onChange={handleChange("hodometro")}
                  required
                  inputMode="numeric"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Cor</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.cor}
                  onChange={handleChange("cor")}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Estado de venda</span>
                <select
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.estado_venda}
                  onChange={handleChange("estado_venda")}
                  required
                >
                  {ESTADO_VENDA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Estado do veículo</span>
                <select
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.estado_veiculo}
                  onChange={handleChange("estado_veiculo")}
                >
                  <option value="">Não informado</option>
                  {ESTADO_VEICULO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Ano modelo</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.ano_modelo}
                  onChange={handleChange("ano_modelo")}
                  inputMode="numeric"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Ano fabricação</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.ano_fabricacao}
                  onChange={handleChange("ano_fabricacao")}
                  inputMode="numeric"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-medium text-zinc-700">Modelo</span>
                <select
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.modelo_id}
                  onChange={handleChange("modelo_id")}
                >
                  <option value="">Selecionar modelo</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id ?? modelo.nome} value={modelo.id ?? ""}>
                      {modelo.marca} • {modelo.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-medium text-zinc-700">Observações</span>
                <textarea
                  className="min-h-[96px] rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.observacao}
                  onChange={handleChange("observacao")}
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Localização e valores</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Loja</span>
                <select
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.loja_id}
                  onChange={handleChange("loja_id")}
                >
                  <option value="">Sem loja responsável</option>
                  {lojas.map((loja) => (
                    <option key={loja.id ?? loja.nome} value={loja.id ?? ""}>
                      {loja.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Local físico</span>
                <select
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.local_id}
                  onChange={handleChange("local_id")}
                >
                  <option value="">Não informado</option>
                  {locais.map((local) => (
                    <option key={local.id ?? local.nome} value={local.id ?? ""}>
                      {local.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Preço vitrine (R$)</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.loja_preco}
                  onChange={handleChange("loja_preco")}
                  inputMode="decimal"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Data de entrada</span>
                <input
                  type="date"
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.loja_data_entrada}
                  onChange={handleChange("loja_data_entrada")}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Preço venal (R$)</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={formState.preco_venal}
                  onChange={handleChange("preco_venal")}
                  inputMode="decimal"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Documentação</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Status geral</span>
                  <select
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={formState.documentacao_status}
                    onChange={handleChange("documentacao_status")}
                  >
                    <option value="">Não informado</option>
                    {STATUS_DOCUMENTACAO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatEnumLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  {DOCUMENTACAO_FLAG_FIELDS.map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between gap-4">
                      <span className="text-zinc-600">{label}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formState.documentacao_flags[key]}
                        onChange={handleDocumentacaoFlagChange(key)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-zinc-700">Observações gerais</span>
                  <textarea
                    className="min-h-[72px] rounded-md border border-zinc-200 px-3 py-2 text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={formState.documentacao_observacoes_gerais}
                    onChange={handleChange("documentacao_observacoes_gerais")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-zinc-700">Observações de multas</span>
                  <textarea
                    className="min-h-[72px] rounded-md border border-zinc-200 px-3 py-2 text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={formState.documentacao_observacoes_multas}
                    onChange={handleChange("documentacao_observacoes_multas")}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-zinc-700">Observações de restrições</span>
                  <textarea
                    className="min-h-[72px] rounded-md border border-zinc-200 px-3 py-2 text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={formState.documentacao_observacoes_restricoes}
                    onChange={handleChange("documentacao_observacoes_restricoes")}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-800">Características</h2>
            {caracteristicas.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nenhuma característica cadastrada. Cadastre novas entradas na área de configurações.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {caracteristicas.map((caracteristica) => (
                  <li key={caracteristica.id ?? caracteristica.nome}>
                    <label className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formState.caracteristicas_ids.includes(
                          caracteristica.id ?? "",
                        )}
                        onChange={() =>
                          handleToggleCaracteristica(caracteristica.id ?? "")
                        }
                      />
                      <span>{caracteristica.nome}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              href={`/estoque/${veiculo.id}`}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
