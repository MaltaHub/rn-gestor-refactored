'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { useCaracteristicas, useLocais, useModelos, useLojas } from "@/hooks/use-configuracoes";
import { criarVeiculo } from "@/services/estoque";
import { salvarConfiguracao } from "@/services/configuracoes";
import { useQueryClient } from "@tanstack/react-query";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";
import { useLojaStore } from "@/stores/useLojaStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { QuickAddModal, QuickAddField } from "@/components/QuickAddModal";
import type { VeiculoResumo } from "@/types/estoque";

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
  "disponivel", "reservado", "vendido", "repassado", "restrito",
];

const ESTADO_VEICULO_OPTIONS: EstadoVeiculoOption[] = [
  "novo", "seminovo", "usado", "sucata", "limpo", "sujo",
];

const INITIAL_FORM_STATE: VehicleFormState = {
  placa: "",
  cor: "",
  chassi: "",
  ano_fabricacao: "",
  ano_modelo: "",
  hodometro: "",
  estado_venda: "disponivel",
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
  const router = useRouter();
  const { data: modelos = [] } = useModelos();
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();
  const { data: caracteristicasDisponiveis = [] } =
    useCaracteristicas() as { data: CaracteristicaFormValue[] };
  const queryClient = useQueryClient();
  const lojaSelecionadaId = useLojaStore((s) => s.lojaSelecionada?.id ?? null);

  const [formState, setFormState] = useState<VehicleFormState>({ ...INITIAL_FORM_STATE });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  const [isCaracteristicaModalOpen, setIsCaracteristicaModalOpen] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const lojaNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    lojas.forEach((l) => l.id && map.set(l.id, l.nome));
    return map;
  }, [lojas]);

  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertence = lojaSelecionadaId ? local.loja_id === lojaSelecionadaId : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertence ? 0 : local.loja_id ? 1 : 2;
        return { value: local.id, label, pertence, prioridade } as const;
      })
      .sort((a, b) => a.prioridade - b.prioridade || a.label.localeCompare(b.label, "pt-BR"));
  }, [locais, lojaNomePorId, lojaSelecionadaId]);

  const modelosComNomeCompleto = useMemo(
    () => modelos.map((m) => ({ ...m, nomeCompleto: buildModeloNomeCompletoOrDefault(m) })),
    [modelos]
  );

  const handleChange =
    (field: keyof VehicleFormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormState((prev) => ({ ...prev, [field]: e.target.value }));

  const handleToggleCaracteristica = (c: CaracteristicaFormValue) =>
    setFormState((prev) => ({
      ...prev,
      caracteristicas: prev.caracteristicas.some((x) => x.id === c.id)
        ? prev.caracteristicas.filter((x) => x.id !== c.id)
        : [...prev.caracteristicas, c],
    }));

  const handleSaveModelo = async (data: Record<string, string>) => {
    await salvarConfiguracao('modelo', { marca: data.marca, nome: data.nome });
    await queryClient.refetchQueries({ queryKey: ['configuracoes', 'modelo'] });
    const updatedModelos = queryClient.getQueryData<Array<{ id: string; marca: string; nome: string }>>(['configuracoes', 'modelo']) || [];
    const newModelo = updatedModelos.find(m => m.marca === data.marca && m.nome === data.nome);
    if (newModelo?.id) {
      setFormState(prev => ({ ...prev, modelo_id: newModelo.id }));
      setFeedback({ type: 'success', message: `✅ Modelo "${data.marca} ${data.nome}" criado e selecionado!` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSaveCaracteristica = async (data: Record<string, string>) => {
    await salvarConfiguracao('caracteristica', { nome: data.nome });
    await queryClient.refetchQueries({ queryKey: ['configuracoes', 'caracteristica'] });
    const updatedCaracteristicas = queryClient.getQueryData<CaracteristicaFormValue[]>(['configuracoes', 'caracteristica']) || [];
    const newCaracteristica = updatedCaracteristicas.find(c => c.nome === data.nome);
    if (newCaracteristica) {
      setFormState(prev => ({ 
        ...prev, 
        caracteristicas: [...prev.caracteristicas, newCaracteristica] 
      }));
      setFeedback({ type: 'success', message: `✅ Característica "${data.nome}" criada e adicionada!` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSaveLocal = async (data: Record<string, string>) => {
    await salvarConfiguracao('local', { nome: data.nome, loja_id: data.loja_id || null });
    await queryClient.refetchQueries({ queryKey: ['configuracoes', 'local'] });
    const updatedLocais = queryClient.getQueryData<Array<{ id: string; nome: string; loja_id?: string | null }>>(['configuracoes', 'local']) || [];
    const newLocal = updatedLocais.find(l => l.nome === data.nome);
    if (newLocal?.id) {
      setFormState(prev => ({ ...prev, local_id: newLocal.id }));
      setFeedback({ type: 'success', message: `✅ Local "${data.nome}" criado e selecionado!` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) {
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

      const payload: Parameters<typeof criarVeiculo>[0] = {
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
        caracteristicas: formState.caracteristicas,
      };

      await criarVeiculo(payload);
      invalidateVeiculos(queryClient);
      setFeedback({ type: "success", message: "✅ Veículo criado com sucesso! Redirecionando..." });

      setTimeout(() => {
        router.push('/estoque');
      }, 1500);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao criar veículo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/estoque')}
            className="mb-4"
          >
            Voltar para estoque
          </Button>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Cadastrar novo veículo</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Preencha as informações do veículo para adicioná-lo ao estoque.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
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
          <section className="bg-white rounded-lg border border-[var(--border-default)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Dados principais</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Placa *</span>
                <input
                  value={formState.placa.toLocaleUpperCase()}
                  onChange={handleChange("placa")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Chassi</span>
                <input
                  value={formState.chassi}
                  onChange={handleChange("chassi")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Cor</span>
                <input
                  value={formState.cor}
                  onChange={handleChange("cor")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                />
              </label>
            </div>
          </section>

          {/* Especificações */}
          <section className="bg-white rounded-lg border border-[var(--border-default)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Especificações</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Ano fabricação</span>
                <input
                  type="number"
                  value={formState.ano_fabricacao}
                  onChange={handleChange("ano_fabricacao")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  min={1900}
                  max={9999}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Ano modelo</span>
                <input
                  type="number"
                  value={formState.ano_modelo}
                  onChange={handleChange("ano_modelo")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  min={1900}
                  max={9999}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Hodômetro *</span>
                <input
                  type="number"
                  value={formState.hodometro}
                  onChange={handleChange("hodometro")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  min={0}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Preço venal</span>
                <input
                  type="number"
                  value={formState.preco_venal}
                  onChange={handleChange("preco_venal")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  min={0}
                  step="0.01"
                />
              </label>
            </div>
          </section>

          {/* Status e localização */}
          <section className="bg-white rounded-lg border border-[var(--border-default)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Status e localização</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Estado de venda *</span>
                <select
                  value={formState.estado_venda}
                  onChange={handleChange("estado_venda")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
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
                <span className="font-medium text-[var(--text-secondary)]">Estado do veículo</span>
                <select
                  value={formState.estado_veiculo}
                  onChange={handleChange("estado_veiculo")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
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
                <span className="font-medium text-[var(--text-secondary)]">Documentação</span>
                <input
                  value={formState.estagio_documentacao}
                  onChange={handleChange("estagio_documentacao")}
                  className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Modelo</span>
                <div className="flex gap-2">
                  <select
                    value={formState.modelo_id}
                    onChange={handleChange("modelo_id")}
                    className="flex-1 rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModeloModalOpen(true)}
                    className="px-2"
                    aria-label="Adicionar novo modelo"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--text-secondary)]">Local</span>
                <div className="flex gap-2">
                  <select
                    value={formState.local_id}
                    onChange={handleChange("local_id")}
                    className="flex-1 rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                  >
                    <option value="">Selecione um local</option>
                    {localOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLocalModalOpen(true)}
                    className="px-2"
                    aria-label="Adicionar novo local"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </label>
            </div>
          </section>

          {/* Características */}
          <section className="bg-white rounded-lg border border-[var(--border-default)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Características</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCaracteristicaModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                aria-label="Adicionar nova característica"
              >
                Adicionar
              </Button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="rounded border-[var(--border-default)] text-[var(--purple-magic)] focus:ring-[var(--purple-magic)]"
                    />
                    <span className="text-[var(--text-primary)]">{caracteristica.nome}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {/* Observações */}
          <section className="bg-white rounded-lg border border-[var(--border-default)] p-6">
            <label className="flex flex-col gap-2">
              <span className="text-lg font-semibold text-[var(--text-primary)]">Observações</span>
              <textarea
                value={formState.observacao}
                onChange={handleChange("observacao")}
                className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:border-[var(--purple-magic)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-magic)]"
                rows={4}
                placeholder="Informações adicionais sobre o veículo..."
              />
            </label>
          </section>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-6 right-6 z-50 flex gap-3 pointer-events-none">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/estoque')}
              disabled={isSaving}
              className="pointer-events-auto shadow-2xl bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              disabled={isSaving}
              className="pointer-events-auto shadow-2xl"
            >
              {isSaving ? "Salvando..." : "Criar veículo"}
            </Button>
          </div>
        </form>

        {/* Modals for Inline Creation */}
        <QuickAddModal
          isOpen={isModeloModalOpen}
          onClose={() => setIsModeloModalOpen(false)}
          title="Adicionar Novo Modelo"
          fields={[
            { type: 'text', name: 'marca', label: 'Marca', required: true, placeholder: 'Ex: Toyota' },
            { type: 'text', name: 'nome', label: 'Nome', required: true, placeholder: 'Ex: Corolla' }
          ]}
          onSave={handleSaveModelo}
        />

        <QuickAddModal
          isOpen={isCaracteristicaModalOpen}
          onClose={() => setIsCaracteristicaModalOpen(false)}
          title="Adicionar Nova Característica"
          fields={[
            { type: 'text', name: 'nome', label: 'Nome', required: true, placeholder: 'Ex: Ar condicionado' }
          ]}
          onSave={handleSaveCaracteristica}
        />

        <QuickAddModal
          isOpen={isLocalModalOpen}
          onClose={() => setIsLocalModalOpen(false)}
          title="Adicionar Novo Local"
          fields={[
            { type: 'text', name: 'nome', label: 'Nome', required: true, placeholder: 'Ex: Estacionamento A' },
            { 
              type: 'select', 
              name: 'loja_id', 
              label: 'Loja (opcional)', 
              required: false,
              options: lojas.map(loja => ({ value: loja.id || '', label: loja.nome }))
            }
          ]}
          onSave={handleSaveLocal}
        />
      </div>
    </div>
  );
}
