"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { useCaracteristicas, useLocais, useModelos, useLojas } from "@/hooks/use-configuracoes";
import { atualizarVeiculo, calcularDiffCaracteristicas } from "@/services/estoque";
import { useQueryClient } from "@tanstack/react-query";
import { PhotoGallery } from "@/components/Gallery";
import { LojaSelector } from "@/components/LojaSelector";
import { supabase } from "@/lib/supabase";
import type { Modelo } from "@/types";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";
import { useLojaStore } from "@/stores/useLojaStore";

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

export default function EditarVeiculoPage() {
  const params = useParams<{ id: string }>();
  const veiculoId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const { data: veiculoData, isLoading: isVeiculoLoading } = useVeiculosUI(veiculoId);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicasDisponiveis = [] } =
    useCaracteristicas() as { data: CaracteristicaFormValue[] };
  const queryClient = useQueryClient();
  const lojaSelecionadaId = useLojaStore((s) => s.lojaSelecionada?.id ?? null);

  const [formState, setFormState] = useState<VehicleFormState | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const veiculo = isVeiculoUI(veiculoData) ? veiculoData : null;

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
    () => modelos.map((m) => ({ ...m, nomeCompleto: buildModeloNomeCompletoOrDefault(m) })),
    [modelos]
  );

  const modeloSelecionado = useMemo(
    () => modelosComNomeCompleto.find((m) => m.id === formState?.modelo_id) ?? null,
    [formState?.modelo_id, modelosComNomeCompleto]
  );

  useEffect(() => {
    if (veiculo && !formState) setFormState(buildFormStateFromVeiculo(veiculo));
  }, [veiculo, formState]);

  if (!veiculoId) return <p className="p-6 text-red-600">Veículo inválido</p>;
  if (isVeiculoLoading || !formState)
    return <p className="p-6 text-zinc-600">Carregando...</p>;
  if (!veiculo) return <p className="p-6 text-zinc-600">Veículo não encontrado</p>;

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

    const possuiUnidadePreferencial = alvoPreferencialId
      ? localOptions.some((option) => option.pertence)
      : localOptions.length > 0;
    const nomePreferencial = alvoPreferencialId ? lojaNomePorId.get(alvoPreferencialId) : null;

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
    <div className="relative bg-zinc-50 min-h-screen pb-24">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 space-y-10">
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Editar veículo</h1>
          <p className="text-sm text-zinc-500 mt-1">Placa {veiculo.placa}</p>
        </header>

        <form id="form-editar-veiculo" onSubmit={handleSubmit} className="space-y-8">
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

        <div className="mt-8 space-y-8">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <span className="text-blue-600">•</span> Loja e fotos
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

      {/* Botões flutuantes */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50">
        <button
          type="submit"
          form="form-editar-veiculo"
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