'use client';

import {
  type ChangeEvent,
  type ChangeEventHandler,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useMemo,
  useState,
} from "react";

import {
  useConfiguracoesSnapshot,
  useDeleteCaracteristica,
  useDeleteLocal,
  useDeleteLoja,
  useDeleteModelo,
  useDeletePlataforma,
  useSaveCaracteristica,
  useSaveLocal,
  useSaveLoja,
  useSaveModelo,
  useSavePlataforma,
} from "@/hooks/use-configuracoes";
import type {
  Caracteristica,
  Local,
  Loja,
  Modelo,
  Plataforma,
} from "@/types/supabase";

interface SimpleFormState {
  id?: string;
  nome: string;
}

interface ModeloFormState {
  id?: string;
  marca: string;
  nome: string;
  combustivel: string;
  tipo_cambio: string;
  motor: string;
  lugares: string;
  portas: string;
  cabine: string;
  tracao: string;
  carroceria: string;
}

const createSimpleForm = (): SimpleFormState => ({
  nome: "",
});

const createModeloForm = (): ModeloFormState => ({
  marca: "",
  nome: "",
  combustivel: "",
  tipo_cambio: "",
  motor: "",
  lugares: "",
  portas: "",
  cabine: "",
  tracao: "",
  carroceria: "",
});

const parseOptionalInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const toFeedback = (section: string, type: "success" | "error", message: string) => ({
  section,
  type,
  message,
});

export default function ConfiguracoesPage() {
  const { data: configuracoes, isLoading, isError } = useConfiguracoesSnapshot();

  const saveLoja = useSaveLoja();
  const deleteLoja = useDeleteLoja();
  const savePlataforma = useSavePlataforma();
  const deletePlataforma = useDeletePlataforma();
  const saveCaracteristica = useSaveCaracteristica();
  const deleteCaracteristica = useDeleteCaracteristica();
  const saveLocal = useSaveLocal();
  const deleteLocal = useDeleteLocal();
  const saveModelo = useSaveModelo();
  const deleteModelo = useDeleteModelo();

  const [lojaForm, setLojaForm] = useState<SimpleFormState>(createSimpleForm());
  const [plataformaForm, setPlataformaForm] = useState<SimpleFormState>(createSimpleForm());
  const [caracteristicaForm, setCaracteristicaForm] =
    useState<SimpleFormState>(createSimpleForm());
  const [localForm, setLocalForm] = useState<SimpleFormState>(createSimpleForm());
  const [modeloForm, setModeloForm] = useState<ModeloFormState>(createModeloForm());

  const [feedback, setFeedback] = useState<
    { section: string; type: "success" | "error"; message: string } | null
  >(null);
  const [lojaDeletingId, setLojaDeletingId] = useState<string | null>(null);
  const [plataformaDeletingId, setPlataformaDeletingId] = useState<string | null>(
    null,
  );
  const [caracteristicaDeletingId, setCaracteristicaDeletingId] = useState<
    string | null
  >(null);
  const [localDeletingId, setLocalDeletingId] = useState<string | null>(null);
  const [modeloDeletingId, setModeloDeletingId] = useState<string | null>(null);

  const sortedLojas = useMemo(
    () =>
      [...(configuracoes?.lojas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.lojas],
  );

  const sortedPlataformas = useMemo(
    () =>
      [...(configuracoes?.plataformas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.plataformas],
  );

  const sortedCaracteristicas = useMemo(
    () =>
      [...(configuracoes?.caracteristicas ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.caracteristicas],
  );

  const sortedLocais = useMemo(
    () =>
      [...(configuracoes?.locais ?? [])].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      ),
    [configuracoes?.locais],
  );

  const sortedModelos = useMemo(
    () =>
      [...(configuracoes?.modelos ?? [])].sort((a, b) =>
        `${a.marca} ${a.nome}`.localeCompare(`${b.marca} ${b.nome}`, "pt-BR"),
      ),
    [configuracoes?.modelos],
  );

  const isSnapshotReady = Boolean(configuracoes) || (!isLoading && !isError);

  const handleSimpleInputChange = (
    setter: Dispatch<SetStateAction<SimpleFormState>>,
    field: keyof SimpleFormState,
  ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setter((previous) => ({ ...previous, [field]: value }));
    };

  const handleModeloInputChange = (
    field: keyof ModeloFormState,
  ): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      const { value } = event.target;
      setModeloForm((previous) => ({ ...previous, [field]: value }));
    };

  const handleLojaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lojaForm.nome.trim()) {
      setFeedback(toFeedback("lojas", "error", "Informe o nome da loja."));
      return;
    }

    try {
      await saveLoja.mutateAsync({
        id: lojaForm.id || undefined,
        nome: lojaForm.nome.trim(),
      });
      setFeedback(
        toFeedback(
          "lojas",
          "success",
          lojaForm.id ? "Loja atualizada com sucesso." : "Loja cadastrada.",
        ),
      );
      setLojaForm(createSimpleForm());
    } catch (error) {
      setFeedback(
        toFeedback(
          "lojas",
          "error",
          error instanceof Error ? error.message : "Erro ao salvar a loja.",
        ),
      );
    }
  };

  const handlePlataformaSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!plataformaForm.nome.trim()) {
      setFeedback(
        toFeedback("plataformas", "error", "Informe o nome da plataforma."),
      );
      return;
    }

    try {
      await savePlataforma.mutateAsync({
        id: plataformaForm.id || undefined,
        nome: plataformaForm.nome.trim(),
      });
      setFeedback(
        toFeedback(
          "plataformas",
          "success",
          plataformaForm.id
            ? "Plataforma atualizada com sucesso."
            : "Plataforma cadastrada.",
        ),
      );
      setPlataformaForm(createSimpleForm());
    } catch (error) {
      setFeedback(
        toFeedback(
          "plataformas",
          "error",
          error instanceof Error
            ? error.message
            : "Erro ao salvar a plataforma.",
        ),
      );
    }
  };

  const handleCaracteristicaSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!caracteristicaForm.nome.trim()) {
      setFeedback(
        toFeedback(
          "caracteristicas",
          "error",
          "Informe o nome da característica.",
        ),
      );
      return;
    }

    try {
      await saveCaracteristica.mutateAsync({
        id: caracteristicaForm.id || undefined,
        nome: caracteristicaForm.nome.trim(),
      });
      setFeedback(
        toFeedback(
          "caracteristicas",
          "success",
          caracteristicaForm.id
            ? "Característica atualizada."
            : "Característica cadastrada.",
        ),
      );
      setCaracteristicaForm(createSimpleForm());
    } catch (error) {
      setFeedback(
        toFeedback(
          "caracteristicas",
          "error",
          error instanceof Error
            ? error.message
            : "Erro ao salvar a característica.",
        ),
      );
    }
  };

  const handleLocalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!localForm.nome.trim()) {
      setFeedback(toFeedback("locais", "error", "Informe o nome do local."));
      return;
    }

    try {
      await saveLocal.mutateAsync({
        id: localForm.id || undefined,
        nome: localForm.nome.trim(),
      });
      setFeedback(
        toFeedback(
          "locais",
          "success",
          localForm.id ? "Local atualizado." : "Local cadastrado.",
        ),
      );
      setLocalForm(createSimpleForm());
    } catch (error) {
      setFeedback(
        toFeedback(
          "locais",
          "error",
          error instanceof Error ? error.message : "Erro ao salvar o local.",
        ),
      );
    }
  };

  const handleModeloSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modeloForm.nome.trim() || !modeloForm.marca.trim()) {
      setFeedback(
        toFeedback(
          "modelos",
          "error",
          "Informe marca e nome do modelo.",
        ),
      );
      return;
    }

    try {
      await saveModelo.mutateAsync({
        id: modeloForm.id || undefined,
        marca: modeloForm.marca.trim(),
        nome: modeloForm.nome.trim(),
        combustivel: modeloForm.combustivel.trim() || null,
        tipo_cambio: modeloForm.tipo_cambio.trim() || null,
        motor: modeloForm.motor.trim() || null,
        lugares: parseOptionalInteger(modeloForm.lugares),
        portas: parseOptionalInteger(modeloForm.portas),
        cabine: modeloForm.cabine.trim() || null,
        tracao: modeloForm.tracao.trim() || null,
        carroceria: modeloForm.carroceria.trim() || null,
      });
      setFeedback(
        toFeedback(
          "modelos",
          "success",
          modeloForm.id ? "Modelo atualizado." : "Modelo cadastrado.",
        ),
      );
      setModeloForm(createModeloForm());
    } catch (error) {
      setFeedback(
        toFeedback(
          "modelos",
          "error",
          error instanceof Error ? error.message : "Erro ao salvar o modelo.",
        ),
      );
    }
  };

  const handleDeleteLoja = async (loja: Loja) => {
    if (!loja.id) return;
    if (!window.confirm(`Remover a loja "${loja.nome}"?`)) return;

    setLojaDeletingId(loja.id);
    try {
      await deleteLoja.mutateAsync(loja.id);
      setFeedback(toFeedback("lojas", "success", "Loja removida."));
      if (lojaForm.id === loja.id) {
        setLojaForm(createSimpleForm());
      }
    } catch (error) {
      setFeedback(
        toFeedback(
          "lojas",
          "error",
          error instanceof Error ? error.message : "Erro ao remover a loja.",
        ),
      );
    } finally {
      setLojaDeletingId(null);
    }
  };

  const handleDeletePlataforma = async (plataforma: Plataforma) => {
    if (!plataforma.id) return;
    if (!window.confirm(`Remover a plataforma "${plataforma.nome}"?`)) return;

    setPlataformaDeletingId(plataforma.id);
    try {
      await deletePlataforma.mutateAsync(plataforma.id);
      setFeedback(
        toFeedback("plataformas", "success", "Plataforma removida."),
      );
      if (plataformaForm.id === plataforma.id) {
        setPlataformaForm(createSimpleForm());
      }
    } catch (error) {
      setFeedback(
        toFeedback(
          "plataformas",
          "error",
          error instanceof Error
            ? error.message
            : "Erro ao remover a plataforma.",
        ),
      );
    } finally {
      setPlataformaDeletingId(null);
    }
  };

  const handleDeleteCaracteristica = async (caracteristica: Caracteristica) => {
    if (!caracteristica.id) return;
    if (!window.confirm(`Remover a característica "${caracteristica.nome}"?`)) {
      return;
    }

    setCaracteristicaDeletingId(caracteristica.id);
    try {
      await deleteCaracteristica.mutateAsync(caracteristica.id);
      setFeedback(
        toFeedback(
          "caracteristicas",
          "success",
          "Característica removida.",
        ),
      );
      if (caracteristicaForm.id === caracteristica.id) {
        setCaracteristicaForm(createSimpleForm());
      }
    } catch (error) {
      setFeedback(
        toFeedback(
          "caracteristicas",
          "error",
          error instanceof Error
            ? error.message
            : "Erro ao remover a característica.",
        ),
      );
    } finally {
      setCaracteristicaDeletingId(null);
    }
  };

  const handleDeleteLocal = async (local: Local) => {
    if (!local.id) return;
    if (!window.confirm(`Remover o local "${local.nome}"?`)) return;

    setLocalDeletingId(local.id);
    try {
      await deleteLocal.mutateAsync(local.id);
      setFeedback(toFeedback("locais", "success", "Local removido."));
      if (localForm.id === local.id) {
        setLocalForm(createSimpleForm());
      }
    } catch (error) {
      setFeedback(
        toFeedback(
          "locais",
          "error",
          error instanceof Error ? error.message : "Erro ao remover o local.",
        ),
      );
    } finally {
      setLocalDeletingId(null);
    }
  };

  const handleDeleteModelo = async (modelo: Modelo) => {
    if (!modelo.id) return;
    if (!window.confirm(`Remover o modelo "${modelo.marca} ${modelo.nome}"?`)) {
      return;
    }

    setModeloDeletingId(modelo.id);
    try {
      await deleteModelo.mutateAsync(modelo.id);
      setFeedback(toFeedback("modelos", "success", "Modelo removido."));
      if (modeloForm.id === modelo.id) {
        setModeloForm(createModeloForm());
      }
    } catch (error) {
      setFeedback(
        toFeedback(
          "modelos",
          "error",
          error instanceof Error ? error.message : "Erro ao remover o modelo.",
        ),
      );
    } finally {
      setModeloDeletingId(null);
    }
  };

  if (isLoading && !isSnapshotReady) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-zinc-600">
            Carregando configurações do catálogo...
          </p>
        </div>
      </div>
    );
  }

  if (isError && !configuracoes) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-red-600">
            Não foi possível carregar as configurações. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Configurações do catálogo
          </h1>
          <p className="max-w-3xl text-sm text-zinc-600">
            Gerencie as tabelas auxiliares que alimentam o cadastro de veículos.
            As alterações refletirão nos formulários de edição imediatamente.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-800">Lojas</h2>
              <p className="text-sm text-zinc-500">
                Defina as unidades responsáveis por receber veículos em estoque.
              </p>
            </div>
            {feedback?.section === "lojas" && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <form
              onSubmit={handleLojaSubmit}
              className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Nome da loja</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={lojaForm.nome}
                  onChange={handleSimpleInputChange(setLojaForm, "nome")}
                  required
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                  disabled={saveLoja.isPending}
                >
                  {saveLoja.isPending
                    ? "Salvando..."
                    : lojaForm.id
                    ? "Atualizar loja"
                    : "Adicionar loja"}
                </button>
                {lojaForm.id && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                    onClick={() => {
                      setLojaForm(createSimpleForm());
                      setFeedback(null);
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 text-sm">
              {sortedLojas.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
                  Nenhuma loja cadastrada ainda.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedLojas.map((loja, index) => (
                    <li
                      key={loja.id ?? `loja-${index}-${loja.nome}`}
                      className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-zinc-800">{loja.nome}</p>
                        <p className="text-xs text-zinc-500">
                          Empresa: {loja.empresa_id ?? "-"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
                          onClick={() => {
                            setLojaForm({
                              id: loja.id ?? undefined,
                              nome: loja.nome,
                            });
                            setFeedback(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
                          disabled={!loja.id || lojaDeletingId === loja.id || deleteLoja.isPending}
                          onClick={() => handleDeleteLoja(loja)}
                        >
                          {lojaDeletingId === loja.id ? "Removendo..." : "Remover"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-800">Plataformas</h2>
              <p className="text-sm text-zinc-500">
                Controle os canais de divulgação usados pelos seus anúncios.
              </p>
            </div>
            {feedback?.section === "plataformas" && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <form
              onSubmit={handlePlataformaSubmit}
              className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Nome da plataforma</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={plataformaForm.nome}
                  onChange={handleSimpleInputChange(setPlataformaForm, "nome")}
                  required
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                  disabled={savePlataforma.isPending}
                >
                  {savePlataforma.isPending
                    ? "Salvando..."
                    : plataformaForm.id
                    ? "Atualizar plataforma"
                    : "Adicionar plataforma"}
                </button>
                {plataformaForm.id && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                    onClick={() => {
                      setPlataformaForm(createSimpleForm());
                      setFeedback(null);
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 text-sm">
              {sortedPlataformas.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
                  Nenhuma plataforma cadastrada.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedPlataformas.map((plataforma, index) => (
                    <li
                      key={plataforma.id ?? `plataforma-${index}-${plataforma.nome}`}
                      className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-zinc-800">{plataforma.nome}</p>
                        <p className="text-xs text-zinc-500">
                          Empresa: {plataforma.empresa_id ?? "-"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
                          onClick={() => {
                            setPlataformaForm({
                              id: plataforma.id ?? undefined,
                              nome: plataforma.nome,
                            });
                            setFeedback(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
                          disabled={!plataforma.id || plataformaDeletingId === plataforma.id || deletePlataforma.isPending}
                          onClick={() => handleDeletePlataforma(plataforma)}
                        >
                          {plataformaDeletingId === plataforma.id
                            ? "Removendo..."
                            : "Remover"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-800">Características</h2>
              <p className="text-sm text-zinc-500">
                Liste os atributos que podem ser vinculados aos veículos.
              </p>
            </div>
            {feedback?.section === "caracteristicas" && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <form
              onSubmit={handleCaracteristicaSubmit}
              className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Nome da característica</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={caracteristicaForm.nome}
                  onChange={handleSimpleInputChange(setCaracteristicaForm, "nome")}
                  required
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                  disabled={saveCaracteristica.isPending}
                >
                  {saveCaracteristica.isPending
                    ? "Salvando..."
                    : caracteristicaForm.id
                    ? "Atualizar característica"
                    : "Adicionar característica"}
                </button>
                {caracteristicaForm.id && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                    onClick={() => {
                      setCaracteristicaForm(createSimpleForm());
                      setFeedback(null);
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 text-sm">
              {sortedCaracteristicas.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
                  Nenhuma característica cadastrada.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedCaracteristicas.map((caracteristica, index) => (
                    <li
                      key={caracteristica.id ?? `caracteristica-${index}-${caracteristica.nome}`}
                      className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-zinc-800">
                          {caracteristica.nome}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Empresa: {caracteristica.empresa_id ?? "-"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
                          onClick={() => {
                            setCaracteristicaForm({
                              id: caracteristica.id ?? undefined,
                              nome: caracteristica.nome,
                            });
                            setFeedback(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
                          disabled={!caracteristica.id || caracteristicaDeletingId === caracteristica.id || deleteCaracteristica.isPending}
                          onClick={() => handleDeleteCaracteristica(caracteristica)}
                        >
                          {caracteristicaDeletingId === caracteristica.id
                            ? "Removendo..."
                            : "Remover"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-800">Locais</h2>
              <p className="text-sm text-zinc-500">
                Mapeie os pontos físicos onde os veículos podem ficar disponíveis.
              </p>
            </div>
            {feedback?.section === "locais" && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <form
              onSubmit={handleLocalSubmit}
              className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Nome do local</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={localForm.nome}
                  onChange={handleSimpleInputChange(setLocalForm, "nome")}
                  required
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                  disabled={saveLocal.isPending}
                >
                  {saveLocal.isPending
                    ? "Salvando..."
                    : localForm.id
                    ? "Atualizar local"
                    : "Adicionar local"}
                </button>
                {localForm.id && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                    onClick={() => {
                      setLocalForm(createSimpleForm());
                      setFeedback(null);
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 text-sm">
              {sortedLocais.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
                  Nenhum local cadastrado.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedLocais.map((local, index) => (
                    <li
                      key={local.id ?? `local-${index}-${local.nome}`}
                      className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-zinc-800">{local.nome}</p>
                        <p className="text-xs text-zinc-500">
                          Empresa: {local.empresa_id ?? "-"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
                          onClick={() => {
                            setLocalForm({
                              id: local.id ?? undefined,
                              nome: local.nome,
                            });
                            setFeedback(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
                          disabled={!local.id || localDeletingId === local.id || deleteLocal.isPending}
                          onClick={() => handleDeleteLocal(local)}
                        >
                          {localDeletingId === local.id ? "Removendo..." : "Remover"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-zinc-800">Modelos</h2>
              <p className="text-sm text-zinc-500">
                Cadastre as combinações de marca e modelo para vincular aos veículos.
              </p>
            </div>
            {feedback?.section === "modelos" && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            <form
              onSubmit={handleModeloSubmit}
              className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Marca</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.marca}
                    onChange={handleModeloInputChange("marca")}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Nome do modelo</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.nome}
                    onChange={handleModeloInputChange("nome")}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Combustível</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.combustivel}
                    onChange={handleModeloInputChange("combustivel")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Tipo de câmbio</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.tipo_cambio}
                    onChange={handleModeloInputChange("tipo_cambio")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Motor</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.motor}
                    onChange={handleModeloInputChange("motor")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Lugares</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.lugares}
                    onChange={handleModeloInputChange("lugares")}
                    inputMode="numeric"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Portas</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.portas}
                    onChange={handleModeloInputChange("portas")}
                    inputMode="numeric"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Cabine</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.cabine}
                    onChange={handleModeloInputChange("cabine")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-zinc-700">Tração</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.tracao}
                    onChange={handleModeloInputChange("tracao")}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                  <span className="font-medium text-zinc-700">Carroceria</span>
                  <input
                    className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                    value={modeloForm.carroceria}
                    onChange={handleModeloInputChange("carroceria")}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                  disabled={saveModelo.isPending}
                >
                  {saveModelo.isPending
                    ? "Salvando..."
                    : modeloForm.id
                    ? "Atualizar modelo"
                    : "Adicionar modelo"}
                </button>
                {modeloForm.id && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                    onClick={() => {
                      setModeloForm(createModeloForm());
                      setFeedback(null);
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 text-sm">
              {sortedModelos.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
                  Nenhum modelo cadastrado.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedModelos.map((modelo, index) => (
                    <li
                      key={modelo.id ?? `modelo-${index}-${modelo.marca}-${modelo.nome}`}
                      className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-zinc-800">
                          {modelo.marca} • {modelo.nome}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Empresa: {modelo.empresa_id ?? "-"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {[
                            modelo.combustivel,
                            modelo.tipo_cambio,
                            modelo.motor,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
                          onClick={() => {
                            setModeloForm({
                              id: modelo.id ?? undefined,
                              marca: modelo.marca ?? "",
                              nome: modelo.nome ?? "",
                              combustivel: modelo.combustivel ?? "",
                              tipo_cambio: modelo.tipo_cambio ?? "",
                              motor: modelo.motor ?? "",
                              lugares: modelo.lugares?.toString() ?? "",
                              portas: modelo.portas?.toString() ?? "",
                              cabine: modelo.cabine ?? "",
                              tracao: modelo.tracao ?? "",
                              carroceria: modelo.carroceria ?? "",
                            });
                            setFeedback(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
                          disabled={!modelo.id || modeloDeletingId === modelo.id || deleteModelo.isPending}
                          onClick={() => handleDeleteModelo(modelo)}
                        >
                          {modeloDeletingId === modelo.id ? "Removendo..." : "Remover"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
