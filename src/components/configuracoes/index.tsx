import type { ModeloFormState } from "@/types/configuracoes";

import {
  type ChangeEventHandler,
  type FormEvent,
  type ReactNode,
} from "react";


/* =========================
 * Componentes de UI
 * ========================= */
export function SectionCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-zinc-800">{title}</h2>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        {badge}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {children}
      </div>
    </section>
  );
}

export function FeedbackBadge({
  feedback,
  section,
}: {
  feedback: { section: string; type: "success" | "error"; message: string } | null;
  section: string;
}) {
  if (feedback?.section !== section) return null;
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        feedback.type === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {feedback.message}
    </span>
  );
}

/** formulário simples (nome) */
export function SimpleForm({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  isEditing,
}: {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <input
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
          value={value}
          onChange={onChange}
          required
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
        </button>
        {isEditing && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            onClick={onCancel}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}

/** lista padrão com botões Editar/Remover */
export function EntityList<T extends { id?: string; nome?: string; empresa_id?: string }>(
  {
    items,
    emptyText,
    onEdit,
    onRemove,
    removingId,
    removeDisabled,
    renderExtra,
    renderTitle,
  }: {
    items: T[];
    emptyText: string;
    onEdit: (item: T) => void;
    onRemove: (item: T) => void;
    removingId: string | null;
    removeDisabled?: (item: T) => boolean;
    renderExtra?: (item: T) => ReactNode;
    renderTitle?: (item: T) => ReactNode;
  }
) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-200 px-4 py-6 text-center text-zinc-500">
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="space-y-3 text-sm">
      {items.map((item, index) => (
        <li
          key={item.id ?? `item-${index}-${item.nome}`}
          className="flex flex-col justify-between gap-3 rounded-md border border-zinc-200 p-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="font-medium text-zinc-800">
              {renderTitle ? renderTitle(item) : item.nome}
            </p>
            {renderExtra?.(item)}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
              onClick={() => onEdit(item)}
            >
              Editar
            </button>
            <button
              type="button"
              className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
              disabled={removeDisabled?.(item) || removingId === item.id}
              onClick={() => onRemove(item)}
            >
              {removingId === item.id ? "Removendo..." : "Remover"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

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

type ModeloTextFieldConfig = {
  key: keyof ModeloFormState;
  label: string;
  inputMode?: "numeric";
  required?: boolean;
};

const modeloTextFields: ModeloTextFieldConfig[] = [
  { key: "marca", label: "Marca", required: true },
  { key: "nome", label: "Nome do modelo", required: true },
  { key: "motor", label: "Motor" },
  { key: "lugares", label: "Lugares", inputMode: "numeric" },
  { key: "portas", label: "Portas", inputMode: "numeric" },
  { key: "cabine", label: "Cabine" },
  { key: "tracao", label: "Tração" },
  { key: "cambio", label: "Câmbio" },
  { key: "edicao", label: "Edição" },
  { key: "ano_inicial", label: "Ano inicial", inputMode: "numeric" },
  { key: "ano_final", label: "Ano final", inputMode: "numeric" },
  { key: "cilindros", label: "Cilindros", inputMode: "numeric" },
  { key: "valvulas", label: "Válvulas", inputMode: "numeric" },
];

type ModeloSelectFieldConfig = {
  key: keyof ModeloFormState;
  label: string;
  options: ReadonlyArray<string>;
};

const modeloSelectFields: ModeloSelectFieldConfig[] = [
  { key: "tipo_cambio", label: "Tipo de câmbio", options: tiposCambio },
  { key: "combustivel", label: "Combustível", options: combustiveis },
  { key: "carroceria", label: "Carroceria", options: carrocerias },
];

/** formulário específico de modelos */
export function ModeloForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  loading,
  isEditing,
}: {
  form: ModeloFormState;
  onChange: (
    field: keyof ModeloFormState
  ) => ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-md border border-zinc-100 bg-zinc-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        
        {modeloTextFields.map(({ key, label, inputMode, required }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700">{label}</span>
            <input
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
              value={(form[key] ?? "") as string | number}
              onChange={onChange(key)}
              required={required}
              inputMode={inputMode}
              type={inputMode === "numeric" ? "number" : "text"}
            />
          </label>
        ))}

        {modeloSelectFields.map(({ key, label, options }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700">{label}</span>
            <select
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none"
              value={(form[key] ?? "") as string | number}
              onChange={onChange(key)}
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}

      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "Salvando..." : isEditing ? "Atualizar modelo" : "Adicionar modelo"}
        </button>
        {isEditing && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            onClick={onCancel}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}
