import { useState } from "react";

export interface PreviewImage {
  id: string;
  file?: File;
  preview: string;
  isNew?: boolean;
}

interface GalleryViewerProps {
  fotos: PreviewImage[];
}

export function GalleryViewer({ fotos }: GalleryViewerProps) {
  const [focusedImage, setFocusedImage] = useState<string | null>(null);

  if (fotos.length === 0) {
    return <p style={{ color: "#777", textAlign: "center" }}>Nenhuma foto salva</p>;
  }

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", minHeight: "120px" }}>
        {fotos.map((foto, i) => (
          <div
            key={foto.id}
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
              background: "#f9f9f9",
            }}
            onClick={() => setFocusedImage(foto.preview)}
          >
            <img
              src={foto.preview}
              alt={`foto-${i}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                padding: "2px 6px",
                fontSize: "12px",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                textAlign: "center",
              }}
            >
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de foco */}
      {focusedImage && (
        <div
          onClick={() => setFocusedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            cursor: "zoom-out",
          }}
        >
          <img
            src={focusedImage}
            alt="Foco"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              boxShadow: "0 4px 12px rgba(255,255,255,0.2)",
            }}
          />
        </div>
      )}
    </>
  );
}
