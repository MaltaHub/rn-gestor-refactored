"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { invalidateVeiculos } from "@/hooks/use-estoque";
import { useCaracteristicas, useLocais, useModelos, useLojas } from "@/hooks/use-configuracoes";
import { criarVeiculo } from "@/services/estoque";
import type { Modelo } from "@/types";
import type { VeiculoResumo } from "@/types/estoque";
import { useQueryClient } from "@tanstack/react-query";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";
import { useLojaStore } from "@/stores/useLojaStore";

type EstadoVendaOption = VeiculoResumo["estado_venda"];
type EstadoVeiculoOption = NonNullable<VeiculoResumo["estado_veiculo"]>;
type CaracteristicaFormValue = { id: string; nome: string };

type VehicleFormState = {
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
};

const ESTADO_VENDA_OPTIONS: EstadoVendaOption[] = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
];

const ESTADO_VEICULO_OPTIONS: EstadoVeiculoOption[] = [
  "novo",
  "seminovo",
  "usado",
  "sucata",
  "limpo",
  "sujo",
];

const DEFAULT_ESTADO_VENDA: EstadoVendaOption = "disponivel";

const INITIAL_FORM_STATE: VehicleFormState = {
  placa: "",
  cor: "",
  chassi: "",
  ano_fabricacao: "",
  ano_modelo: "",
  hodometro: "",
  estado_venda: DEFAULT_ESTADO_VENDA,
  estado_veiculo: "",
  preco_venal: "",
  observacao: "",
  modelo_id: "",
  local_id: "",
  estagio_documentacao: "",
  caracteristicas: [],
};

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function CriarVeiculoPage() {
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicasDisponiveis = [] } =
    useCaracteristicas() as { data: CaracteristicaFormValue[] };
  const queryClient = useQueryClient();

  const camposEspecificacoes: Array<{
    label: string;
    key: keyof Pick<
      VehicleFormState,
      "ano_fabricacao" | "ano_modelo" | "hodometro" | "preco_venal"
    >;
  }> = [
      { label: "Ano de fabricação", key: "ano_fabricacao" },
      { label: "Ano do modelo", key: "ano_modelo" },
      { label: "Hodômetro", key: "hodometro" },
      { label: "Preço venal", key: "preco_venal" },
    ];

  const [formState, setFormState] = useState<VehicleFormState>({ ...INITIAL_FORM_STATE });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  type ModeloComNomeCompleto = Modelo & { nomeCompleto: string };

  const modelosComNomeCompleto = useMemo<ModeloComNomeCompleto[]>(
    () =>
      modelos.map((modelo) => ({
        ...modelo,
        nomeCompleto: buildModeloNomeCompletoOrDefault(modelo),
      })),
    [modelos],
  );

  const modeloSelecionado = useMemo(() => {
    if (!formState.modelo_id) return null;
    return (
      modelosComNomeCompleto.find((modelo) => modelo.id === formState.modelo_id) ?? null
    );
  }, [formState.modelo_id, modelosComNomeCompleto]);

  const lojaSelecionadaId = useLojaStore((state) => state.lojaSelecionada?.id ?? null);

  const lojaNomePorId = useMemo(() => {
    const mapa = new Map<string, string>();
    lojas.forEach((loja) => {
      if (loja.id) {
        mapa.set(loja.id, loja.nome);
      }
    });
    return mapa;
  }, [lojas]);

  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertenceALojaSelecionada = lojaSelecionadaId
          ? local.loja_id === lojaSelecionadaId
          : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertenceALojaSelecionada ? 0 : local.loja_id ? 1 : 2;
        return {
          value: local.id,
          label,
          pertenceALojaSelecionada,
          prioridade,
        } as const;
      })
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
      });
  }, [locais, lojaNomePorId, lojaSelecionadaId]);

  const possuiUnidadeSelecionada = localOptions.some((option) => option.pertenceALojaSelecionada);

  const handleChange =
    (field: keyof VehicleFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleToggleCaracteristica = (caracteristica: CaracteristicaFormValue) => {
    setFormState((prev) => {
      const alreadySelected = prev.caracteristicas.some((c) => c.id === caracteristica.id);
      return {
        ...prev,
        caracteristicas: alreadySelected
          ? prev.caracteristicas.filter((c) => c.id !== caracteristica.id)
          : [...prev.caracteristicas, caracteristica],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // ✅ dispara a validação visual do navegador
    if (!form.reportValidity()) {
      setFeedback({
        type: "error",
        message: "Preencha todos os campos obrigatórios antes de salvar.",
      });
      return;
    }

    setIsSaving(true); // 👈 garante feedback de carregamento

    try {
      const toNumberOrNull = (value: string) => {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
      };

      const toValueOrNull = (value: string) => {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      };

      const hodometroValue = Number(formState.hodometro.trim());
      if (Number.isNaN(hodometroValue)) {
        throw new Error("Informe um valor numérico válido para o hodômetro.");
      }

      const estadoVeiculo =
        formState.estado_veiculo === "" ? null : formState.estado_veiculo;

      const caracteristicasSelecionadas = formState.caracteristicas.map((item) => ({
        id: item.id,
        nome: item.nome,
      }));

      const modeloId = formState.modelo_id.trim();
      const localId = formState.local_id.trim();

      const payload: Parameters<typeof criarVeiculo>[0] = {
        placa: formState.placa,
        cor: formState.cor,
        chassi: toValueOrNull(formState.chassi),
        ano_fabricacao: toNumberOrNull(formState.ano_fabricacao),
        ano_modelo: toNumberOrNull(formState.ano_modelo),
        hodometro: hodometroValue,
        estado_venda: formState.estado_venda,
        estado_veiculo: estadoVeiculo,
        preco_venal: toNumberOrNull(formState.preco_venal),
        observacao: toValueOrNull(formState.observacao),
        modelo_id: modeloId === "" ? null : modeloId,
        local_id: localId === "" ? null : localId,
        estagio_documentacao: toValueOrNull(formState.estagio_documentacao),
        caracteristicas: caracteristicasSelecionadas,
      };

      await criarVeiculo(payload);
      invalidateVeiculos(queryClient);

      setFeedback({
        type: "success",
        message: "✅ Veículo criado com sucesso!",
      });

      setFormState({ ...INITIAL_FORM_STATE });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao criar veículo. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="relative bg-zinc-50 min-h-screen pb-24">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 space-y-10">
        {/* Cabeçalho */}
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Cadastrar veículo
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Preencha as informações abaixo para adicionar um novo veículo.
          </p>
        </header>

        <form id="form-veiculo" onSubmit={handleSubmit} className="space-y-8">
          {/* Feedback visual */}
          {feedback && (
            <div
              className={`rounded-md px-4 py-3 text-sm shadow-sm ${feedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Seção: Dados principais */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <span className="text-blue-600">•</span> Dados principais
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Placa</span>
                <input
                  value={formState.placa.toLocaleUpperCase()}
                  onChange={handleChange("placa")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Chassi</span>
                <input
                  value={formState.chassi}
                  onChange={handleChange("chassi")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Cor</span>
                <input
                  value={formState.cor}
                  onChange={handleChange("cor")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </label>
            </div>

            <label className="mt-5 flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Observações</span>
              <textarea
                value={formState.observacao}
                onChange={handleChange("observacao")}
                className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                rows={4}
                placeholder="Ex: veículo revisado recentemente, pequenas avarias..."
              />
            </label>
          </section>

          {/* Seção: Especificações */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <span className="text-blue-600">•</span> Especificações
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {camposEspecificacoes.map((campo) => (
                <label key={campo.key} className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700">{campo.label}</span>
                  <input
                    type="number"
                    value={formState[campo.key] ?? ""}
                    onChange={handleChange(campo.key)}
                    className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Seção: Status e localização */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <span className="text-blue-600">•</span> Status e localização
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Estado de venda */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Estado de venda</span>
                <select
                  value={formState.estado_venda}
                  onChange={handleChange("estado_venda")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                >
                  {ESTADO_VENDA_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {formatEnumLabel(opt)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Estado do veículo */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Estado do veículo</span>
                <select
                  value={formState.estado_veiculo}
                  onChange={handleChange("estado_veiculo")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Sem definição</option>
                  {ESTADO_VEICULO_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {formatEnumLabel(opt)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Estágio da documentação */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Estágio da documentação</span>
                <input
                  value={formState.estagio_documentacao}
                  onChange={handleChange("estagio_documentacao")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </label>

              {/* Modelo */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Modelo</span>
                <select
                  value={formState.modelo_id}
                  onChange={handleChange("modelo_id")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Selecione um modelo</option>
                  {modelosComNomeCompleto.map((modelo) => (
                    <option key={modelo.id as string} value={modelo.id as string}>
                      {modelo.nomeCompleto}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-zinc-500">
                  {formState.modelo_id
                    ? modeloSelecionado?.nomeCompleto ?? "Modelo não encontrado."
                    : "Selecione um modelo."}
                </span>
              </label>

              {/* Local */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Local</span>
                <select
                  value={formState.local_id}
                  onChange={handleChange("local_id")}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Selecione um local</option>
                  {localOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {lojaSelecionadaId && !possuiUnidadeSelecionada && (
                  <span className="text-xs text-zinc-500">
                    Nenhuma unidade cadastrada para esta loja.
                  </span>
                )}
              </label>
            </div>
          </section>

          {/* Seção: Características */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <span className="text-blue-600">•</span> Características
            </h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {caracteristicasDisponiveis.map((caracteristica) => (
                <li key={caracteristica.id}>
                  <label className="flex items-center gap-3 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={formState.caracteristicas.some(
                        (c) => c.id === caracteristica.id,
                      )}
                      onChange={() =>
                        handleToggleCaracteristica(caracteristica)
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    {caracteristica.nome}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </form>
      </div>

      {/* Botões flutuantes (Salvar / Cancelar) */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50">
        <button
          type="submit"
          form="form-veiculo"
          disabled={isSaving}
          className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition disabled:opacity-60"
          title="Salvar"
        >
          💾
        </button>
        <Link
          href="/estoque"
          className="h-14 w-14 rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition"
          title="Cancelar"
        >
          ✖
        </Link>
      </div>
    </div>
  );
}
