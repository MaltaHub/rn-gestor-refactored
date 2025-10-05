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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setFeedback(null);

    try {
      const toNumberOrNull = (value: string) => {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
      };
      const toValueOrNull = (value: string) => {
        const trimmed = value.trim();
        return trimmed === "" ? null : value;
      };

      const hodometroValue = Number(formState.hodometro.trim());
      if (Number.isNaN(hodometroValue)) {
        throw new Error("Informe um valor numérico válido para o hodômetro.");
      }

      const estadoVeiculo = formState.estado_veiculo === "" ? null : formState.estado_veiculo;
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
        message: "Veículo criado com sucesso!",
      });
      setFormState({ ...INITIAL_FORM_STATE });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao criar veículo. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Cadastrar veículo</h1>
          <p className="text-sm text-zinc-500">Preencha os dados para adicionar um novo veículo.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {feedback && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Dados principais</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>Placa</span>
                <input
                  value={formState.placa.toLocaleUpperCase()}
                  onChange={handleChange("placa")}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Chassi</span>
                <input
                  value={formState.chassi}
                  onChange={handleChange("chassi")}
                  className="rounded-md border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Cor</span>
                <input
                  value={formState.cor}
                  onChange={handleChange("cor")}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span>Observações</span>
              <textarea
                value={formState.observacao}
                onChange={handleChange("observacao")}
                className="rounded-md border px-3 py-2 text-sm"
                rows={4}
              />
            </label>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Especificações</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm">
                <span>Ano de fabricação</span>
                <input
                  type="number"
                  value={formState.ano_fabricacao}
                  onChange={handleChange("ano_fabricacao")}
                  className="rounded-md border px-3 py-2 text-sm"
                  min={1900}
                  max={9999}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Ano do modelo</span>
                <input
                  type="number"
                  value={formState.ano_modelo}
                  onChange={handleChange("ano_modelo")}
                  className="rounded-md border px-3 py-2 text-sm"
                  min={1900}
                  max={9999}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Hodômetro</span>
                <input
                  type="number"
                  value={formState.hodometro}
                  onChange={handleChange("hodometro")}
                  className="rounded-md border px-3 py-2 text-sm"
                  min={0}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Preço venal</span>
                <input
                  type="number"
                  value={formState.preco_venal}
                  onChange={handleChange("preco_venal")}
                  className="rounded-md border px-3 py-2 text-sm"
                  min={0}
                  step="0.01"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Status e localização</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                <span>Estado de venda</span>
                <select
                  value={formState.estado_venda}
                  onChange={handleChange("estado_venda")}
                  className="rounded-md border px-3 py-2 text-sm"
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
                <span>Estado do veículo</span>
                <select
                  value={formState.estado_veiculo}
                  onChange={handleChange("estado_veiculo")}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Sem definição</option>
                  {ESTADO_VEICULO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatEnumLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Estágio da documentação</span>
                <input
                  value={formState.estagio_documentacao}
                  onChange={handleChange("estagio_documentacao")}
                  className="rounded-md border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Modelo</span>
                <select
                  value={formState.modelo_id}
                  onChange={handleChange("modelo_id")}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Selecione um modelo</option>
                  {modelosComNomeCompleto
                    .filter((modelo) => Boolean(modelo.id))
                    .map((modelo) => (
                      <option
                        key={modelo.id as string}
                        value={modelo.id as string}
                      >
                        {modelo.nomeCompleto}
                      </option>
                    ))}
                </select>
                <span className="text-xs text-zinc-500">
                  {formState.modelo_id
                    ? modeloSelecionado?.nomeCompleto ?? "Modelo não encontrado nas configurações."
                    : "Selecione um modelo para ver o nome completo."}
                </span>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Local</span>
                <select
                  value={formState.local_id}
                  onChange={handleChange("local_id")}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Selecione um local</option>
                  {localOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {lojaSelecionadaId && !possuiUnidadeSelecionada ? (
                  <span className="text-xs text-zinc-500">
                    Nenhuma unidade cadastrada para a loja selecionada. Cadastre uma em configurações.
                  </span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Características</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {caracteristicasDisponiveis.map((caracteristica) => (
                <li key={caracteristica.id}>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={formState.caracteristicas.some(
                        (selecionada) => selecionada.id === caracteristica.id,
                      )}
                      onChange={() =>
                        handleToggleCaracteristica({
                          id: caracteristica.id,
                          nome: caracteristica.nome,
                        })
                      }
                    />
                    {caracteristica.nome}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Criar veículo"}
            </button>
            <Link href="/estoque" className="rounded-md border px-6 py-2 text-sm">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
