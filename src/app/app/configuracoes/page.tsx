"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SimpleItem {
  id: string;
  nome: string;
}

interface ModelRecord {
  id: string;
  marca: string;
  nome: string;
  edicao: string | null;
  carroceria: string | null;
  combustivel: string | null;
  tipo_cambio: string | null;
  ano_inicial: number | null;
  ano_final: number | null;
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

const initialStores: SimpleItem[] = [
  { id: "store-01", nome: "Matriz" },
  { id: "store-02", nome: "Filial Norte" }
];

const initialCharacteristics: SimpleItem[] = [
  { id: "char-01", nome: "Blindado" },
  { id: "char-02", nome: "Garantia de fabrica" }
];

const initialPlatforms: SimpleItem[] = [
  { id: "plat-01", nome: "Webmotors" },
  { id: "plat-02", nome: "OLX Autos" }
];

const initialLocations: SimpleItem[] = [
  { id: "loc-01", nome: "Showroom" },
  { id: "loc-02", nome: "Piso -1" }
];

const initialModels: ModelRecord[] = [
  {
    id: "model-01",
    marca: "Jeep",
    nome: "Compass",
    edicao: "Longitude",
    carroceria: "suv",
    combustivel: "flex",
    tipo_cambio: "automatico",
    ano_inicial: 2021,
    ano_final: 2024
  },
  {
    id: "model-02",
    marca: "Toyota",
    nome: "Corolla",
    edicao: "Altis",
    carroceria: "sedan",
    combustivel: "hibrido",
    tipo_cambio: "cvtt",
    ano_inicial: 2020,
    ano_final: null
  }
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
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

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.nome.localeCompare(b.nome)), [items]);

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
                      <Button size="sm" className="gap-2" onClick={handleSaveEdit} disabled={isProcessing}>
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

type CatalogTabKey = "stores" | "characteristics" | "platforms" | "locations" | "models";

const catalogTabs: Array<{ key: CatalogTabKey; label: string; description: string }> = [
  {
    key: "stores",
    label: "Lojas",
    description: "Cadastre e mantenha os pontos de venda disponíveis para associação com veículos e vendas."
  },
  {
    key: "characteristics",
    label: "Caracteristicas",
    description: "Organize atributos que enriquecem o catálogo de veículos para anúncios e propostas."
  },
  {
    key: "platforms",
    label: "Plataformas",
    description: "Mapeie canais de venda e marketplaces para conectar integrações de publicação."
  },
  {
    key: "locations",
    label: "Locais",
    description: "Defina áreas físicas para controles logísticos e visibilidade de estoque."
  },
  {
    key: "models",
    label: "Modelos",
    description: "Estruture marca, edição e período para conectar catálogos internos e plataformas externas."
  }
];

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<CatalogTabKey>("stores");
  const [stores, setStores] = useState<SimpleItem[]>(initialStores);
  const [characteristics, setCharacteristics] = useState<SimpleItem[]>(initialCharacteristics);
  const [platforms, setPlatforms] = useState<SimpleItem[]>(initialPlatforms);
  const [locations, setLocations] = useState<SimpleItem[]>(initialLocations);
  const [models, setModels] = useState<ModelRecord[]>(initialModels);
  const [modelForm, setModelForm] = useState<ModelFormState>(emptyModelForm);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isModelProcessing, setIsModelProcessing] = useState(false);

  const handleCreateStore = async (nome: string) => {
    setStores((current) => [...current, { id: createId("store"), nome }]);
  };

  const handleUpdateStore = async (id: string, nome: string) => {
    setStores((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteStore = async (id: string) => {
    setStores((current) => current.filter((item) => item.id !== id));
  };

  const handleCreateCharacteristic = async (nome: string) => {
    setCharacteristics((current) => [...current, { id: createId("char"), nome }]);
  };

  const handleUpdateCharacteristic = async (id: string, nome: string) => {
    setCharacteristics((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteCharacteristic = async (id: string) => {
    setCharacteristics((current) => current.filter((item) => item.id !== id));
  };

  const handleCreatePlatform = async (nome: string) => {
    setPlatforms((current) => [...current, { id: createId("plat"), nome }]);
  };

  const handleUpdatePlatform = async (id: string, nome: string) => {
    setPlatforms((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeletePlatform = async (id: string) => {
    setPlatforms((current) => current.filter((item) => item.id !== id));
  };

  const handleCreateLocation = async (nome: string) => {
    setLocations((current) => [...current, { id: createId("loc"), nome }]);
  };

  const handleUpdateLocation = async (id: string, nome: string) => {
    setLocations((current) => current.map((item) => (item.id === id ? { ...item, nome } : item)));
  };

  const handleDeleteLocation = async (id: string) => {
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
        setModels((current) => current.map((item) => (item.id === editingModelId ? { ...item, ...normalized } : item)));
      } else {
        setModels((current) => [...current, { id: createId("model"), ...normalized }]);
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
    setModels((current) => current.filter((item) => item.id !== id));
    if (editingModelId === id) {
      resetModelForm();
    }
  };

  const renderSimpleManager = (config: {
    key: Exclude<CatalogTabKey, "models">;
    placeholder: string;
    emptyMessage: string;
    items: SimpleItem[];
    onCreate: (nome: string) => Promise<void>;
    onUpdate: (id: string, nome: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }) => (
    <SimpleManager
      title={catalogTabs.find((tab) => tab.key === config.key)?.label ?? ""}
      description={catalogTabs.find((tab) => tab.key === config.key)?.description ?? ""}
      items={config.items}
      emptyMessage={config.emptyMessage}
      placeholder={config.placeholder}
      onCreate={config.onCreate}
      onUpdate={config.onUpdate}
      onDelete={config.onDelete}
    />
  );

  const activeTabDescription = catalogTabs.find((tab) => tab.key === activeTab)?.description ?? "";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gerenciar cadastros operacionais"
        description="Use a barra horizontal para alternar entre as tabelas e manter os dados de referência alinhados."
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-2">
          <CardTitle>Catalogos disponiveis</CardTitle>
          <CardDescription>{activeTabDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {catalogTabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      if (tab.key !== "models") {
                        resetModelForm();
                      }
                    }}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                        : "border border-white/10 bg-slate-950/40 text-slate-200 hover:border-sky-400/40"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === "stores"
        ? renderSimpleManager({
            key: "stores",
            placeholder: "Nome da loja",
            emptyMessage: "Nenhuma loja cadastrada até o momento.",
            items: stores,
            onCreate: handleCreateStore,
            onUpdate: handleUpdateStore,
            onDelete: handleDeleteStore
          })
        : null}

      {activeTab === "characteristics"
        ? renderSimpleManager({
            key: "characteristics",
            placeholder: "Nome da caracteristica",
            emptyMessage: "Nenhuma caracteristica cadastrada.",
            items: characteristics,
            onCreate: handleCreateCharacteristic,
            onUpdate: handleUpdateCharacteristic,
            onDelete: handleDeleteCharacteristic
          })
        : null}

      {activeTab === "platforms"
        ? renderSimpleManager({
            key: "platforms",
            placeholder: "Nome da plataforma",
            emptyMessage: "Nenhuma plataforma cadastrada.",
            items: platforms,
            onCreate: handleCreatePlatform,
            onUpdate: handleUpdatePlatform,
            onDelete: handleDeletePlatform
          })
        : null}

      {activeTab === "locations"
        ? renderSimpleManager({
            key: "locations",
            placeholder: "Nome do local",
            emptyMessage: "Nenhum local cadastrado.",
            items: locations,
            onCreate: handleCreateLocation,
            onUpdate: handleUpdateLocation,
            onDelete: handleDeleteLocation
          })
        : null}

      {activeTab === "models" ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-2">
            <CardTitle>Modelos</CardTitle>
            <CardDescription>{activeTabDescription}</CardDescription>
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
                    Edicao
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
                    Combustivel
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
                    Tipo de cambio
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
                    placeholder="Ex.: 2020"
                    disabled={isModelProcessing}
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
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="gap-2" disabled={isModelProcessing}>
                  <Save className="h-4 w-4" />
                  {editingModelId ? "Atualizar" : "Cadastrar"}
                </Button>
                {editingModelId ? (
                  <Button type="button" variant="ghost" onClick={resetModelForm} disabled={isModelProcessing}>
                    Cancelar edicao
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="space-y-3">
              {models.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum modelo cadastrado por enquanto.</p>
              ) : (
                models.map((model) => (
                  <div key={model.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{model.marca} {model.nome}</p>
                        <p className="text-xs text-slate-400">
                          {model.edicao ?? "Sem edicao"} • {model.carroceria ?? "Sem carroceria"} • {model.combustivel ?? "Sem combustivel"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleEditModel(model)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-red-300 hover:text-red-200"
                          onClick={() => handleDeleteModel(model.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Vigencia {model.ano_inicial ?? "?"} - {model.ano_final ?? "atual"}. Ajuste conforme conectar ao catálogo oficial.
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
