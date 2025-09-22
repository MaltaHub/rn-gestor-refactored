"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import type {
  CharacteristicRecord,
  LocationRecord,
  ModelRecord,
  PlatformRecord,
  StoreRecord
} from "../../../../backend/fixtures";
import {
  createCharacteristic,
  createLocation,
  createModel,
  createPlatform,
  createStore,
  deleteCharacteristic,
  deleteLocation,
  deleteModel,
  deletePlatform,
  deleteStore,
  listCharacteristics,
  listLocations,
  listModels,
  listPlatforms,
  listStores,
  updateCharacteristic,
  updateLocation,
  updateModel,
  updatePlatform,
  updateStore
} from "../../../../backend/modules/configuracoes";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SimpleItem {
  id: string;
  nome: string;
}

interface SimpleManagerProps {
  title: string;
  description: string;
  items: SimpleItem[];
  emptyMessage: string;
  placeholder: string;
  onCreate: (nome: string) => Promise<void>;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function SimpleManager({
  title,
  description,
  items,
  emptyMessage,
  placeholder,
  onCreate,
  onUpdate,
  onDelete
}: SimpleManagerProps) {
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome));

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newValue.trim();
    if (!value) return;
    setIsProcessing(true);
    try {
      await onCreate(value);
      setNewValue("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const value = editingValue.trim();
    if (!value) return;
    setIsProcessing(true);
    try {
      await onUpdate(editingId, value);
      setEditingId(null);
      setEditingValue("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setEditingValue("");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <Card className="border-white/10 bg-slate-900/70">
      <CardHeader className="gap-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {editingId === item.id ? (
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      placeholder={placeholder}
                      disabled={isProcessing}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-2"
                        onClick={handleSaveEdit}
                        disabled={isProcessing}
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2" onClick={cancelEdit} disabled={isProcessing}>
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-white">{item.nome}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingValue(item.nome);
                        }}
                        disabled={isProcessing}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-300 hover:text-red-200"
                        onClick={() => handleDelete(item.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">{emptyMessage}</p>
          )}
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            placeholder={placeholder}
            disabled={isProcessing}
          />
          <Button type="submit" className="gap-2" disabled={isProcessing || !newValue.trim()}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface ModelFormState {
  marca: string;
  nome: string;
  edicao: string;
  carroceria: string;
  combustivel: string;
  tipo_cambio: string;
  ano_inicial: string;
  ano_final: string;
}

const emptyModelForm: ModelFormState = {
  marca: "",
  nome: "",
  edicao: "",
  carroceria: "",
  combustivel: "",
  tipo_cambio: "",
  ano_inicial: "",
  ano_final: ""
};

const empresaId = "company-1";

export default function CatalogManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [characteristics, setCharacteristics] = useState<CharacteristicRecord[]>([]);
  const [platforms, setPlatforms] = useState<PlatformRecord[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [modelForm, setModelForm] = useState<ModelFormState>(emptyModelForm);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isModelProcessing, setIsModelProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [storesData, characteristicsData, platformsData, locationsData, modelsData] = await Promise.all([
          listStores.mock({ empresa_id: empresaId }),
          listCharacteristics.mock({ empresa_id: empresaId }),
          listPlatforms.mock({ empresa_id: empresaId }),
          listLocations.mock({ empresa_id: empresaId }),
          listModels.mock({ empresa_id: empresaId })
        ]);

        if (!cancelled) {
          setStores(storesData ?? []);
          setCharacteristics(characteristicsData ?? []);
          setPlatforms(platformsData ?? []);
          setLocations(locationsData ?? []);
          setModels(modelsData ?? []);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateStore = async (nome: string) => {
    const { id } = await createStore.mock({ empresa_id: empresaId, nome });
    setStores((current) => [...current, { id, empresa_id: empresaId, nome }]);
  };

  const handleUpdateStore = async (id: string, nome: string) => {
    await updateStore.mock({ empresa_id: empresaId, id, nome });
    setStores((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteStore = async (id: string) => {
    await deleteStore.mock({ empresa_id: empresaId, id });
    setStores((current) => current.filter((item) => item.id !== id));
  };

  const handleCreateCharacteristic = async (nome: string) => {
    const { id } = await createCharacteristic.mock({ empresa_id: empresaId, nome });
    setCharacteristics((current) => [...current, { id, empresa_id: empresaId, nome }]);
  };

  const handleUpdateCharacteristic = async (id: string, nome: string) => {
    await updateCharacteristic.mock({ empresa_id: empresaId, id, nome });
    setCharacteristics((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteCharacteristic = async (id: string) => {
    await deleteCharacteristic.mock({ empresa_id: empresaId, id });
    setCharacteristics((current) => current.filter((item) => item.id !== id));
  };

  const handleCreatePlatform = async (nome: string) => {
    const { id } = await createPlatform.mock({ empresa_id: empresaId, nome });
    setPlatforms((current) => [...current, { id, empresa_id: empresaId, nome }]);
  };

  const handleUpdatePlatform = async (id: string, nome: string) => {
    await updatePlatform.mock({ empresa_id: empresaId, id, nome });
    setPlatforms((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeletePlatform = async (id: string) => {
    await deletePlatform.mock({ empresa_id: empresaId, id });
    setPlatforms((current) => current.filter((item) => item.id !== id));
  };

  const handleCreateLocation = async (nome: string) => {
    const { id } = await createLocation.mock({ empresa_id: empresaId, nome });
    setLocations((current) => [...current, { id, empresa_id: empresaId, nome }]);
  };

  const handleUpdateLocation = async (id: string, nome: string) => {
    await updateLocation.mock({ empresa_id: empresaId, id, nome });
    setLocations((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteLocation = async (id: string) => {
    await deleteLocation.mock({ empresa_id: empresaId, id });
    setLocations((current) => current.filter((item) => item.id !== id));
  };

  const toNumberOrNull = (value: string) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const resetModelForm = () => {
    setEditingModelId(null);
    setModelForm(emptyModelForm);
  };

  const handleSubmitModel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const marca = modelForm.marca.trim();
    const nome = modelForm.nome.trim();

    if (!marca || !nome) return;

    const normalized: Omit<ModelRecord, "id"> = {
      empresa_id: empresaId,
      marca,
      nome,
      edicao: modelForm.edicao.trim() || null,
      carroceria: modelForm.carroceria.trim() || null,
      combustivel: modelForm.combustivel.trim() || null,
      tipo_cambio: modelForm.tipo_cambio.trim() || null,
      ano_inicial: toNumberOrNull(modelForm.ano_inicial),
      ano_final: toNumberOrNull(modelForm.ano_final)
    };

    setIsModelProcessing(true);

    try {
      if (editingModelId) {
        await updateModel.mock({
          empresa_id: empresaId,
          id: editingModelId,
          marca: normalized.marca,
          nome: normalized.nome,
          edicao: normalized.edicao ?? undefined,
          carroceria: normalized.carroceria ?? undefined,
          combustivel: normalized.combustivel ?? undefined,
          tipo_cambio: normalized.tipo_cambio ?? undefined,
          ano_inicial: normalized.ano_inicial ?? undefined,
          ano_final: normalized.ano_final ?? undefined
        });

        setModels((current) =>
          current.map((item) => (item.id === editingModelId ? { ...item, ...normalized } : item))
        );
      } else {
        const { id } = await createModel.mock({
          empresa_id: empresaId,
          marca: normalized.marca,
          nome: normalized.nome,
          edicao: normalized.edicao ?? undefined,
          carroceria: normalized.carroceria ?? undefined,
          combustivel: normalized.combustivel ?? undefined,
          tipo_cambio: normalized.tipo_cambio ?? undefined,
          ano_inicial: normalized.ano_inicial ?? undefined,
          ano_final: normalized.ano_final ?? undefined
        });

        setModels((current) => [...current, { ...normalized, id }]);
      }

      resetModelForm();
    } finally {
      setIsModelProcessing(false);
    }
  };

  const handleEditModel = (model: ModelRecord) => {
    setEditingModelId(model.id);
    setModelForm({
      marca: model.marca,
      nome: model.nome,
      edicao: model.edicao ?? "",
      carroceria: model.carroceria ?? "",
      combustivel: model.combustivel ?? "",
      tipo_cambio: model.tipo_cambio ?? "",
      ano_inicial: model.ano_inicial ? String(model.ano_inicial) : "",
      ano_final: model.ano_final ? String(model.ano_final) : ""
    });
  };

  const handleDeleteModel = async (id: string) => {
    await deleteModel.mock({ empresa_id: empresaId, id });
    setModels((current) => current.filter((item) => item.id !== id));
    if (editingModelId === id) {
      resetModelForm();
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gerenciar cadastros operacionais"
        description="Conecte os cadastros base a partir de um ponto único antes de acoplar o backend real."
      />

      {isLoading ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardContent className="py-8">
            <p className="text-sm text-slate-400">Carregando catálogos de referência...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <SimpleManager
              title="Lojas"
              description="Cadastre e mantenha os pontos de venda disponíveis para associação com veículos e vendas."
              items={stores.map(({ id, nome }) => ({ id, nome }))}
              emptyMessage="Nenhuma loja cadastrada até o momento."
              placeholder="Nome da loja"
              onCreate={handleCreateStore}
              onUpdate={handleUpdateStore}
              onDelete={handleDeleteStore}
            />
            <SimpleManager
              title="Características"
              description="Organize atributos que enriquecem o catálogo de veículos para anúncios e propostas."
              items={characteristics.map(({ id, nome }) => ({ id, nome }))}
              emptyMessage="Nenhuma característica cadastrada."
              placeholder="Nome da característica"
              onCreate={handleCreateCharacteristic}
              onUpdate={handleUpdateCharacteristic}
              onDelete={handleDeleteCharacteristic}
            />
            <SimpleManager
              title="Plataformas"
              description="Mapeie canais de venda e marketplaces para conectar integrações de publicação."
              items={platforms.map(({ id, nome }) => ({ id, nome }))}
              emptyMessage="Nenhuma plataforma cadastrada."
              placeholder="Nome da plataforma"
              onCreate={handleCreatePlatform}
              onUpdate={handleUpdatePlatform}
              onDelete={handleDeletePlatform}
            />
            <SimpleManager
              title="Locais"
              description="Defina áreas físicas para controles logísticos e visibilidade de estoque."
              items={locations.map(({ id, nome }) => ({ id, nome }))}
              emptyMessage="Nenhum local cadastrado."
              placeholder="Nome do local"
              onCreate={handleCreateLocation}
              onUpdate={handleUpdateLocation}
              onDelete={handleDeleteLocation}
            />
          </div>

          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="gap-2">
              <CardTitle>Modelos</CardTitle>
              <CardDescription>
                Estruture marca, edição e período para conectar catálogos internos e plataformas externas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmitModel} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-marca">
                      Marca
                    </label>
                    <Input
                      id="model-marca"
                      value={modelForm.marca}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, marca: event.target.value }))}
                      placeholder="Ex.: Jeep"
                      disabled={isModelProcessing}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-nome">
                      Nome do modelo
                    </label>
                    <Input
                      id="model-nome"
                      value={modelForm.nome}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, nome: event.target.value }))}
                      placeholder="Ex.: Compass"
                      disabled={isModelProcessing}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-edicao">
                      Edição
                    </label>
                    <Input
                      id="model-edicao"
                      value={modelForm.edicao}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, edicao: event.target.value }))}
                      placeholder="Ex.: Longitude 2.0"
                      disabled={isModelProcessing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-carroceria">
                      Carroceria
                    </label>
                    <Input
                      id="model-carroceria"
                      value={modelForm.carroceria}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, carroceria: event.target.value }))}
                      placeholder="Ex.: suv"
                      disabled={isModelProcessing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-combustivel">
                      Combustível
                    </label>
                    <Input
                      id="model-combustivel"
                      value={modelForm.combustivel}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, combustivel: event.target.value }))}
                      placeholder="Ex.: flex"
                      disabled={isModelProcessing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-cambio">
                      Tipo de câmbio
                    </label>
                    <Input
                      id="model-cambio"
                      value={modelForm.tipo_cambio}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, tipo_cambio: event.target.value }))}
                      placeholder="Ex.: automatico"
                      disabled={isModelProcessing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-ano-inicial">
                      Ano inicial
                    </label>
                    <Input
                      id="model-ano-inicial"
                      value={modelForm.ano_inicial}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, ano_inicial: event.target.value }))}
                      placeholder="Ex.: 2022"
                      disabled={isModelProcessing}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="model-ano-final">
                      Ano final
                    </label>
                    <Input
                      id="model-ano-final"
                      value={modelForm.ano_final}
                      onChange={(event) => setModelForm((prev) => ({ ...prev, ano_final: event.target.value }))}
                      placeholder="Ex.: 2024"
                      disabled={isModelProcessing}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  {editingModelId ? (
                    <Button variant="ghost" onClick={resetModelForm} disabled={isModelProcessing} className="gap-2">
                      <X className="h-4 w-4" />
                      Cancelar edição
                    </Button>
                  ) : null}
                  <Button type="submit" className="gap-2" disabled={isModelProcessing}>
                    <Save className="h-4 w-4" />
                    {editingModelId ? "Atualizar modelo" : "Adicionar modelo"}
                  </Button>
                </div>
              </form>

              {models.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...models]
                    .sort((a, b) => a.marca.localeCompare(b.marca) || a.nome.localeCompare(b.nome))
                    .map((model) => (
                      <div
                        key={model.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {model.marca} {model.nome}
                          </p>
                          {model.edicao ? (
                            <p className="text-xs text-slate-400">{model.edicao}</p>
                          ) : null}
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          {model.carroceria ? <p>Carroceria: {model.carroceria}</p> : null}
                          {model.combustivel ? <p>Combustivel: {model.combustivel}</p> : null}
                          {model.tipo_cambio ? <p>Cambio: {model.tipo_cambio}</p> : null}
                          {model.ano_inicial || model.ano_final ? (
                            <p>
                              Anos: {model.ano_inicial ?? "?"} - {model.ano_final ?? "?"}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEditModel(model)}
                            disabled={isModelProcessing}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-red-300 hover:text-red-200"
                            onClick={() => handleDeleteModel(model.id)}
                            disabled={isModelProcessing}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nenhum modelo cadastrado até o momento.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
