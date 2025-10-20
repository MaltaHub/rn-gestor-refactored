import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/config";
import { useLojaStore } from "@/stores/useLojaStore";

const generateUuid = () => {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export type DocumentoItem = {
  id: string;
  empresa_id: string;
  veiculo_id: string;
  documentacao_id: string | null;
  loja_provocada_id: string | null;
  tipo: string;
  path: string;
  nome_original: string;
  content_type: string | null;
  tamanho_bytes: number | null;
  observacao: string | null;
  hash_sha256: string | null;
  criado_em: string;
  criado_por: string | null;
  loja_nome?: string | null;
};

export type DocumentacaoRegistro = {
  id: string;
  empresa_id: string;
  veiculo_id: string;
  loja_id: string | null;
  status_geral: string;
  responsavel_id: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  data_entrada: string | null;
  data_transferencia: string | null;
  data_vistoria: string | null;
  transferencia_iniciada: boolean | null;
  transferencia_concluida: boolean | null;
  observacoes_gerais: string | null;
  loja?: { id: string; nome: string } | null;
  veiculo?: {
    id: string;
    placa: string | null;
    modelo_id: string | null;
    veiculo_display?: string | null;
    estado_venda: string;
    modelo?: { id: string; nome: string | null } | null;
  } | null;
};

export type DocumentosPastasResumo = {
  veiculoId: string;
  totalDocumentos: number;
  primeiraCriacao: string | null;
  ultimaAtualizacao: string | null;
};

export function useDocumentacaoVeiculos(empresaId?: string) {
  return useQuery<DocumentacaoRegistro[]>({
    queryKey: ["documentacao", empresaId],
    enabled: Boolean(empresaId),
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("documentacao_veiculos")
        .select(
          `*,
          veiculo:veiculos (
            id,
            placa,
            modelo_id,
            estado_venda,
            modelo:modelos (
              id,
              nome
            )
          ),
          loja:lojas (
            id,
            nome
          )
        `,
        )
        .eq("empresa_id", empresaId)
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocumentacaoRegistro[];
    },
  });
}

export function useDocumentosPastas(empresaId?: string) {
  return useQuery<DocumentosPastasResumo[]>({
    queryKey: ["documentos", "pastas", empresaId],
    enabled: Boolean(empresaId),
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("documentos_veiculos")
        .select("veiculo_id, criado_em")
        .eq("empresa_id", empresaId);
      if (error) throw error;

      const rows = (data ?? []) as Array<Pick<DocumentoItem, "veiculo_id" | "criado_em">>;
      const map = new Map<string, DocumentosPastasResumo>();

      for (const row of rows) {
        const veiculoId = row.veiculo_id;
        if (!veiculoId) continue;
        const criadoEm = row.criado_em ?? null;
        const existing = map.get(veiculoId) ?? {
          veiculoId,
          totalDocumentos: 0,
          primeiraCriacao: criadoEm,
          ultimaAtualizacao: criadoEm,
        };
        const totalDocumentos = existing.totalDocumentos + 1;
        const primeiraCriacao =
          existing.primeiraCriacao && criadoEm
            ? (new Date(criadoEm) < new Date(existing.primeiraCriacao) ? criadoEm : existing.primeiraCriacao)
            : existing.primeiraCriacao ?? criadoEm;
        const ultimaAtualizacao =
          existing.ultimaAtualizacao && criadoEm
            ? (new Date(criadoEm) > new Date(existing.ultimaAtualizacao) ? criadoEm : existing.ultimaAtualizacao)
            : existing.ultimaAtualizacao ?? criadoEm;

        map.set(veiculoId, {
          veiculoId,
          totalDocumentos,
          primeiraCriacao,
          ultimaAtualizacao,
        });
      }

      return Array.from(map.values()).sort((a, b) => {
        const dateA = a.ultimaAtualizacao ? new Date(a.ultimaAtualizacao).getTime() : 0;
        const dateB = b.ultimaAtualizacao ? new Date(b.ultimaAtualizacao).getTime() : 0;
        return dateB - dateA;
      });
    },
  });
}

export function useDocumentosVeiculo(empresaId?: string, veiculoId?: string) {
  return useQuery<DocumentoItem[]>({
    queryKey: ["documentos", empresaId, veiculoId],
    enabled: Boolean(empresaId && veiculoId),
    queryFn: async () => {
      if (!empresaId || !veiculoId) return [];
      const { data, error } = await supabase.rpc("documentos_gerenciar", {
        p_operacao: "listar",
        p_empresa_id: empresaId,
        p_veiculo_id: veiculoId,
        p_loja_provocada_id: null,
        p_payload: {},
      });
      if (error) throw error;
      const docs = (data?.documentos ?? []) as DocumentoItem[];
      return docs;
    },
  });
}

export function useDocumentacaoDetalhe(empresaId?: string, veiculoId?: string) {
  return useQuery<DocumentacaoRegistro | null>({
    queryKey: ["documentacao", empresaId, veiculoId, "detalhe"],
    enabled: Boolean(empresaId && veiculoId),
    queryFn: async () => {
      if (!empresaId || !veiculoId) return null;
      const { data, error } = await supabase
        .from("documentacao_veiculos")
        .select(
          `*,
          veiculo:veiculos (
            id,
            placa,
            modelo_id,
            estado_venda,
            modelo:modelos ( id, nome )
          ),
          loja:lojas ( id, nome )
        `,
        )
        .eq("empresa_id", empresaId)
        .eq("veiculo_id", veiculoId)
        .maybeSingle();
      if (error) throw error;
      return (data as DocumentacaoRegistro) ?? null;
    },
  });
}

export function useVeiculoBasico(veiculoId?: string) {
  type VeiculoBasico = {
    id: string;
    placa: string | null;
    modelo_id: string | null;
    empresa_id: string;
    modelo: { id: string; nome: string | null } | null;
  } | null;

  return useQuery<VeiculoBasico>({
    queryKey: ["veiculo-basico", veiculoId],
    enabled: Boolean(veiculoId),
    queryFn: async () => {
      if (!veiculoId) return null;
      const { data, error } = await supabase
        .from("veiculos")
        .select(
          `id, placa, modelo_id, empresa_id,
           modelo:modelos ( id, nome )`
        )
        .eq("id", veiculoId)
        .maybeSingle();
      if (error) throw error;
      return (data as VeiculoBasico) ?? null;
    },
  });
}

export function useAddDocumentos(empresaId: string, veiculoId: string) {
  const qc = useQueryClient();
  const loja = useLojaStore((s) => s.lojaSelecionada);
  const lojaId = loja?.id ?? null;
  const bucket = STORAGE_BUCKETS.DOCUMENTOS_VEICULOS;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  async function uploadManual(key: string, file: File, cacheControl = "3600", upsert = false): Promise<void> {
    const form = new FormData();
    form.append("cacheControl", cacheControl);
    form.append("file", file, file.name);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("Sessão inválida para upload");
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodeURI(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        ...(upsert ? { "x-upsert": "true" } : {}),
      },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha no upload manual: ${res.status} ${text}`);
    }
  }

  return useMutation({
    mutationFn: async (payload: {
      files: File[];
      tipo: string;
      observacao?: string | null;
      nomePersonalizado?: string | null;
    }) => {
      const { files, tipo, observacao } = payload;
      const uploaded: {
        path: string;
        nome_original: string;
        content_type?: string | null;
        tamanho_bytes?: number | null;
        observacao?: string | null;
        tipo: string;
      }[] = [];

      const today = new Date();
      const yyyy = String(today.getFullYear());
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      for (const file of files) {
        const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
        const uuid = generateUuid();
        const key = `${empresaId}/${lojaId ?? "_"}/${veiculoId}/${yyyy}/${mm}/${dd}/${tipo}/${uuid}-${cleanName}`;
        // Tenta via SDK primeiro
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(key, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
        if (upErr) {
          // Fallback manual garante name="file" no form-data
          await uploadManual(key, file, "3600", false);
        }
        uploaded.push({
          path: key,
          nome_original: file.name,
          content_type: file.type || null,
          tamanho_bytes: file.size,
          observacao: observacao ?? null,
          tipo,
        });
      }

      for (const arq of uploaded) {
        const { error } = await supabase.rpc("documentos_gerenciar", {
          p_operacao: "adicionar",
          p_empresa_id: empresaId,
          p_veiculo_id: veiculoId,
          p_loja_provocada_id: lojaId,
          p_payload: { arquivos: [arq] },
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", empresaId, veiculoId] });
    },
  });
}

export function useRemoveDocumento(empresaId: string, veiculoId: string) {
  const qc = useQueryClient();
  const bucket = STORAGE_BUCKETS.DOCUMENTOS_VEICULOS;
  return useMutation({
    mutationFn: async (doc: DocumentoItem) => {
      const { error: delErr } = await supabase.storage.from(bucket).remove([doc.path]);
      if (delErr) throw delErr;
      const { error } = await supabase.rpc("documentos_gerenciar", {
        p_operacao: "remover",
        p_empresa_id: empresaId,
        p_veiculo_id: veiculoId,
        p_loja_provocada_id: null,
        p_payload: { ids: [doc.id] },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", empresaId, veiculoId] });
    },
  });
}
