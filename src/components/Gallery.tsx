import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { useLojaStore } from "@/stores/useLojaStore";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retorna a URL pública (sem expiração) de um arquivo do bucket.
 */
export function publicUrlFromPath(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Retorna uma URL assinada (temporária) para arquivos em buckets privados.
 */
export async function signedUrlFromPath(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

// ——— seus tipos/constantes existentes ———
type FotoItem = {
  id: string;
  path: string;
  ordem: number;
  e_capa: boolean;
  nome_original?: string | null;
};
type Props = {
  supabase: any;
  empresaId: string;
  veiculoId: string;
  bucket?: string;
  isPrivateBucket?: boolean;
};
const DEFAULT_BUCKET = "fotos_veiculos_loja";
const MAX_FOTOS = 30;

// ——— tipos internos auxiliares ———
type PendingItem = {
  tempId: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "registering" | "done" | "error" | "canceled";
  message?: string;
};

export function PhotoGallery({
  supabase,
  empresaId,
  veiculoId,
  bucket = DEFAULT_BUCKET,
  isPrivateBucket = false,
}: Props) {
  const loja = useLojaStore((s) => s.lojaSelecionada);
  const lojaId = loja?.id ?? null;
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qKey = ["fotos", empresaId, lojaId, veiculoId];
  const [isDragActive, setIsDragActive] = useState(false);

  // —— estado local de uploads pendentes (UI otimista) ——
  const [pending, setPending] = useState<PendingItem[]>([]);

  // listar
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

  // pode adicionar?
  const canAdd = useMemo(() => {
    const countLive = fotos.length + pending.filter(p => p.status !== "canceled" && p.status !== "error").length;
    return lojaId ? countLive < MAX_FOTOS : false;
  }, [lojaId, fotos.length, pending]);

  useEffect(() => {
    if (!canAdd) setIsDragActive(false);
  }, [canAdd]);

  // url para exibição
  const toDisplayUrl = async (path: string) => {
    if (isPrivateBucket) {
      return await signedUrlFromPath(supabase, bucket, path);
    }
    return publicUrlFromPath(supabase, bucket, path);
  };

  // remover
  const mRemove = useMutation({
    mutationFn: async (foto: FotoItem) => {
      const { error: delErr } = await supabase.storage.from(bucket).remove([foto.path]);
      if (delErr) throw delErr;
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

  // set capa
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

  // reordenar
  const mReorder = useMutation({
    mutationFn: async (ordens: { id: string; ordem: number }[]) => {
      const { error } = await supabase.rpc("fotos_gerenciar", {
        p_operacao: "reordenar",
        p_empresa_id: empresaId,
        p_loja_id: lojaId,
        p_veiculo_id: veiculoId,
        p_payload: { ordens },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  // IMPORTANTE: uploads NÃO bloqueiam ações — só bloqueamos quando removendo/capando/reordenando
  const isMutating = mRemove.isPending || mSetCapa.isPending || mReorder.isPending;

  // drag & drop
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAdd) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles) setIsDragActive(true);
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canAdd) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles) setIsDragActive(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsDragActive(false);
  };

  // enfileirar arquivos (upload paralelo)
  const enqueueFiles = (files: File[]) => {
    if (!lojaId) return;
    const remaining = Math.max(0, MAX_FOTOS - (fotos.length + pending.length));
    const filesToUpload = files.slice(0, remaining);

    const newPendings: PendingItem[] = filesToUpload.map((file) => ({
      tempId: `temp_${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "queued",
    }));

    setPending((prev) => [...newPendings, ...prev]); // entram no topo

    // inicia uploads imediatamente (paralelo)
    newPendings.forEach((p, idx) => {
      startUpload(p, fotos.length + idx + 1);
    });
  };

  // fluxo completo do upload (1 arquivo)
  const startUpload = async (p: PendingItem, ordemBase: number) => {
    if (!lojaId) return;

    // 1) marca como uploading (UI)
    setPending((prev) =>
      prev.map((it) => (it.tempId === p.tempId ? { ...it, status: "uploading" } : it)),
    );

    // 2) sobe para o Storage
    const ext = p.file.name.split(".").pop() ?? "jpg";
    const key = `${empresaId}/${lojaId}/${veiculoId}/${crypto.randomUUID()}.${ext}`;

    try {
      const { error: upErr } = await supabase.storage.from(bucket).upload(key, p.file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      // 3) define metadados na RPC
      setPending((prev) =>
        prev.map((it) => (it.tempId === p.tempId ? { ...it, status: "registering" } : it)),
      );

      const payload = {
        path: key,
        ordem: ordemBase, // ordem inicial sugerida (será revalidada)
        nome_original: p.file.name,
        e_capa: fotos.length === 0 && pending.filter(x => x.status !== "canceled").length === 0, // capa se primeiro item geral
      };

      const { error } = await supabase.rpc("fotos_gerenciar", {
        p_operacao: "adicionar",
        p_empresa_id: empresaId,
        p_loja_id: lojaId,
        p_veiculo_id: veiculoId,
        p_payload: { arquivos: [payload] },
      });
      if (error) throw error;

      // 4) remove do pending e revalida lista
      setPending((prev) => prev.filter((it) => it.tempId !== p.tempId));
      await qc.invalidateQueries({ queryKey: qKey });
    } catch (e: any) {
      setPending((prev) =>
        prev.map((it) =>
          it.tempId === p.tempId ? { ...it, status: "error", message: e?.message ?? "Erro no upload" } : it,
        ),
      );
    }
  };

  const onDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!canAdd) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) enqueueFiles(files);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAdd) return;
    const files = Array.from(e.target.files || []);
    if (files.length) enqueueFiles(files);
    e.currentTarget.value = "";
  };

  // dnd-kit sortable item (somente para itens já persistidos)
  function SortableItem({
    foto,
    displayUrl,
    disabled,
  }: {
    foto: FotoItem;
    displayUrl?: string | null;
    disabled: boolean;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: foto.id,
      disabled,
    });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
      >
        <div className="relative aspect-square w-full">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={foto.nome_original ?? ""}
              fill
              className="object-cover"
              sizes="200px"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full animate-pulse items-center justify-center bg-zinc-100 text-xs text-zinc-400">
              Carregando…
            </div>
          )}
          {foto.e_capa && (
            <span className="absolute left-2 top-2 rounded-full bg-blue-600/90 px-2 py-1 text-xs font-medium text-white shadow">
              Capa
            </span>
          )}
          <button
            {...attributes}
            {...listeners}
            title="Arraste para reordenar"
            className="absolute right-2 top-2 hidden rounded-md bg-white/80 px-2 py-1 text-xs shadow-sm ring-1 ring-zinc-200 transition group-hover:block disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
          >
            ⇅
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-3 py-2">
          <span className="truncate text-xs text-zinc-500">#{foto.ordem}</span>
          <div className="flex items-center gap-2">
            {!foto.e_capa && (
              <button
                onClick={() => !disabled && mSetCapa.mutate(foto)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
              >
                Definir capa
              </button>
            )}
            <button
              onClick={() => !disabled && mRemove.mutate(foto)}
              className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mapear display URLs (public/signed)
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(fotos.map(async (f) => [f.id, await toDisplayUrl(f.path)] as const));
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
    if (isMutating) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fotos.findIndex((f) => f.id === active.id);
    const newIndex = fotos.findIndex((f) => f.id === over.id);
    const reord = arrayMove(fotos, oldIndex, newIndex);

    const ordens = reord.map((f, i) => ({ id: f.id, ordem: i + 1 }));
    mReorder.mutate(ordens);
  };

  if (!lojaId) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Selecione uma loja para gerenciar as fotos deste veículo.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Galeria de Fotos</h3>
          <p className="text-sm text-zinc-500">
            Loja: <b>{loja?.nome ?? "—"}</b> • Veículo: <b>{veiculoId.slice(0, 8)}…</b>
          </p>
        </div>
        <div className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {fotos.length + pending.filter(p => p.status !== "canceled" && p.status !== "error").length}/{MAX_FOTOS}
        </div>
      </div>

      {/* Dropzone / seletor */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={onDropFiles}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center shadow-sm transition
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-zinc-300 bg-white"}
          ${!canAdd ? "cursor-not-allowed opacity-60" : "hover:bg-zinc-50"}`}
      >
        <div className="text-sm text-zinc-600">
          Arraste imagens aqui ou
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canAdd}
          >
            Selecionar arquivos
          </button>
          {!canAdd && (
            <span className="text-xs font-medium text-red-600">
              Limite de {MAX_FOTOS} atingido
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          className="hidden"
        />
      </div>

      {/* Estado de carregamento inicial */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      )}

      {/* Grade: pendentes + existentes */}
      {!isLoading && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fotos.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {/* cards pendentes (não-sortable) */}
              {pending.map((p) => (
                <div
                  key={p.tempId}
                  className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={p.previewUrl}
                      alt={p.file.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {/* overlay de status */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/35 p-2 text-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                      <span className="text-xs font-medium text-white drop-shadow">
                        {p.status === "queued" && "Na fila…"}
                        {p.status === "uploading" && "Enviando…"}
                        {p.status === "registering" && "Registrando…"}
                        {p.status === "error" && "Erro no upload"}
                        {p.status === "canceled" && "Cancelado"}
                      </span>
                      {p.status === "error" && (
                        <span className="text-[10px] text-white/80">{p.message}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-3 py-2">
                    <span className="line-clamp-1 text-xs text-zinc-600">{p.file.name}</span>
                    {p.status !== "registering" && p.status !== "done" && (
                      <button
                        onClick={() =>
                          setPending((prev) => prev.map((it) => it.tempId === p.tempId ? { ...it, status: "canceled" } : it))
                        }
                        className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* cards já persistidos (sortable) */}
              {fotos.map((f) => (
                <SortableItem
                  key={f.id}
                  foto={f}
                  displayUrl={urls[f.id]}
                  disabled={isMutating}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
