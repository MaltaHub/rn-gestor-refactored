import { readClient, writeClient } from "../core";
import {
  getSupabaseEmpresaId,
  isSupabaseConfigured,
  supabaseDelete,
  supabaseInsert,
  supabaseSelect,
  supabaseUpdate
} from "../../supabase/client";
import type { CadastroContexto, CadastroItem, ModeloDetalhe } from "@/types/domain";
import type { LojasRow, ModelosRow, PlataformasRow } from "@/types/database";

const STATIC_CONTEXTOS: CadastroContexto[] = [
  { tipo: "stores", label: "Lojas" },
  { tipo: "models", label: "Modelos" },
  { tipo: "platforms", label: "Plataformas" },
  { tipo: "characteristics", label: "Características" },
  { tipo: "locations", label: "Locais" }
];

const MODELOS_ATIVO_COLUMN = process.env.NEXT_PUBLIC_SUPABASE_MODELOS_ATIVO_COLUMN;

type SupabaseRecord = Record<string, unknown>;

type SupabaseModeloRow = ModelosRow & SupabaseRecord;

type SupabaseModelosResponse = SupabaseModeloRow[];

type SupabaseCadastroResponse<Row extends SupabaseRecord> = Row[];

type SimpleTable = "lojas" | "plataformas" | "caracteristicas" | "locais";

function createEmpresaMatch(
  match?: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number | boolean | null | undefined> {
  const empresaId = getSupabaseEmpresaId();
  return {
    ...(match ?? {}),
    ...(empresaId ? { empresa_id: empresaId } : {})
  };
}

function adaptCadastroItem(row: SupabaseRecord): CadastroItem | null {
  const rawId = row.id;
  const rawNome = row.nome;

  if ((typeof rawId !== "string" && typeof rawId !== "number") || typeof rawNome !== "string") {
    return null;
  }

  const descricaoRaw = row.descricao;
  const ativoRaw = row.ativo;

  const descricao =
    typeof descricaoRaw === "string" && descricaoRaw.trim().length > 0 ? descricaoRaw : undefined;
  const ativo =
    typeof ativoRaw === "boolean"
      ? ativoRaw
      : ativoRaw == null
        ? true
        : Boolean(ativoRaw);

  return {
    id: typeof rawId === "string" ? rawId : String(rawId),
    nome: rawNome,
    descricao,
    ativo
  };
}

function adaptModeloCadastroItem(row: SupabaseModeloRow): CadastroItem {
  const nomeParts = [row.marca, row.nome, row.edicao].filter((parte) => Boolean(parte));
  const ativoColumn = MODELOS_ATIVO_COLUMN;
  const ativoValue = ativoColumn ? (row as SupabaseRecord)[ativoColumn] : undefined;

  const ativo =
    typeof ativoValue === "boolean"
      ? ativoValue
      : ativoValue == null
        ? true
        : Boolean(ativoValue);

  return {
    id: row.id,
    nome: nomeParts.join(" ").trim(),
    descricao: typeof row.marca === "string" ? row.marca : undefined,
    ativo
  };
}

function adaptModeloDetalhe(row: SupabaseModeloRow): ModeloDetalhe {
  const ativoColumn = MODELOS_ATIVO_COLUMN;
  const ativoValue = ativoColumn ? (row as SupabaseRecord)[ativoColumn] : undefined;

  return {
    id: row.id,
    marca: row.marca,
    nome: row.nome,
    versao: row.edicao ?? undefined,
    anoInicial: row.ano_inicial ?? undefined,
    anoFinal: row.ano_final ?? undefined,
    ativo:
      typeof ativoValue === "boolean"
        ? ativoValue
        : ativoValue == null
          ? true
          : Boolean(ativoValue)
  };
}

function modeloSelectColumns() {
  const columns = ["id", "marca", "nome", "edicao", "ano_inicial", "ano_final"];
  if (MODELOS_ATIVO_COLUMN) {
    columns.push(MODELOS_ATIVO_COLUMN);
  }
  return columns.join(",");
}

async function fetchSimpleCadastro(
  table: SimpleTable
): Promise<CadastroItem[]> {
  const rows = await supabaseSelect<SupabaseCadastroResponse<SupabaseRecord>>(table, {
    select: "*",
    match: createEmpresaMatch(),
    order: { column: "nome" }
  });

  return rows
    .map((row) => adaptCadastroItem(row))
    .filter((item): item is CadastroItem => Boolean(item));
}

function assertSupabaseConfigOrFallback(): boolean {
  return isSupabaseConfigured;
}

function ensureEmpresaId(tipo: string) {
  const empresaId = getSupabaseEmpresaId();
  if (!empresaId) {
    throw new Error(
      `Para criar registros em "${tipo}" é necessário configurar NEXT_PUBLIC_SUPABASE_EMPRESA_ID.`
    );
  }
  return empresaId;
}

function normalizeId(value: unknown): string {
  return typeof value === "string" ? value : value != null ? String(value) : "";
}

export async function listarContextos(): Promise<CadastroContexto[]> {
  if (!assertSupabaseConfigOrFallback()) {
    return readClient.fetch("cadastros.contextos");
  }
  return STATIC_CONTEXTOS;
}

export async function listarCadastros(tipo: CadastroContexto["tipo"]): Promise<CadastroItem[]> {
  if (!assertSupabaseConfigOrFallback()) {
    return readClient.fetch("cadastros.listar", { tipo });
  }

  switch (tipo) {
    case "stores":
      return fetchSimpleCadastro("lojas");
    case "platforms":
      return fetchSimpleCadastro("plataformas");
    case "characteristics":
      return fetchSimpleCadastro("caracteristicas");
    case "locations":
      return fetchSimpleCadastro("locais");
    case "models": {
      const rows = await supabaseSelect<SupabaseModelosResponse>("modelos", {
        select: modeloSelectColumns(),
        match: createEmpresaMatch(),
        order: [
          { column: "marca" },
          { column: "nome" },
          { column: "edicao" }
        ]
      });
      return rows.map(adaptModeloCadastroItem);
    }
    default:
      return [];
  }
}

export async function salvarCadastro(
  tipo: CadastroContexto["tipo"],
  item: Partial<CadastroItem>
) {
  if (!assertSupabaseConfigOrFallback()) {
    return writeClient.execute("cadastros.salvar", { tipo, item });
  }

  if (!item.nome || item.nome.trim().length === 0) {
    throw new Error("Nome é obrigatório para salvar o cadastro.");
  }

  const nome = item.nome.trim();

  switch (tipo) {
    case "stores": {
      if (item.id) {
        await supabaseUpdate<LojasRow[]>("lojas", { id: item.id }, { nome });
        return { id: item.id };
      }
      const empresaId = ensureEmpresaId(tipo);
      const inserted = await supabaseInsert<LojasRow[]>("lojas", { nome, empresa_id: empresaId });
      return { id: normalizeId(inserted?.[0]?.id) };
    }
    case "platforms": {
      if (item.id) {
        await supabaseUpdate<PlataformasRow[]>("plataformas", { id: item.id }, { nome });
        return { id: item.id };
      }
      const empresaId = ensureEmpresaId(tipo);
      const inserted = await supabaseInsert<PlataformasRow[]>("plataformas", { nome, empresa_id: empresaId });
      return { id: normalizeId(inserted?.[0]?.id) };
    }
    case "characteristics": {
      if (item.id) {
        await supabaseUpdate<SupabaseCadastroResponse<SupabaseRecord>>("caracteristicas", { id: item.id }, { nome });
        return { id: item.id };
      }
      const empresaId = ensureEmpresaId(tipo);
      const inserted = await supabaseInsert<SupabaseCadastroResponse<SupabaseRecord>>(
        "caracteristicas",
        { nome, empresa_id: empresaId }
      );
      return { id: normalizeId(inserted?.[0]?.id) };
    }
    case "locations": {
      if (item.id) {
        await supabaseUpdate<SupabaseCadastroResponse<SupabaseRecord>>("locais", { id: item.id }, { nome });
        return { id: item.id };
      }
      const empresaId = ensureEmpresaId(tipo);
      const inserted = await supabaseInsert<SupabaseCadastroResponse<SupabaseRecord>>("locais", {
        nome,
        empresa_id: empresaId
      });
      return { id: normalizeId(inserted?.[0]?.id) };
    }
    case "models":
      throw new Error("Use os métodos específicos de modelos para gerenciar este contexto.");
    default:
      throw new Error(`Tipo de cadastro "${tipo}" não é suportado.`);
  }
}

export async function excluirCadastro(tipo: CadastroContexto["tipo"], id: string) {
  if (!assertSupabaseConfigOrFallback()) {
    return writeClient.execute("cadastros.excluir", { tipo, id });
  }

  switch (tipo) {
    case "stores":
      await supabaseDelete("lojas", { id });
      break;
    case "platforms":
      await supabaseDelete("plataformas", { id });
      break;
    case "characteristics":
      await supabaseDelete("caracteristicas", { id });
      break;
    case "locations":
      await supabaseDelete("locais", { id });
      break;
    case "models":
      await supabaseDelete("modelos", { id });
      break;
    default:
      throw new Error(`Tipo de cadastro "${tipo}" não é suportado.`);
  }

  return { removido: true };
}

export async function detalharModelo(id: string): Promise<ModeloDetalhe | null> {
  if (!assertSupabaseConfigOrFallback()) {
    return readClient.fetch("modelos.detalhes", { id });
  }

  const rows = await supabaseSelect<SupabaseModelosResponse>("modelos", {
    select: modeloSelectColumns(),
    match: createEmpresaMatch({ id }),
    limit: 1
  });

  const modelo = rows[0];
  return modelo ? adaptModeloDetalhe(modelo) : null;
}

export async function criarModelo(dados: Partial<ModeloDetalhe>) {
  if (!assertSupabaseConfigOrFallback()) {
    return writeClient.execute("modelos.criar", { dados });
  }

  if (!dados.marca || !dados.nome) {
    throw new Error("Marca e nome são obrigatórios para cadastrar um modelo.");
  }

  const empresaId = ensureEmpresaId("models");

  const payload: Record<string, unknown> = {
    empresa_id: empresaId,
    marca: dados.marca,
    nome: dados.nome,
    edicao: dados.versao ?? null,
    ano_inicial: dados.anoInicial ?? null,
    ano_final: dados.anoFinal ?? null
  };

  if (MODELOS_ATIVO_COLUMN && dados.ativo !== undefined) {
    payload[MODELOS_ATIVO_COLUMN] = dados.ativo;
  }

  const inserted = await supabaseInsert<SupabaseModelosResponse>("modelos", payload);
  const row = inserted?.[0];
  return { id: normalizeId(row?.id) };
}

export async function atualizarModelo(id: string, dados: Partial<ModeloDetalhe>) {
  if (!assertSupabaseConfigOrFallback()) {
    return writeClient.execute("modelos.atualizar", { id, dados });
  }

  const payload: Record<string, unknown> = {};

  if (dados.marca !== undefined) {
    payload.marca = dados.marca;
  }
  if (dados.nome !== undefined) {
    payload.nome = dados.nome;
  }
  if (dados.versao !== undefined) {
    payload.edicao = dados.versao ?? null;
  }
  if (dados.anoInicial !== undefined) {
    payload.ano_inicial = dados.anoInicial ?? null;
  }
  if (dados.anoFinal !== undefined) {
    payload.ano_final = dados.anoFinal ?? null;
  }
  if (MODELOS_ATIVO_COLUMN && dados.ativo !== undefined) {
    payload[MODELOS_ATIVO_COLUMN] = dados.ativo;
  }

  await supabaseUpdate("modelos", { id }, payload);

  return { atualizado: true };
}

export async function removerModelo(id: string) {
  if (!assertSupabaseConfigOrFallback()) {
    return writeClient.execute("modelos.remover", { id });
  }

  await supabaseDelete("modelos", { id });
  return { removido: true };
}
