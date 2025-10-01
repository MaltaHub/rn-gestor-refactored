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

import type { Caracteristica, Local, Loja, Modelo, Plataforma } from "@/types";
import { salvarConfiguracao, remove } from "@/services/configuracoes";
import {
  useLojas,
  usePlataformas,
  useCaracteristicas,
  useModelos,
  useLocais,
} from "@/hooks/use-configuracoes";

/* =========================
 * Tipos e fábricas de estado
 * ========================= */
import type { SimpleFormState, ModeloFormState } from "@/types/configuracoes";
import { SectionCard, FeedbackBadge, SimpleForm, EntityList, ModeloForm } from "@/components/configuracoes";

const carrocerias = [
  "sedan",
  "hatch",
  "camioneta",
  "suv",
  "suv compacto",
  "suv medio",
  "van",
  "buggy",
];

const combustiveis = [
  "gasolina",
  "alcool",
  "flex",
  "diesel",
  "eletrico",
  "hibrido",
];

const tiposCambio = ["manual", "automatico", "cvt", "outro"];

const createSimpleForm = (): SimpleFormState => ({ nome: "" });
const createModeloForm = (): ModeloFormState => ({
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
  cambio: null,
  cilindros: null,
  criado_em: null,
  edicao: null,
  valvulas: null,
  ano_inicial: null,
  ano_final: null,
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

const toFeedback = (section: string, type: "success" | "error", message: string) => ({
  section,
  type,
  message,
});

function handleInputChange<T>(
  setForm: Dispatch<SetStateAction<T>>,
  field: keyof T
): ChangeEventHandler<HTMLInputElement> {
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
  }

  /** invalida tanto o padrão específico quanto um possível alias por coleção */
function invalidateForArea(area: Areas) {
  
  // se seus hooks usam ["configuracoes", area]
  queryClient.invalidateQueries({ queryKey: ["configuracoes", area] });
}

/** submissão genérica para formulários simples e complexos */
function createSubmitHandler<T>({
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
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  formFactory: () => T;
  setFeedback: (f: { section: string; type: "success" | "error"; message: string } | null) => void;
  validate?: (f: T) => string | null;
  mapPayload?: (f: T) => any;
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
      const payload = mapPayload ? mapPayload(form) : form;
      await salvarConfiguracao(area, payload);
      invalidateForArea(area);

      const updated = (form as any)?.id;
      setFeedback(
        toFeedback(
          area,
          "success",
          updated ? "Atualizado com sucesso." : "Cadastrado com sucesso."
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
  area: "loja" | "plataforma" | "caracteristica" | "local" | "modelo",
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

  const [lojaForm, setLojaForm] = useState<SimpleFormState>(createSimpleForm());
  const [plataformaForm, setPlataformaForm] = useState<SimpleFormState>(createSimpleForm());
  const [caracteristicaForm, setCaracteristicaForm] = useState<SimpleFormState>(createSimpleForm());
  const [localForm, setLocalForm] = useState<SimpleFormState>(createSimpleForm());
  const [modeloForm, setModeloForm] = useState<ModeloFormState>(createModeloForm());

  const [feedback, setFeedback] = useState<{ section: string; type: "success" | "error"; message: string } | null>(null);

  const [lojaDeletingId, setLojaDeletingId] = useState<string | null>(null);
  const [plataformaDeletingId, setPlataformaDeletingId] = useState<string | null>(null);
  const [caracteristicaDeletingId, setCaracteristicaDeletingId] = useState<string | null>(null);
  const [localDeletingId, setLocalDeletingId] = useState<string | null>(null);
  const [modeloDeletingId, setModeloDeletingId] = useState<string | null>(null);

  const [loadingLoja, setLoadingLoja] = useState(false);
  const [loadingPlataforma, setLoadingPlataforma] = useState(false);
  const [loadingCaracteristica, setLoadingCaracteristica] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingModelo, setLoadingModelo] = useState(false);

  const sortedLojas = useMemo(() => (lojas ? [...lojas].sort((a, b) => a.nome.localeCompare(b.nome)) : []), [lojas]);
  const sortedPlataformas = useMemo(() => (plataformas ? [...plataformas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : []), [plataformas]);
  const sortedCaracteristicas = useMemo(() => (caracteristicas ? [...caracteristicas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : []), [caracteristicas]);
  const sortedLocais = useMemo(() => (locais ? [...locais].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : []), [locais]);
  const sortedModelos = useMemo(
    () => (modelos ? [...modelos].sort((a, b) => `${a.marca} ${a.nome}`.localeCompare(`${b.marca} ${b.nome}`, "pt-BR")) : []),
    [modelos]
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
      marca: f.marca.trim(),
      nome: f.nome.trim(),
      combustivel: f.combustivel?.trim() || null,
      tipo_cambio: f.tipo_cambio?.trim() || null,
      motor: f.motor?.trim() || null,
      lugares: parseOptionalInteger(f.lugares ? f.lugares.toString() : ""),
      portas: parseOptionalInteger(f.portas? f.portas.toString() : ""),
      cabine: f.cabine?.trim() || null,
      tracao: f.tracao?.trim() || null,
      carroceria: f.carroceria?.trim() || null,
    }),
    setLoading: setLoadingModelo,
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
            isEditing={!!modeloForm}
          />
          <EntityList<Modelo>
            items={sortedModelos}
            emptyText="Nenhum modelo cadastrado."
            removingId={modeloDeletingId}
            removeDisabled={(m) => !m.id}
            onEdit={(m) => {
              setModeloForm({
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
                cambio: m.cambio,
                cilindros: m.cilindros,
                criado_em: m.criado_em,
                edicao: m.edicao,
                valvulas: m.valvulas,
                ano_inicial: m.ano_inicial,
                ano_final: m.ano_final,
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
                  if (modeloForm) resetForm(createModeloForm, setModeloForm);
                  invalidateForArea(Areas.modelo);
                }
              )
            }
            renderExtra={(m) => (
              <>
                <p className="text-xs text-zinc-500">Empresa: {m.empresa_id ?? "-"}</p>
                <p className="text-xs text-zinc-500">
                  {[m.combustivel, m.tipo_cambio, m.motor].filter(Boolean).join(" • ") || "—"}
                </p>
              </>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}
