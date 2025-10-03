// app/components/PhotoGallery.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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

import { useLojaStore } from "@/stores/useLojaStore";

type FotoItem = {
  id: string;
  path: string;
  e_capa: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
};

type Props = {
  supabase: SupabaseClient;
  empresaId: string;
  veiculoId: string;
  bucket?: string; // default 'fotos_veiculos_loja'
  isPrivateBucket?: boolean; // se true, usa signedUrl para exibir
};

const MAX_FOTOS = 30;
const DEFAULT_BUCKET = "fotos_veiculos_loja";

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

  const canAdd = lojaId ? fotos.length < MAX_FOTOS : false;
  useEffect(() => {
    if (!canAdd) {
      setIsDragActive(false);
    }
  }, [canAdd]);

  // Helper: url para exibição
  const toDisplayUrl = async (path: string) => {
    if (isPrivateBucket) {
      return await signedUrlFromPath(supabase, bucket, path);
    }
    return publicUrlFromPath(supabase, bucket, path);
  };

  // Upload + registrar metadados
  const mAdd = useMutation({
    mutationFn: async (files: File[]) => {
      // 1) upload ao Storage
      const remaining = MAX_FOTOS - fotos.length;
      const filesToUpload = files.slice(0, remaining);

      const uploadedPaths: {
        path: string;
        e_capa?: boolean;
        ordem?: number;
        nome_original?: string;
      }[] = [];

      for (const file of filesToUpload) {
        if (!lojaId) throw new Error("Selecione uma loja antes de enviar fotos.");
        const ext = file.name.split(".").pop() ?? "jpg";
        const key = `${empresaId}/${lojaId}/${veiculoId}/${generateUuid()}.${ext}`;

        const { error: upErr } = await supabase.storage.from(bucket).upload(key, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;

        uploadedPaths.push({
          path: key,
          ordem: fotos.length + uploadedPaths.length + 1,
          nome_original: file.name,
        });
      }

      // primeira foto de um álbum vazio vira capa automaticamente
      if (fotos.length === 0 && uploadedPaths[0]) {
        uploadedPaths[0].e_capa = true;
      }

      // 2) registrar metadados na RPC (um request por arquivo para evitar descartes)
      for (const arquivo of uploadedPaths) {
        const { error } = await supabase.rpc("fotos_gerenciar", {
          p_operacao: "adicionar",
          p_empresa_id: empresaId,
          p_loja_id: lojaId,
          p_veiculo_id: veiculoId,
          p_payload: { arquivos: [arquivo] },
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

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

  const isMutating =
    mAdd.isPending || mRemove.isPending || mSetCapa.isPending || mReorder.isPending;

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAdd || isMutating) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles) setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canAdd || isMutating) return;
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes("Files");
    if (hasFiles) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsDragActive(false);
  };

  const onDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!canAdd || isMutating) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) mAdd.mutate(files);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAdd || isMutating) return;
    const files = Array.from(e.target.files || []);
    if (files.length) mAdd.mutate(files);
    e.currentTarget.value = "";
  };

  // dnd-kit sortable item
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
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div ref={setNodeRef} style={style} className="group relative rounded border p-2">
        {displayUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded">
            <Image
              src={displayUrl}
              alt=""
              fill
              className="object-cover"
              sizes="160px"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400">
            Carregando…
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium">#{foto.ordem}</span>
          <div className="flex gap-2">
            {!foto.e_capa && (
              <button
                onClick={() => !isMutating && mSetCapa.mutate(foto)}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isMutating}
              >
                capa
              </button>
            )}
            <button
              onClick={() => !isMutating && mRemove.mutate(foto)}
              className="rounded border px-2 py-1 text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating}
            >
              remover
            </button>
          </div>
        </div>
        <button
          {...attributes}
          {...listeners}
          title="arraste para reordenar"
          className="absolute right-2 top-2 hidden rounded bg-white/80 px-2 py-1 text-xs shadow group-hover:block disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
        >
          ⇅
        </button>
        {foto.e_capa && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            capa
          </span>
        )}
      </div>
    );
  }

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
    if (isMutating) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fotos.findIndex((f) => f.id === active.id);
    const newIndex = fotos.findIndex((f) => f.id === over.id);
    const reord = arrayMove(fotos, oldIndex, newIndex);

    // cria payload 1..n na nova ordem
    const ordens = reord.map((f, i) => ({ id: f.id, ordem: i + 1 }));
    mReorder.mutate(ordens);
  };

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
    <div className="space-y-4">
      {/* Header com estado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Galeria de Fotos</h3>
          <p className="text-sm text-zinc-500">
            Loja: <b>{loja?.nome}…</b> &middot; Veículo: <b>{veiculoId.slice(0, 8)}…</b>
          </p>
        </div>
        <div className="text-sm">
          {fotos.length}/{MAX_FOTOS}
        </div>
      </div>

      {/* Área de upload por arraste */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={onDropFiles}
        className={`flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition ${
          isDragActive ? "border-blue-500 bg-blue-50 shadow-inner" : "border-zinc-300 bg-white"
        } ${!canAdd ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <p className="mb-2">Arraste imagens aqui ou</p>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-black px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canAdd || isMutating}
          >
            Selecionar arquivos
          </button>
          {!canAdd && <span className="text-sm text-red-600">limite de {MAX_FOTOS} atingido</span>}
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

      {isMutating && (
        <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700" aria-live="polite">
          Carregando...
        </div>
      )}

      {/* Lista (sortable) */}
      {isLoading ? (
        <div className="text-sm text-zinc-500">Carregando…</div>
      ) : fotos.length === 0 ? (
        <div className="text-sm text-zinc-500">Sem fotos para este veículo nesta loja?.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fotos.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {fotos.map((f) => (
                <SortableItem key={f.id} foto={f} displayUrl={urls[f.id]} disabled={isMutating} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
