"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import type { FotoVeiculoLoja } from "@/hooks/use-fotos-veiculo-loja";

interface PhotoLightboxProps {
  fotos: FotoVeiculoLoja[];
  fotoAtiva: number;
  vehicleDisplay: string;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function getImageUrl(url: string, w = 800, q = 80) {
  return `${url}?width=${w}&quality=${q}&format=webp`;
}

export function PhotoLightbox({
  fotos,
  fotoAtiva,
  vehicleDisplay,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: PhotoLightboxProps) {
  const swipeStartRef = useRef<number | null>(null);

  const fotoAtual = fotos[fotoAtiva] ?? null;

  const handleSwipeStart = useCallback((clientX: number | null) => {
    swipeStartRef.current = clientX;
  }, []);

  const handleSwipeEnd = useCallback(
    (clientX: number | null) => {
      const start = swipeStartRef.current;
      if (start == null || clientX == null) {
        swipeStartRef.current = null;
        return;
      }

      const delta = clientX - start;
      const SWIPE_THRESHOLD = 40;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0) {
          onNext();
        } else {
          onPrevious();
        }
      }

      swipeStartRef.current = null;
    },
    [onNext, onPrevious]
  );

  const handleOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      handleSwipeStart(event.clientX);
    },
    [handleSwipeStart]
  );

  const handleOverlayPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      handleSwipeEnd(event.clientX);
    },
    [handleSwipeEnd]
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (!fotos.length) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, fotos.length, onNext, onPrevious, onClose]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) {
      swipeStartRef.current = null;
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      swipeStartRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-6"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handleOverlayPointerDown}
        onPointerUp={handleOverlayPointerUp}
        onPointerLeave={(event) => handleSwipeEnd(event.clientX)}
        onPointerCancel={() => handleSwipeEnd(null)}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Fechar visualização em foco"
        >
          Fechar
        </button>

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPrevious();
              }}
              className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Foto anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Próxima foto"
            >
              →
            </button>
          </>
        )}

        <div className="relative flex w-full flex-1 items-center justify-center">
          {fotoAtual ? (
            <div className="relative h-full w-full">
              <Image
                src={getImageUrl(fotoAtual.url, 1920, 95)}
                alt={vehicleDisplay}
                fill
                className="select-none object-contain"
                sizes="100vw"
                priority
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
              Nenhuma foto disponível
            </div>
          )}
        </div>

        {fotos.length > 0 && (
          <div className="flex items-center gap-3 text-sm font-medium text-white/80">
            <span>{vehicleDisplay}</span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {fotoAtiva + 1} / {fotos.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
