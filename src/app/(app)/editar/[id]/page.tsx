"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { useCaracteristicas, useLocais, useModelos, useLojas } from "@/hooks/use-configuracoes";
import { atualizarVeiculo, calcularDiffCaracteristicas } from "@/services/estoque";
import { useQueryClient } from "@tanstack/react-query";
import { PhotoGallery } from "@/components/PhotoGallery";
import { LojaSelector } from "@/components/LojaSelector";
import { supabase } from "@/lib/supabase";
import type { Modelo } from "@/types";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";
import { useLojaStore } from "@/stores/useLojaStore";

type EstadoVendaOption = VeiculoUI["estado_venda"];
type EstadoVeiculoOption = NonNullable<VeiculoUI["estado_veiculo"]>;
type CaracteristicaFormValue = { id: string; nome: string };

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

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

// 🔹 Form state
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

// 🔹 Helpers
const buildFormStateFromVeiculo = (veiculo: VeiculoUI): VehicleFormState => ({
  placa: veiculo.placa ?? "",
  cor: veiculo.cor ?? "",
  chassi: veiculo.chassi ?? "",
  ano_fabricacao:
    veiculo.ano_fabricacao !== null && veiculo.ano_fabricacao !== undefined
      ? veiculo.ano_fabricacao.toString()
      : "",
  ano_modelo:
    veiculo.ano_modelo !== null && veiculo.ano_modelo !== undefined
      ? veiculo.ano_modelo.toString()
      : "",
  hodometro:
    veiculo.hodometro !== null && veiculo.hodometro !== undefined
      ? veiculo.hodometro.toString()
      : "",
  estado_venda: veiculo.estado_venda,
  estado_veiculo: veiculo.estado_veiculo ?? "",
  preco_venal: veiculo.preco_venal != null ? veiculo.preco_venal.toString() : "",
  observacao: veiculo.observacao ?? "",
  modelo_id: veiculo.modelo_id ?? veiculo.modelo?.id ?? "",
  local_id: veiculo.local_id ?? veiculo.local?.id ?? "",
  estagio_documentacao: veiculo.estagio_documentacao ?? "",
  caracteristicas:
    veiculo.caracteristicas?.map((caracteristica) => ({
      id: caracteristica.id,
      nome: caracteristica.nome,
    })) ?? [],
});

function isVeiculoUI(value: unknown): value is VeiculoUI {
  if (typeof value !== "object" || value === null) return false;
  const veiculo = value as Partial<VeiculoUI>;
  return typeof veiculo.id === "string" && typeof veiculo.placa === "string";
}

export default function EditarVeiculoPage() {
  const params = useParams<{ id: string }>();
  const veiculoId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  // 🔹 Todos os hooks sempre no topo!
  const { data: veiculoData, isLoading: isVeiculoLoading } = useVeiculosUI(veiculoId);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicasDisponiveis = [] } =
    useCaracteristicas() as { data: CaracteristicaFormValue[] };
  const queryClient = useQueryClient();
  const lojaSelecionadaId = useLojaStore((state) => state.lojaSelecionada?.id ?? null);


  const [formState, setFormState] = useState<VehicleFormState | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const veiculo = isVeiculoUI(veiculoData) ? veiculoData : null;

  const lojaNomePorId = useMemo(() => {
    const mapa = new Map<string, string>();
    lojas.forEach((loja) => {
      if (loja.id) {
        mapa.set(loja.id, loja.nome);
      }
    });
    return mapa;
  }, [lojas]);

  const localLojaId = veiculo?.localLojaId ?? null;
  const alvoPreferencialId = lojaSelecionadaId ?? localLojaId;

  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertenceAoAlvo = alvoPreferencialId ? local.loja_id === alvoPreferencialId : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertenceAoAlvo ? 0 : local.loja_id ? 1 : 2;
        return {
          value: local.id,
          label,
          pertenceAoAlvo,
          prioridade,
        } as const;
      })
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
      });
  }, [locais, lojaNomePorId, alvoPreferencialId]);

  const possuiUnidadePreferencial = alvoPreferencialId
    ? localOptions.some((option) => option.pertenceAoAlvo)
    : localOptions.length > 0;
  const nomePreferencial = alvoPreferencialId ? lojaNomePorId.get(alvoPreferencialId) : null;

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
    if (!formState?.modelo_id) return null;
    return (
      modelosComNomeCompleto.find((modelo) => modelo.id === formState.modelo_id) ?? null
    );
  }, [formState?.modelo_id, modelosComNomeCompleto]);

  // inicializa o formulário
  useEffect(() => {
    if (veiculo && !formState) {
      setFormState(buildFormStateFromVeiculo(veiculo));
    }
  }, [veiculo, formState]);

  // 🔹 agora só condições de renderização, hooks já foram todos chamados
  if (!veiculoId) return <p className="p-6 text-red-600">Veículo inválido</p>;
  if (isVeiculoLoading || !formState) return <p className="p-6 text-zinc-600">Carregando...</p>;
  if (!veiculo) {
    return <p className="p-6 text-zinc-600">Veículo não encontrado</p>;
  }

  // Handlers
  const handleChange =
    (field: keyof VehicleFormState): React.ChangeEventHandler<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    > =>
    (event) => {
      setFormState((prev) =>
        prev ? { ...prev, [field]: event.target.value } : prev,
      );
    };

  const handleToggleCaracteristica = (caracteristica: CaracteristicaFormValue) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            caracteristicas: prev.caracteristicas.some((c) => c.id === caracteristica.id)
              ? prev.caracteristicas.filter((c) => c.id !== caracteristica.id)
              : [...prev.caracteristicas, caracteristica],
          }
        : prev,
    );
  };

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();
    if (!formState) return;

    try {
      setIsSaving(true);
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
      const estadoVeiculo =
        formState.estado_veiculo === "" ? null : formState.estado_veiculo;
      const caracteristicasSelecionadas = formState.caracteristicas.map((item) => ({
        id: item.id,
        nome: item.nome,
      }));
      const caracteristicasOriginais = (veiculo.caracteristicas ?? []).map((item) => ({
        id: item.id,
        nome: item.nome,
      }));
      const { adicionar, remover } = calcularDiffCaracteristicas(
        caracteristicasOriginais,
        caracteristicasSelecionadas,
      );
      const modeloId = formState.modelo_id.trim();
      const localId = formState.local_id.trim();
      const hodometroValue = Number(formState.hodometro.trim());
      if (Number.isNaN(hodometroValue)) {
        throw new Error("Informe um valor numérico válido para o hodômetro.");
      }
      const payload: Parameters<typeof atualizarVeiculo>[1] = {
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
        adicionar_caracteristicas: adicionar,
        remover_caracteristicas: remover,
      };

      await atualizarVeiculo(veiculo.id, payload);
      invalidateVeiculos(queryClient);
      setFeedback({
        type: "success",
        message: "Dados atualizados com sucesso!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar veículo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Editar veículo</h1>
          <p className="text-sm text-zinc-500">Placa {veiculo.placa}</p>
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

          {/* Dados principais */}
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

          {/* Especificações */}
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

          {/* Status e localização */}
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
                      <option key={modelo.id as string} value={modelo.id as string}>
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
                {alvoPreferencialId && !possuiUnidadePreferencial ? (
                  <span className="text-xs text-zinc-500">
                    Nenhuma unidade cadastrada para {nomePreferencial ?? "a loja selecionada"}. Cadastre uma em configurações.
                  </span>
                ) : null}
              </label>
            </div>
          </section>

          {/* Características */}
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
                      onChange={() => handleToggleCaracteristica({
                        id: caracteristica.id,
                        nome: caracteristica.nome,
                      })}
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
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              href={`/estoque/${veiculo.id}`}
              className="rounded-md border px-6 py-2 text-sm"
            >
              Cancelar
            </Link>
          </div>
        </form>
        <div className="mt-4">
            <LojaSelector />
          </div>
        <PhotoGallery 
        veiculoId={veiculo.id}
        supabase={supabase} // Ajuste conforme necessário
        empresaId={veiculo.empresa_id}
        />
      </div>
    </div>
  );
}
