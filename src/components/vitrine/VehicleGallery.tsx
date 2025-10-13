"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import type { FotoVeiculoLoja } from "@/hooks/use-fotos-veiculo-loja";

interface VehicleGalleryProps {
  fotos: FotoVeiculoLoja[];
  isLoading: boolean;
  vehicleDisplay: string;
  onOpenLightbox?: (index: number) => void;
}

function getImageUrl(url: string, w = 800, q = 80) {
  return `${url}?width=${w}&quality=${q}&format=webp`;
}

export function VehicleGallery({
  fotos,
  isLoading,
  vehicleDisplay,
  onOpenLightbox,
}: VehicleGalleryProps) {
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const miniaturasRef = useRef<HTMLDivElement | null>(null);
  const imagensPrefetchRef = useRef<Set<string>>(new Set<string>());

  const fotoAtual = useMemo(() => fotos[fotoAtiva] ?? null, [fotos, fotoAtiva]);

  useEffect(() => {
    const track = miniaturasRef.current;
    if (!track) return;
    const active = track.children?.[fotoAtiva] as HTMLElement | undefined;
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [fotoAtiva]);

  useEffect(() => {
    setFotoAtiva(0);
  }, [fotos.length]);

  useEffect(() => {
    const track = miniaturasRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => track.removeEventListener("wheel", handleWheel);
  }, [fotos.length]);

  useEffect(() => {
    if (!fotos.length) return;
    const cache = imagensPrefetchRef.current;
    fotos.forEach((f: FotoVeiculoLoja) => {
      if (!f?.url || cache.has(f.url)) return;
      cache.add(f.url);
      const img = new window.Image();
      img.src = f.url;
    });
  }, [fotos]);

  const goToPrevFoto = useCallback(() => {
    if (!fotos.length) return;
    setFotoAtiva((prev) => (prev - 1 + fotos.length) % fotos.length);
  }, [fotos.length]);

  const goToNextFoto = useCallback(() => {
    if (!fotos.length) return;
    setFotoAtiva((prev) => (prev + 1) % fotos.length);
  }, [fotos.length]);

  const handleOpenLightbox = useCallback(() => {
    if (!fotoAtual) return;
    onOpenLightbox?.(fotoAtiva);
  }, [fotoAtual, fotoAtiva, onOpenLightbox]);

  const handleOpenLightboxKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!fotoAtual) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenLightbox?.(fotoAtiva);
      }
    },
    [fotoAtual, fotoAtiva, onOpenLightbox]
  );

  return (
    <section className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={fotoAtual ? 0 : -1}
        onClick={handleOpenLightbox}
        onKeyDown={handleOpenLightboxKeyDown}
        className={`relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 sm:rounded-lg sm:border sm:border-gray-200 dark:sm:border-gray-700 transition-shadow duration-300 ${
          fotoAtual ? "cursor-zoom-in hover:shadow-xl" : "cursor-not-allowed opacity-70"
        }`}
        aria-label="Ampliar foto"
        aria-disabled={!fotoAtual}
      >
        <div className="relative h-[68vh] min-h-[320px] max-h-[820px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Carregando fotos...
            </div>
          ) : fotoAtual ? (
            <Image
              src={getImageUrl(fotoAtual.url, 1200, 90)}
              alt={vehicleDisplay}
              fill
              className="object-contain select-none"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
              priority
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Nenhuma foto cadastrada
            </div>
          )}
        </div>

        {fotos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToPrevFoto();
              }}
              className="rounded-full bg-white/90 dark:bg-gray-900/90 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg transition hover:bg-white dark:hover:bg-gray-800"
              aria-label="Foto anterior"
            >
              ←
            </button>
            <span className="rounded-full bg-white/90 dark:bg-gray-900/90 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg">
              {fotoAtiva + 1} / {fotos.length}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToNextFoto();
              }}
              className="rounded-full bg-white/90 dark:bg-gray-900/90 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg transition hover:bg-white dark:hover:bg-gray-800"
              aria-label="Próxima foto"
            >
              →
            </button>
          </div>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="sm:mx-0">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white dark:from-gray-950 to-transparent sm:rounded-l-lg" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-gray-950 to-transparent sm:rounded-r-lg" />

            <div
              ref={miniaturasRef}
              className="flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar pb-2 px-4 h-20 snap-x snap-mandatory touch-pan-x overscroll-x-contain w-full max-w-full"
            >
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setFotoAtiva(index)}
                  className={`relative h-20 aspect-square flex-shrink-0 overflow-hidden rounded-md border transition snap-start ${
                    fotoAtiva === index
                      ? "border-purple-500 dark:border-purple-400 ring-2 ring-purple-300 dark:ring-purple-600"
                      : "border-transparent"
                  }`}
                  aria-current={fotoAtiva === index}
                  aria-label={`Miniatura ${index + 1}`}
                >
                  <Image
                    src={getImageUrl(foto.url, 120, 60)}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover object-center pointer-events-none select-none"
                    sizes="80px"
                    draggable={false}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
