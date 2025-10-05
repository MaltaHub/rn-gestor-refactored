'use client';

import {
  type ChangeEventHandler,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Caracteristica, Local, Loja, Modelo, Plataforma, UnidadeLoja } from "@/types";
import { salvarConfiguracao, remove } from "@/services/configuracoes";
import {
  useLojas,
  usePlataformas,
  useCaracteristicas,
  useModelos,
  useLocais,
  useUnidadesLoja,
} from "@/hooks/use-configuracoes";
import { buildModeloNomeCompletoOrDefault } from "@/utils/modelos";

/* =========================
 * Tipos e fábricas de estado
 * ========================= */
import type { SimpleFormState, ModeloFormState, UnidadeLojaFormState } from "@/types/configuracoes";
import { SectionCard, FeedbackBadge, SimpleForm, EntityList, ModeloForm } from "@/components/configuracoes";

const createSimpleForm = (): SimpleFormState => ({ nome: "" });
const createModeloForm = (): ModeloFormState => ({
  id: null,
  marca: "",
  nome: "",
  combustivel: "gasolina",
  tipo_cambio: "manual",
  motor: "1.0",
  lugares: 5,
  portas: 4,
  cabine: "",
  tracao: "",
  carroceria: "hatch",
  cambio: "",
  cilindros: null,
  criado_em: null,
  edicao: "",
  valvulas: null,
  ano_inicial: null,
  ano_final: null,
});

const createUnidadeForm = (): UnidadeLojaFormState => ({
  id: null,
  loja_id: null,
  nome: "",
  logradouro: "",
  cep: "",
});

/* =============
 * Utilitários
 * ============= */
const parseOptionalInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseOptionalNumberField = (
  value: string | number | null | undefined
): number | null => {
  if (value === null || value === undefined) return null;
  const stringValue = typeof value === "number" ? value.toString() : value;
  return parseOptionalInteger(stringValue);
};

const normalizeEnumValue = <T extends string>(
  value: T | null | undefined,
  allowed: readonly T[],
): T | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const matched = allowed.find((option) => option === normalized);
  return matched ?? null;
};

const sanitizeCep = (value: string) => value.replace(/\D/g, "");

const formatCep = (value: string | null | undefined) => {
  if (!value) return null;
  const digits = sanitizeCep(value);
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const tipoCambioOptions: readonly Exclude<Modelo["tipo_cambio"], null>[] = [
  "manual",
  "automatico",
  "cvt",
  "outro",
];

const combustivelOptions: readonly Exclude<Modelo["combustivel"], null>[] = [
  "gasolina",
  "alcool",
  "flex",
  "diesel",
  "eletrico",
  "hibrido",
];

const carroceriaOptions: readonly Exclude<Modelo["carroceria"], null>[] = [
  "sedan",
  "hatch",
  "camioneta",
  "suv",
  "suv compacto",
  "suv medio",
  "van",
  "buggy",
];

const normalizeTipoCambio = (
  value: ModeloFormState["tipo_cambio"],
): Modelo["tipo_cambio"] => normalizeEnumValue(value, tipoCambioOptions);

const normalizeCombustivel = (
  value: ModeloFormState["combustivel"],
): Modelo["combustivel"] => normalizeEnumValue(value, combustivelOptions);

const normalizeCarroceria = (
  value: ModeloFormState["carroceria"],
): Modelo["carroceria"] => normalizeEnumValue(value, carroceriaOptions);

const toFeedback = (section: string, type: "success" | "error", message: string) => ({
  section,
  type,
  message,
});

function handleInputChange<T>(
  setForm: Dispatch<SetStateAction<T>>,
  field: keyof T
): ChangeEventHandler<HTMLInputElement | HTMLSelectElement> {
  return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
}

function resetForm<T>(factory: () => T, setter: Dispatch<SetStateAction<T>>) {
  setter(factory());
}

/* =========================
 * Página
 * ========================= */
export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();

  enum Areas {
    loja = "loja",
    plataforma = "plataforma",
    caracteristica = "caracteristica",
    local = "local",
    modelo = "modelo",
    unidade_loja = "unidade_loja",
  }

  /** invalida tanto o padrão específico quanto um possível alias por coleção */
  function invalidateForArea(area: Areas) {
    // se seus hooks usam ["configuracoes", area]
    queryClient.invalidateQueries({ queryKey: ["configuracoes", area] });
  }

  type Identifiable = { id?: string | null };

  /** submissão genérica para formulários simples e complexos */
  function createSubmitHandler<TForm extends Identifiable, TPayload extends Identifiable = TForm>({
    area,
    form,
    setForm,
    formFactory,
    setFeedback,
    validate, // opcional
    mapPayload, // opcional (p/ transformar antes de enviar)
    setLoading,
  }: {
    area: Areas;
    form: TForm;
    setForm: Dispatch<SetStateAction<TForm>>;
    formFactory: () => TForm;
    setFeedback: (f: { section: string; type: "success" | "error"; message: string } | null) => void;
    validate?: (f: TForm) => string | null;
    mapPayload?: (f: TForm) => TPayload;
    setLoading: (v: boolean) => void;
  }) {
    return async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const errorMsg = validate?.(form) ?? null;
      if (errorMsg) {
        setFeedback(toFeedback(`${area}s`, "error", errorMsg));
        return;
      }

      try {
        setLoading(true);
        const payload = mapPayload ? mapPayload(form) : (form as unknown as TPayload);
        await salvarConfiguracao(area, payload);
        invalidateForArea(area);

        const isUpdate = Boolean(payload.id);
        setFeedback(
          toFeedback(
            area,
            "success",
            isUpdate ? "Atualizado com sucesso." : "Cadastrado com sucesso."
          )
        );
        resetForm(formFactory, setForm);
      } catch (err) {
        setFeedback(
          toFeedback(
            `${area}s`,
            "error",
            err instanceof Error ? err.message : `Erro ao salvar ${area}.`
          )
        );
      } finally {
        setLoading(false);
      }
    };
  }

/** exclusão genérica */
async function handleDeleteEntity<T extends { id?: string }>(
  area: "loja" | "plataforma" | "caracteristica" | "local" | "modelo" | "unidade_loja",
  entity: T,
  confirmText: string,
  setDeletingId: (id: string | null) => void,
  setFeedback: (f: { section: string; type: "success" | "error"; message: string } | null) => void,
  afterDelete?: () => void
) {
  if (!entity.id) return;
  if (!window.confirm(confirmText)) return;

  setDeletingId(entity.id);
  try {
    await remove(area, entity.id);
    setFeedback(toFeedback(area, "success", "Removido com sucesso."));
    afterDelete?.();
  } catch (err) {
    setFeedback(
      toFeedback(
        `${area}s`,
        "error",
        err instanceof Error ? err.message : `Erro ao remover ${area}.`
      )
    );
  } finally {
    setDeletingId(null);
  }
}

  const { data: lojas } = useLojas();
  const { data: plataformas } = usePlataformas();
  const { data: caracteristicas } = useCaracteristicas();
  const { data: locais } = useLocais();
  const { data: modelos } = useModelos();
  const { data: unidadesLoja } = useUnidadesLoja();

  const [lojaForm, setLojaForm] = useState<SimpleFormState>(createSimpleForm());
  const [plataformaForm, setPlataformaForm] = useState<SimpleFormState>(createSimpleForm());
  const [caracteristicaForm, setCaracteristicaForm] = useState<SimpleFormState>(createSimpleForm());
  const [localForm, setLocalForm] = useState<SimpleFormState>(createSimpleForm());
  const [modeloForm, setModeloForm] = useState<ModeloFormState>(createModeloForm());
  const [unidadeForm, setUnidadeForm] = useState<UnidadeLojaFormState>(createUnidadeForm());

  const [feedback, setFeedback] = useState<{ section: string; type: "success" | "error"; message: string } | null>(null);

  const [lojaDeletingId, setLojaDeletingId] = useState<string | null>(null);
  const [plataformaDeletingId, setPlataformaDeletingId] = useState<string | null>(null);
  const [caracteristicaDeletingId, setCaracteristicaDeletingId] = useState<string | null>(null);
  const [localDeletingId, setLocalDeletingId] = useState<string | null>(null);
  const [modeloDeletingId, setModeloDeletingId] = useState<string | null>(null);
  const [unidadeDeletingId, setUnidadeDeletingId] = useState<string | null>(null);

  const [loadingLoja, setLoadingLoja] = useState(false);
  const [loadingPlataforma, setLoadingPlataforma] = useState(false);
  const [loadingCaracteristica, setLoadingCaracteristica] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingModelo, setLoadingModelo] = useState(false);
  const [loadingUnidade, setLoadingUnidade] = useState(false);

  const sortedLojas = useMemo(() => (lojas ? [...lojas].sort((a, b) => a.nome.localeCompare(b.nome)) : []), [lojas]);
  const sortedPlataformas = useMemo(() => (plataformas ? [...plataformas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : []), [plataformas]);
  const sortedCaracteristicas = useMemo(() => (caracteristicas ? [...caracteristicas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : []), [caracteristicas]);
  const sortedLocais = useMemo<Local[]>(() => {
    if (!locais) return [];
    return locais
      .filter((local) => local.origem === "local")
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  }, [locais]);
  const lojasPorId = useMemo(() => {
    const map = new Map<string, Loja>();
    (lojas ?? []).forEach((loja) => {
      if (loja.id) {
        map.set(loja.id, loja);
      }
    });
    return map;
  }, [lojas]);
  type ModeloComNomeCompleto = Modelo & { nomeCompleto: string };
  type UnidadeLojaComLoja = UnidadeLoja & { lojaNome: string };

  const unidadesComLoja = useMemo<UnidadeLojaComLoja[]>(() => {
    if (!unidadesLoja) return [];

    const lista = unidadesLoja.map((unidade) => ({
      ...unidade,
      lojaNome: lojasPorId.get(unidade.loja_id)?.nome ?? "Loja não encontrada",
    }));

    return lista.sort((a, b) => {
      const lojaComparacao = a.lojaNome.localeCompare(b.lojaNome, "pt-BR", { sensitivity: "base" });
      if (lojaComparacao !== 0) return lojaComparacao;
      return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    });
  }, [lojasPorId, unidadesLoja]);

  const modelosComNomeCompleto = useMemo<ModeloComNomeCompleto[]>(
    () =>
      (modelos ?? []).map((modelo) => ({
        ...modelo,
        nomeCompleto: buildModeloNomeCompletoOrDefault(modelo),
      })),
    [modelos],
  );

  const sortedModelos = useMemo(
    () =>
      [...modelosComNomeCompleto].sort((a, b) => {
        const chaveA = `${a.marca ?? ""} ${a.nomeCompleto}`.trim();
        const chaveB = `${b.marca ?? ""} ${b.nomeCompleto}`.trim();
        return chaveA.localeCompare(chaveB, "pt-BR", { sensitivity: "base" });
      }),
    [modelosComNomeCompleto],
  );

  // handlers genéricos (um por área)
  const handleLojaSubmit = createSubmitHandler<SimpleFormState>({
    area: Areas.loja,
    form: lojaForm,
    setForm: setLojaForm,
    formFactory: createSimpleForm,
    setFeedback,
    validate: (f) => (f.nome.trim() ? null : "Informe o nome da loja."),
    setLoading: setLoadingLoja,
  });

  const handlePlataformaSubmit = createSubmitHandler<SimpleFormState>({
    area: Areas.plataforma,
    form: plataformaForm,
    setForm: setPlataformaForm,
    formFactory: createSimpleForm,
    setFeedback,
    validate: (f) => (f.nome.trim() ? null : "Informe o nome da plataforma."),
    setLoading: setLoadingPlataforma,
  });

  const handleCaracteristicaSubmit = createSubmitHandler<SimpleFormState>({
    area: Areas.caracteristica,
    form: caracteristicaForm,
    setForm: setCaracteristicaForm,
    formFactory: createSimpleForm,
    setFeedback,
    validate: (f) => (f.nome.trim() ? null : "Informe o nome da característica."),
    setLoading: setLoadingCaracteristica,
  });

  const handleLocalSubmit = createSubmitHandler<SimpleFormState>({
    area: Areas.local,
    form: localForm,
    setForm: setLocalForm,
    formFactory: createSimpleForm,
    setFeedback,
    validate: (f) => (f.nome.trim() ? null : "Informe o nome do local."),
    setLoading: setLoadingLocal,
  });

  const handleModeloSubmit = createSubmitHandler<ModeloFormState>({
    area: Areas.modelo,
    form: modeloForm,
    setForm: setModeloForm,
    formFactory: createModeloForm,
    setFeedback,
    validate: (f) => (!f.marca.trim() || !f.nome.trim() ? "Informe marca e nome do modelo." : null),
    mapPayload: (f) => ({
      id: typeof f.id === "string" ? f.id.trim() : undefined,
      marca: f.marca.trim(),
      nome: f.nome.trim(),
      combustivel: normalizeCombustivel(f.combustivel),
      tipo_cambio: normalizeTipoCambio(f.tipo_cambio),
      motor: f.motor?.trim() || null,
      lugares: parseOptionalNumberField(f.lugares ?? null),
      portas: parseOptionalNumberField(f.portas ?? null),
      cabine: f.cabine?.trim() || null,
      tracao: f.tracao?.trim() || null,
      carroceria: normalizeCarroceria(f.carroceria),
      cambio: f.cambio?.trim() || null,
      criado_em: f.criado_em ?? null,
      edicao: f.edicao?.trim() || null,
      ano_inicial: parseOptionalNumberField(f.ano_inicial ?? null),
      ano_final: parseOptionalNumberField(f.ano_final ?? null),
      cilindros: parseOptionalNumberField(f.cilindros ?? null),
      valvulas: parseOptionalNumberField(f.valvulas ?? null),
    }),
    setLoading: setLoadingModelo,
  });

  const handleUnidadeSubmit = createSubmitHandler<
    UnidadeLojaFormState,
    {
      id?: string;
      loja_id: string;
      nome: string;
      logradouro: string | null;
      cep: string | null;
    }
  >({
    area: Areas.unidade_loja,
    form: unidadeForm,
    setForm: setUnidadeForm,
    formFactory: createUnidadeForm,
    setFeedback,
    validate: (f) => {
      if (!f.nome.trim()) return "Informe o nome da unidade.";
      if (!f.loja_id) return "Selecione a loja vinculada.";
      return null;
    },
    mapPayload: (f) => {
      const id = typeof f.id === "string" && f.id.trim() ? f.id.trim() : undefined;
      const lojaId = f.loja_id ?? "";
      const logradouro = f.logradouro.trim() ? f.logradouro.trim() : null;
      const cepDigits = sanitizeCep(f.cep ?? "");

      return {
        id,
        loja_id: lojaId,
        nome: f.nome.trim(),
        logradouro,
        cep: cepDigits ? cepDigits : null,
      };
    },
    setLoading: setLoadingUnidade,
  });

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-zinc-900">Configurações do catálogo</h1>
          <p className="max-w-3xl text-sm text-zinc-600">
            Gerencie as tabelas auxiliares que alimentam o cadastro de veículos. As alterações refletirão nos formulários de edição imediatamente.
          </p>
        </header>

        {/* LOJAS */}
        <SectionCard
          title="Lojas"
          subtitle="Defina as unidades responsáveis por receber veículos em estoque."
          badge={<FeedbackBadge feedback={feedback} section="lojas" />}
        >
          <SimpleForm
            label="Nome da loja"
            value={lojaForm.nome}
            onChange={handleInputChange(setLojaForm, "nome")}
            onSubmit={handleLojaSubmit}
            onCancel={() => {
              resetForm(createSimpleForm, setLojaForm);
              setFeedback(null);
            }}
            loading={loadingLoja}
            isEditing={!!lojaForm.id}
          />
          <EntityList<Loja>
            items={sortedLojas}
            emptyText="Nenhuma loja cadastrada ainda."
            removingId={lojaDeletingId}
            removeDisabled={(l) => !l.id}
            onEdit={(l) => {
              setLojaForm({ id: l.id ?? undefined, nome: l.nome });
              setFeedback(null);
            }}
            onRemove={(l) =>
              handleDeleteEntity(
                "loja",
                l,
                `Remover a loja "${l.nome}"?`,
                setLojaDeletingId,
                setFeedback,
                () => {
                  if (lojaForm.id === l.id) resetForm(createSimpleForm, setLojaForm);
                  invalidateForArea(Areas.loja);
                }
              )
            }
          />
        </SectionCard>

        {/* PLATAFORMAS */}
        <SectionCard
          title="Plataformas"
          subtitle="Controle os canais de divulgação usados pelos seus anúncios."
          badge={<FeedbackBadge feedback={feedback} section="plataformas" />}
        >
          <SimpleForm
            label="Nome da plataforma"
            value={plataformaForm.nome}
            onChange={handleInputChange(setPlataformaForm, "nome")}
            onSubmit={handlePlataformaSubmit}
            onCancel={() => {
              resetForm(createSimpleForm, setPlataformaForm);
              setFeedback(null);
            }}
            loading={loadingPlataforma}
            isEditing={!!plataformaForm.id}
          />
          <EntityList<Plataforma>
            items={sortedPlataformas}
            emptyText="Nenhuma plataforma cadastrada."
            removingId={plataformaDeletingId}
            removeDisabled={(p) => !p.id}
            onEdit={(p) => {
              setPlataformaForm({ id: p.id ?? undefined, nome: p.nome });
              setFeedback(null);
            }}
            onRemove={(p) =>
              handleDeleteEntity(
                "plataforma",
                p,
                `Remover a plataforma "${p.nome}"?`,
                setPlataformaDeletingId,
                setFeedback,
                () => {
                  if (plataformaForm.id === p.id) resetForm(createSimpleForm, setPlataformaForm);
                  invalidateForArea(Areas.plataforma);
                }
              )
            }
          />
        </SectionCard>

        {/* CARACTERÍSTICAS */}
        <SectionCard
          title="Características"
          subtitle="Liste os atributos que podem ser vinculados aos veículos."
          badge={<FeedbackBadge feedback={feedback} section="caracteristicas" />}
        >
          <SimpleForm
            label="Nome da característica"
            value={caracteristicaForm.nome}
            onChange={handleInputChange(setCaracteristicaForm, "nome")}
            onSubmit={handleCaracteristicaSubmit}
            onCancel={() => {
              resetForm(createSimpleForm, setCaracteristicaForm);
              setFeedback(null);
            }}
            loading={loadingCaracteristica}
            isEditing={!!caracteristicaForm.id}
          />
          <EntityList<Caracteristica>
            items={sortedCaracteristicas}
            emptyText="Nenhuma característica cadastrada."
            removingId={caracteristicaDeletingId}
            removeDisabled={(c) => !c.id}
            onEdit={(c) => {
              setCaracteristicaForm({ id: c.id ?? undefined, nome: c.nome });
              setFeedback(null);
            }}
            onRemove={(c) =>
              handleDeleteEntity(
                "caracteristica",
                c,
                `Remover a característica "${c.nome}"?`,
                setCaracteristicaDeletingId,
                setFeedback,
                () => {
                  if (caracteristicaForm.id === c.id) resetForm(createSimpleForm, setCaracteristicaForm);
                  invalidateForArea(Areas.caracteristica);
                }
              )
            }
          />
        </SectionCard>

        {/* LOCAIS */}
        <SectionCard
          title="Locais"
          subtitle="Mapeie os pontos físicos onde os veículos podem ficar disponíveis."
          badge={<FeedbackBadge feedback={feedback} section="locais" />}
        >
          <SimpleForm
            label="Nome do local"
            value={localForm.nome}
            onChange={handleInputChange(setLocalForm, "nome")}
            onSubmit={handleLocalSubmit}
            onCancel={() => {
              resetForm(createSimpleForm, setLocalForm);
              setFeedback(null);
            }}
            loading={loadingLocal}
            isEditing={!!localForm.id}
          />
          <EntityList<Local>
            items={sortedLocais}
            emptyText="Nenhum local cadastrado."
            removingId={localDeletingId}
            removeDisabled={(l) => !l.id}
            onEdit={(l) => {
              setLocalForm({ id: l.id ?? undefined, nome: l.nome });
              setFeedback(null);
            }}
            onRemove={(l) =>
              handleDeleteEntity(
                "local",
                l,
                `Remover o local "${l.nome}"?`,
                setLocalDeletingId,
                setFeedback,
                () => {
                  if (localForm.id === l.id) resetForm(createSimpleForm, setLocalForm);
                  invalidateForArea(Areas.local);
                }
              )
            }
          />
        </SectionCard>

        {/* UNIDADES POR LOJA */}
        <SectionCard
          title="Unidades por loja"
          subtitle="Cadastre os showrooms e unidades físicas associados a cada loja."
          badge={<FeedbackBadge feedback={feedback} section="unidade_loja" />}
        >
          <form
            onSubmit={handleUnidadeSubmit}
            className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700">Loja vinculada</span>
              <select
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                value={unidadeForm.loja_id ?? ""}
                onChange={(event) =>
                  setUnidadeForm((prev) => ({ ...prev, loja_id: event.target.value || null }))
                }
                required
              >
                <option value="">Selecione uma loja</option>
                {sortedLojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700">Nome da unidade</span>
              <input
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                value={unidadeForm.nome}
                onChange={handleInputChange(setUnidadeForm, "nome")}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Logradouro (opcional)</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={unidadeForm.logradouro}
                  onChange={handleInputChange(setUnidadeForm, "logradouro")}
                  placeholder="Rua, número..."
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">CEP (opcional)</span>
                <input
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
                  value={unidadeForm.cep}
                  onChange={(event) => {
                    const digits = sanitizeCep(event.target.value);
                    setUnidadeForm((prev) => ({ ...prev, cep: digits }));
                  }}
                  maxLength={8}
                  inputMode="numeric"
                  placeholder="00000000"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
                disabled={loadingUnidade}
              >
                {loadingUnidade ? "Salvando..." : unidadeForm.id ? "Atualizar" : "Adicionar"}
              </button>
              {unidadeForm.id && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                  onClick={() => {
                    resetForm(createUnidadeForm, setUnidadeForm);
                    setFeedback(null);
                  }}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>

          <EntityList<UnidadeLojaComLoja>
            items={unidadesComLoja}
            emptyText="Nenhuma unidade cadastrada."
            removingId={unidadeDeletingId}
            removeDisabled={(u) => !u.id}
            onEdit={(u) => {
              setUnidadeForm({
                id: u.id ?? null,
                loja_id: u.loja_id,
                nome: u.nome,
                logradouro: u.logradouro ?? "",
                cep: sanitizeCep(u.cep ?? ""),
              });
              setFeedback(null);
            }}
            onRemove={(u) =>
              handleDeleteEntity(
                "unidade_loja",
                u,
                `Remover a unidade "${u.nome}" da loja "${u.lojaNome}"?`,
                setUnidadeDeletingId,
                setFeedback,
                () => {
                  if (unidadeForm.id === u.id) resetForm(createUnidadeForm, setUnidadeForm);
                  invalidateForArea(Areas.unidade_loja);
                }
              )
            }
            renderTitle={(u) => `${u.lojaNome} — ${u.nome}`}
            renderExtra={(u) => {
              const endereco = [u.logradouro?.trim() || null, formatCep(u.cep)]
                .filter(Boolean)
                .join(" • ");
              if (!endereco) {
                return <p className="text-xs text-zinc-400">Sem endereço informado</p>;
              }
              return <p className="text-xs text-zinc-500">{endereco}</p>;
            }}
          />
        </SectionCard>

        {/* MODELOS */}
        <SectionCard
          title="Modelos"
          subtitle="Cadastre as combinações de marca e modelo para vincular aos veículos."
          badge={<FeedbackBadge feedback={feedback} section="modelos" />}
        >
          <ModeloForm
            form={modeloForm}
            onChange={(f) => handleInputChange(setModeloForm, f)}
            onSubmit={handleModeloSubmit}
          onCancel={() => {
            resetForm(createModeloForm, setModeloForm);
            setFeedback(null);
          }}
          loading={loadingModelo}
          isEditing={!!modeloForm.id}
        />
          <EntityList<ModeloComNomeCompleto>
            items={sortedModelos}
            emptyText="Nenhum modelo cadastrado."
            removingId={modeloDeletingId}
            removeDisabled={(m) => !m.id}
            onEdit={(m) => {
              setModeloForm({
                id: m.id ?? null,
                marca: m.marca ?? "",
                nome: m.nome ?? "",
                combustivel: m.combustivel ?? "gasolina",
                tipo_cambio: m.tipo_cambio ?? "manual",
                motor: m.motor ?? "",
                lugares: m.lugares ? m.lugares : 5,
                portas: m.portas ? m.portas : 4,
                cabine: m.cabine ?? "",
                tracao: m.tracao ?? "",
                carroceria: m.carroceria ?? "hatch",
                cambio: m.cambio ?? "",
                cilindros: m.cilindros ?? null,
                criado_em: m.criado_em,
                edicao: m.edicao ?? "",
                valvulas: m.valvulas ?? null,
                ano_inicial: m.ano_inicial ?? null,
                ano_final: m.ano_final ?? null,
              });
              setFeedback(null);
            }}
            onRemove={(m) =>
              handleDeleteEntity(
                "modelo",
                m,
                `Remover o modelo "${m.marca} ${m.nome}"?`,
                setModeloDeletingId,
                setFeedback,
                () => {
                  if (modeloForm.id === m.id) {
                    resetForm(createModeloForm, setModeloForm);
                  }
                  invalidateForArea(Areas.modelo);
                }
              )
            }
            renderExtra={(m) => (
              <p className="text-xs text-zinc-500">
                {[m.combustivel, m.tipo_cambio, m.motor, m.carroceria, m.edicao]
                  .filter(Boolean)
                  .join(" • ") || "—"}
              </p>
            )}
            renderTitle={(m) => (m.marca ? `${m.marca} — ${m.nomeCompleto}` : m.nomeCompleto)}
          />
        </SectionCard>
      </div>
    </div>
  );
}
