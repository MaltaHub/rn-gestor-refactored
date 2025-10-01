"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useVeiculosUI, VeiculoUI } from "@/adapters/adaptador-estoque";
import {
  useCaracteristicas,
  useLocais,
  useLojas,
  useModelos,
} from "@/hooks/use-configuracoes";
import { atualizarVeiculo } from "@/services/estoque";
import type { EstadoVeiculo, EstadoVenda } from "@/types/supabase_enums";

// 🔹 Constantes
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

// 🔹 Form state
interface VehicleFormState {
  placa: string;
  cor: string;
  estado_venda: EstadoVenda;
  estado_veiculo: EstadoVeiculo | "";
  preco_venal: string;
  observacao: string;
  modelo_id: string;
  local_id: string;
  caracteristicas_ids: string[];
}

// 🔹 Helpers
const buildFormStateFromVeiculo = (veiculoUI: VeiculoUI): VehicleFormState => ({
  placa: veiculoUI.placa ?? "",
  cor: veiculoUI.cor ?? "",
  estado_venda: (veiculoUI as any).estado_venda ?? "disponivel",
  estado_veiculo: (veiculoUI as any).estado_veiculo ?? "",
  preco_venal: (veiculoUI as any).preco_venal?.toString() ?? "",
  observacao: (veiculoUI as any).observacao ?? "",
  modelo_id: veiculoUI.modelo?.id ?? "",
  local_id: veiculoUI.local?.id ?? "",
  caracteristicas_ids: veiculoUI.caracteristicas?.map((c) => c.id) as any ?? [],
});

function isVeiculoUI(value: unknown): value is VeiculoUI {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "placa" in value &&
    "status" in value &&
    "caracteristicas" in value
  );
}

export default function EditarVeiculoPage() {
  const params = useParams<{ id: string }>();
  const veiculoId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  // 🔹 Todos os hooks sempre no topo!
  const { data: veiculoUI, isLoading: isVeiculoLoading } = useVeiculosUI(veiculoId);
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicas = [] } = useCaracteristicas() as { data: { id: string; nome: string }[] };

  const [formState, setFormState] = useState<VehicleFormState | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // inicializa o formulário
  useEffect(() => {
    if (veiculoUI && !formState && isVeiculoUI(veiculoUI)) {
      setFormState(buildFormStateFromVeiculo(veiculoUI));
    }
  }, [veiculoUI, formState]);

  // 🔹 agora só condições de renderização, hooks já foram todos chamados
  if (!veiculoId) return <p className="p-6 text-red-600">Veículo inválido</p>;
  if (isVeiculoLoading || !formState) return <p className="p-6 text-zinc-600">Carregando...</p>;
  if (!veiculoUI || !isVeiculoUI(veiculoUI)) {
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

  const handleToggleCaracteristica = (id: string) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            caracteristicas_ids: prev.caracteristicas_ids.includes(id)
              ? prev.caracteristicas_ids.filter((x) => x !== id)
              : [...prev.caracteristicas_ids, id],
          }
        : prev,
    );
  };

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();
    if (!formState) return;

    try {
      setIsSaving(true);
      await atualizarVeiculo(veiculoUI.id, {
        ...formState,
        preco_venal: formState.preco_venal ? Number(formState.preco_venal) : null,
        estado_veiculo: formState.estado_veiculo || null, // 👈 fix tipagem
      });
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
          <p className="text-sm text-zinc-500">Placa {veiculoUI.placa}</p>
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
                  value={formState.placa}
                  onChange={handleChange("placa")}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
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
          </section>

          {/* Características */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium">Características</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {caracteristicas.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={formState.caracteristicas_ids.includes(c.id)}
                      onChange={() => handleToggleCaracteristica(c.id)}
                    />
                    {c.nome}
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
              href={`/estoque/${veiculoUI.id}`}
              className="rounded-md border px-6 py-2 text-sm"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
