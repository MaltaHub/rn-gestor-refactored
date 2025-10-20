// app/components/PhotoGallery.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import Image from "next/image";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Crown, GripVertical, Loader2, Sparkles, Trash2, UploadCloud } from "lucide-react";

import { useLojaStore } from "@/stores/useLojaStore";
import { LIMITS, STORAGE_BUCKETS } from "@/config";

type FotoItem = {
  id: string;
  path: string;
  e_capa: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
};

type UploadingItem = {
  id: string;
  name: string;
  previewUrl: string | null;
  makeCover: boolean;
};

type Props = {
  supabase: SupabaseClient;
  empresaId: string;
  veiculoId: string;
  bucket?: string; // default 'fotos_veiculos_loja'
  isPrivateBucket?: boolean; // se true, usa signedUrl para exibir
};

const generateUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function publicUrlFromPath(supabase: SupabaseClient, bucket: string, path: string) {
  // path aqui já deve ser relativo ao bucket (empresa/loja?/veiculo/uuid.ext)
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function signedUrlFromPath(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  seconds = 60 * 60
) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}

// Tipos auxiliares do item
type SortableItemProps = {
  foto: FotoItem;
  displayUrl?: string | null;
  disabled: boolean;
  onSetCapa: (foto: FotoItem) => void;
  onRemove: (foto: FotoItem) => void;
};

const SortableItem = memo(function SortableItem({
  foto,
  displayUrl,
  disabled,
  onSetCapa,
  onRemove,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: foto.id,
    disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--purple-magic)] hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--surface-dark)]">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={`Foto ${foto.ordem}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="200px"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--purple-magic)]" />
            Preparando preview
          </div>
        )}
        <button
          {...attributes}
          {...listeners}
          title="Arraste para reordenar"
          className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          <GripVertical className="h-3.5 w-3.5" />
          mover
        </button>
        {foto.e_capa && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            <Crown className="h-3.5 w-3.5" />
            Capa
          </span>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-black/5 px-3 py-2 text-xs text-[var(--text-secondary)] dark:border-white/10">
        <span className="font-semibold tracking-wide text-[var(--text-primary)]">
          #{String(foto.ordem ?? 0).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {!foto.e_capa && (
            <button
              onClick={() => !disabled && onSetCapa(foto)}
              className="flex items-center gap-1 rounded-full bg-[var(--purple-magic)]/10 px-3 py-1 font-semibold uppercase tracking-wide text-[var(--purple-magic)] transition hover:bg-[var(--purple-magic)]/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Destacar
            </button>
          )}
          <button
            onClick={() => !disabled && onRemove(foto)}
            className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 font-semibold uppercase tracking-wide text-red-500 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover
          </button>
        </div>
      </div>
    </div>
  );
});

const UploadingCard = memo(function UploadingCard({ item }: { item: UploadingItem }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-dashed border-[var(--purple-magic)]/60 bg-[var(--purple-pale)]/40 shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--surface-dark)]">
        {item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={`Pré-visualização de ${item.name}`}
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <UploadCloud className="h-5 w-5 text-[var(--purple-magic)]" />
            Preparando imagem
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm text-white">
          <Loader2 className="h-7 w-7 animate-spin" />
          Enviando...
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--purple-magic)]/40 px-3 py-2 text-xs text-[var(--text-secondary)]">
        <span className="font-semibold uppercase tracking-wide text-[var(--purple-magic)]">
          {item.makeCover ? "Nova capa" : "Upload"}
        </span>
        <span className="max-w-[150px] truncate text-[var(--text-muted)]">{item.name}</span>
      </div>
    </div>
  );
});

export function PhotoGallery({
  supabase,
  empresaId,
  veiculoId,
  bucket = STORAGE_BUCKETS.FOTOS_VEICULOS_LOJA,
  isPrivateBucket = false,
}: Props) {
  const loja = useLojaStore((s) => s.lojaSelecionada);
  const lojaId = loja?.id ?? null;
  const qc = useQueryClient();
  // Sensores memoizados para evitar re-registros (loop em useDroppable/useRect)
  const sensorOptions = useMemo(() => ({ activationConstraint: { distance: 5 } }), []);
  const pointerSensor = useSensor(PointerSensor, sensorOptions);
  const sensors = useSensors(pointerSensor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qKey = useMemo(
    () => ["fotos", empresaId, lojaId, veiculoId] as const,
    [empresaId, lojaId, veiculoId]
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const nextOrderRef = useRef<number>(1);

  const listar = async (): Promise<FotoItem[]> => {
    if (!lojaId) return [];
    const { data, error } = await supabase.rpc("fotos_gerenciar", {
      p_operacao: "listar",
      p_empresa_id: empresaId,
      p_loja_id: lojaId,
      p_veiculo_id: veiculoId,
      p_payload: {},
    });
    if (error) throw error;
    return (data?.fotos ?? []) as FotoItem[];
  };

  const { data: fotos = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: listar,
    enabled: Boolean(lojaId),
  });

  const totalSlotsUsed = fotos.length + uploadingItems.length;
  const canAdd = lojaId ? totalSlotsUsed < LIMITS.MAX_FOTOS : false;
  useEffect(() => {
    if (!canAdd) {
      setIsDragActive(false);
    }
  }, [canAdd]);

  useEffect(() => {
    const highestOrder = fotos.reduce((max, foto) => Math.max(max, foto.ordem ?? 0), 0);
    nextOrderRef.current = highestOrder + 1;
  }, [fotos]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  // Helper: url para exibição
  const toDisplayUrl = async (path: string) => {
    if (isPrivateBucket) {
      return await signedUrlFromPath(supabase, bucket, path);
    }
    return publicUrlFromPath(supabase, bucket, path);
  };

  const startUpload = useCallback(
    (item: UploadingItem, file: File) => {
      const ordem = nextOrderRef.current++;

      const execute = async () => {
        try {
          if (!lojaId) throw new Error("Selecione uma loja antes de enviar fotos.");
          const ext = file.name.split(".").pop() ?? "jpg";
          const key = `${empresaId}/${lojaId}/${veiculoId}/${generateUuid()}.${ext}`;

          const { error: upErr } = await supabase.storage.from(bucket).upload(key, file, {
            cacheControl: "3600",
            upsert: false,
          });
          if (upErr) throw upErr;

          const arquivo = {
            path: key,
            ordem,
            nome_original: file.name,
            ...(item.makeCover ? { e_capa: true } : {}),
          };

          const { error } = await supabase.rpc("fotos_gerenciar", {
            p_operacao: "adicionar",
            p_empresa_id: empresaId,
            p_loja_id: lojaId,
            p_veiculo_id: veiculoId,
            p_payload: { arquivos: [arquivo] },
          });
          if (error) throw error;

          setStatusMessage({
            type: "success",
            message: `Foto "${file.name}" adicionada à galeria.`,
          });

          await qc.invalidateQueries({ queryKey: qKey });
        } catch (err) {
          console.error("[PhotoGallery] Falha ao enviar arquivo:", err);
          setStatusMessage({
            type: "error",
            message: `Não foi possível enviar "${file.name}". Tente novamente.`,
          });
          // Repor o contador caso falhe, recalculado pelo efeito ao atualizar `fotos`
        } finally {
          setUploadingItems((prev) => prev.filter((upload) => upload.id !== item.id));
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        }
      };

      void execute();
    },
    [bucket, empresaId, lojaId, qKey, qc, supabase, veiculoId]
  );

  const queueFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      if (!lojaId) {
        setStatusMessage({
          type: "error",
          message: "Selecione uma loja antes de enviar fotos.",
        });
        return;
      }

      const normalized = files.filter((file) => file.type.startsWith("image/"));
      if (!normalized.length) {
        setStatusMessage({
          type: "error",
          message: "Envie apenas arquivos de imagem (JPG, PNG, HEIC…).",
        });
        return;
      }

      const slotsLeft = LIMITS.MAX_FOTOS - (fotos.length + uploadingItems.length);
      if (slotsLeft <= 0) {
        setStatusMessage({
          type: "error",
          message: `Limite de ${LIMITS.MAX_FOTOS} fotos atingido para esta loja.`,
        });
        return;
      }

      const filesToUpload = normalized.slice(0, slotsLeft);
      if (filesToUpload.length < normalized.length) {
        setStatusMessage({
          type: "info",
          message: `Apenas ${filesToUpload.length} arquivos foram adicionados (limite disponível).`,
        });
      }

      const hasCoverNow =
        fotos.some((foto) => foto.e_capa) || uploadingItems.some((item) => item.makeCover);

      const uploadItems: UploadingItem[] = filesToUpload.map((file, index) => ({
        id: `upload-${generateUuid()}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        makeCover: !hasCoverNow && index === 0,
      }));

      setUploadingItems((prev) => [...prev, ...uploadItems]);

      uploadItems.forEach((item, index) => {
        const originalFile = filesToUpload[index];
        startUpload(item, originalFile);
      });
    },
    [fotos, lojaId, startUpload, uploadingItems]
  );

  // Remover (apaga do storage e do metadado)
  const mRemove = useMutation({
    mutationFn: async (foto: FotoItem) => {
      // 1) delete storage
      const { error: delErr } = await supabase.storage.from(bucket).remove([foto.path]);
      if (delErr) throw delErr;

      // 2) remover metadado
      const { error } = await supabase.rpc("fotos_gerenciar", {
        p_operacao: "remover",
        p_empresa_id: empresaId,
        p_loja_id: lojaId,
        p_veiculo_id: veiculoId,
        p_payload: { ids: [foto.id] },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  // Set capa
  const mSetCapa = useMutation({
    mutationFn: async (foto: FotoItem) => {
      const { error } = await supabase.rpc("fotos_gerenciar", {
        p_operacao: "set_capa",
        p_empresa_id: empresaId,
        p_loja_id: lojaId,
        p_veiculo_id: veiculoId,
        p_payload: { id: foto.id },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  // Reordenar
  const mReorder = useMutation({
    mutationFn: async (ordens: { id: string; ordem: number }[]) => {
      const { error } = await supabase.rpc("fotos_gerenciar", {
        p_operacao: "reordenar",
        p_empresa_id: empresaId,
        p_loja_id: lojaId,
        p_veiculo_id: veiculoId,
        p_payload: { ordens },
      });
      console.warn("reordenar", { ordens });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  const isProcessing = mRemove.isPending || mSetCapa.isPending || mReorder.isPending;

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAdd || isProcessing) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles && !isDragActive) setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canAdd || isProcessing) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles && !isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    if (isDragActive) setIsDragActive(false);
  };

  const onDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!canAdd || isProcessing) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) queueFiles(files);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAdd || isProcessing) return;
    const files = Array.from(e.target.files || []);
    if (files.length) queueFiles(files);
    e.currentTarget.value = "";
  };

  // Callbacks estáveis para ações de item (evitam recriação de props)
  const onSetCapa = useCallback((foto: FotoItem) => {
    if (!isProcessing) mSetCapa.mutate(foto);
  }, [isProcessing, mSetCapa]);

  const onRemove = useCallback((foto: FotoItem) => {
    if (!isProcessing) mRemove.mutate(foto);
  }, [isProcessing, mRemove]);

  // Mapear display URLs (public/signed)
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        fotos.map(async (f) => [f.id, await toDisplayUrl(f.path)] as const)
      );
      if (alive) {
        const obj: Record<string, string> = {};
        for (const [id, url] of entries) obj[id] = url;
        setUrls(obj);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.map((f) => f.path).join("|"), isPrivateBucket]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (isProcessing) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fotos.findIndex((f) => f.id === active.id);
    const newIndex = fotos.findIndex((f) => f.id === over.id);
    const reord = arrayMove(fotos, oldIndex, newIndex);

    // cria payload 1..n na nova ordem
    const ordens = reord.map((f, i) => ({ id: f.id, ordem: i + 1 }));
    mReorder.mutate(ordens);
  };

  // Lista estável de IDs para o SortableContext
  const sortableItemIds = useMemo(() => fotos.map((f) => f.id), [fotos]);

  if (!lojaId) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-zinc-500">
          Selecione uma loja para gerenciar as fotos deste veículo.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Galeria de fotos</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Loja:{" "}
            <span className="font-semibold text-[var(--text-primary)]">{loja?.nome ?? "—"}</span> · Veículo:{" "}
            <span className="font-semibold text-[var(--text-primary)]">{veiculoId.slice(0, 8)}…</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-[var(--surface-dark)]/60 px-3 py-1 font-medium text-[var(--text-secondary)]">
            {fotos.length}/{LIMITS.MAX_FOTOS} fotos
          </span>
          {uploadingItems.length > 0 && (
            <span className="flex items-center gap-2 rounded-full bg-[var(--purple-magic)]/15 px-3 py-1 text-[var(--purple-magic)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando {uploadingItems.length}
            </span>
          )}
        </div>
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={onDropFiles}
        className={`relative flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-[var(--purple-magic)] bg-[var(--purple-pale)]/40 shadow-inner"
            : "border-[var(--border-default)] bg-[var(--surface-elevated)]"
        } ${
          !canAdd
            ? "cursor-not-allowed opacity-60"
            : "hover:border-[var(--purple-magic)] hover:bg-[var(--surface-elevated)]/70"
        }`}
      >
        <UploadCloud className="h-10 w-10 text-[var(--purple-magic)]" />
        <div className="space-y-2">
          <p className="text-sm text-[var(--text-secondary)]">
            Arraste as imagens para cá ou use o botão abaixo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-[var(--purple-magic)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canAdd || isProcessing}
            >
              Selecionar fotos
            </button>
            <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              ou solte os arquivos
            </span>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Suporta JPG, PNG e HEIC até 10&nbsp;MB por arquivo.
        </p>
        {!canAdd && (
          <p className="text-xs font-medium text-red-400">
            Limite de {LIMITS.MAX_FOTOS} fotos atingido.
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          className="hidden"
        />
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
            statusMessage.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : statusMessage.type === "error"
              ? "border-red-500/25 bg-red-500/10 text-red-100"
              : "border-[var(--purple-magic)]/25 bg-[var(--purple-pale)]/20 text-[var(--text-secondary)]"
          }`}
          aria-live="polite"
        >
          {statusMessage.message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
          Carregando fotos…
        </div>
      ) : fotos.length === 0 && uploadingItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-elevated)] px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
          Nenhuma foto enviada para este veículo nesta loja.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {uploadingItems.map((item) => (
                <UploadingCard key={item.id} item={item} />
              ))}
              {fotos.map((f) => (
                <SortableItem
                  key={f.id}
                  foto={f}
                  displayUrl={urls[f.id]}
                  disabled={isProcessing}
                  onSetCapa={onSetCapa}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
