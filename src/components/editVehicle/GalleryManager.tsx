import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../../lib/supabaseClient";
import { useCurrentStore } from "../../hooks/useCurrentStore";
import { GalleryViewer, type PreviewImage } from "../GalleryViewer";

// Foto arrastável com botão de excluir
function SortableFoto({
  foto,
  index,
  onRemove,
}: {
  foto: PreviewImage;
  index: number;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: foto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
    margin: "8px",
    width: "120px",
    height: "120px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    background: "#f9f9f9",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={foto.preview} alt={`foto-${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button
        onClick={() => onRemove(foto.id)}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,0,0,0.85)",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function GalleryManager({ vehicleId }: { vehicleId: string }) {
  const { selectedLoja, lojaId } = useCurrentStore();
  const [fotos, setFotos] = useState<PreviewImage[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  // Carregar fotos do Supabase
  useEffect(() => {
    if (!lojaId || !vehicleId) return;

    const load = async () => {
      const { data: items, error } = await supabase.storage
        .from("fotos_veiculos_loja")
        .list(`${lojaId}/${vehicleId}/`, { limit: 20 });

      if (error) {
        console.error("Erro ao listar fotos:", error);
        return;
      }

      const publicFotos: PreviewImage[] =
        items
          ?.map((item) => ({
            id: item.name,
            preview: supabase.storage
              .from("fotos_veiculos_loja")
              .getPublicUrl(`${lojaId}/${vehicleId}/${item.name}`).data.publicUrl,
          }))
          .sort((a, b) => {
            const numA = parseInt(a.id.replace(".jpg", ""), 10);
            const numB = parseInt(b.id.replace(".jpg", ""), 10);
            return numA - numB;
          }) ?? [];

      setFotos(publicFotos);
    };

    load();
  }, [lojaId, vehicleId]);

  // Adicionar arquivos
  const addFiles = (files: File[]) => {
    const newFotos = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setFotos((prev) => [...prev, ...newFotos]);
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFoto = (id: string) => {
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fotos.findIndex((f) => f.id === active.id);
      const newIndex = fotos.findIndex((f) => f.id === over.id);
      setFotos((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  // Salvar fotos no Supabase
  const handleSave = async () => {
    if (!selectedLoja?.id || !vehicleId) return;

    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      const fileName = `${i + 1}.jpg`;

      if (foto.isNew && foto.file) {
        const { error } = await supabase.storage
          .from("fotos_veiculos_loja")
          .upload(`${selectedLoja.id}/${vehicleId}/${fileName}`, foto.file, { upsert: true });

        if (error) console.error("Erro ao enviar:", error);
      }
    }

    alert("Fotos enviadas na ordem escolhida!");
  };

  return (
    <div>
      <h2>Adicionar fotos</h2>
      <div
        onDrop={handleDropFiles}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed gray",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Arraste suas fotos aqui
        <br />
        <input type="file" multiple accept="image/*" onChange={handleSelectFiles} style={{ display: "none" }} id="input-fotos" />
        <label htmlFor="input-fotos" style={{ color: "blue", cursor: "pointer" }}>
          ou clique para selecionar
        </label>
      </div>

      {/* Área de ordenação e exclusão */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fotos.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", minHeight: "120px" }}>
            {fotos.map((foto, i) => (
              <SortableFoto key={foto.id} foto={foto} index={i} onRemove={removeFoto} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fotos.length > 0 && (
        <button onClick={handleSave} style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}>
          Salvar no servidor
        </button>
      )}

      {/* Visualização separada */}
      <h3 style={{ marginTop: "30px" }}>Visualização</h3>
      <GalleryViewer fotos={fotos} />
    </div>
  );
}
