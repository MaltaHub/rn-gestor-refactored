"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import type { VeiculoLojaUI } from "@/adapters/adaptador-vitrine";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/config";
import { isEstadoVendido } from "@/utils/status";

type ViewMode = "cards-photo" | "cards-info" | "table";
type Domain = "vitrine" | "estoque";
type Mode = "popup" | "inline";

interface RenderCardsProps {
  vehicles: VeiculoLojaUI[] | VeiculoUI[];
  viewMode: ViewMode;
  domain: Domain;
  mode?: Mode;
  focusMode?: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  initialScroll?: number;
  onScrollChange?: (position: number) => void;
}

const resolveImageUrl = (path: string) => {
  if (!path) return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const { data } = supabase.storage.from(STORAGE_BUCKETS.FOTOS_VEICULOS_LOJA).getPublicUrl(trimmed);
  const url = data?.publicUrl ?? trimmed;
  // Garante URL bem formada para o otimizador do Next
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return url;
  }
};

const getDisplayPrice = (veiculo: VeiculoLojaUI | VeiculoUI) => {
  if ('precoLojaFormatado' in veiculo) {
    return veiculo.precoLojaFormatado ?? veiculo.veiculo?.precoFormatado ?? "—";
  }
  return veiculo.precoFormatado ?? "—";
};

const getVehicleData = (item: VeiculoLojaUI | VeiculoUI, domain: Domain) => {
  if (domain === "vitrine" && 'veiculo' in item) {
    const vitrineItem = item as VeiculoLojaUI;
    return {
      id: vitrineItem.id,
      display: vitrineItem.veiculo?.veiculoDisplay ?? "Veículo sem modelo",
      placa: vitrineItem.veiculo?.placa ?? "—",
      local: vitrineItem.veiculo?.localDisplay ?? "Sem local",
      ano: vitrineItem.veiculo?.anoPrincipal ?? "—",
      hodometro: vitrineItem.veiculo?.hodometroFormatado ?? "—",
      estado: vitrineItem.veiculo?.estadoVendaLabel ?? "Sem status",
      capaUrl: vitrineItem.capaUrl,
      dataEntrada: vitrineItem.dataEntradaFormatada ?? "—",
      caracteristicas: vitrineItem.veiculo?.caracteristicasPrincipais ?? [],
      temFotos: vitrineItem.temFotos ?? false,
      detailUrl: `/vitrine/${vitrineItem.id}`,
    };
  }
  
  const estoqueItem = item as VeiculoUI;
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
  const registradoEmFormatado = estoqueItem.registrado_em 
    ? dateFormatter.format(new Date(estoqueItem.registrado_em)) 
    : "—";
  return {
    id: estoqueItem.id,
    display: estoqueItem.veiculoDisplay ?? "Veículo sem modelo",
    placa: estoqueItem.placa ?? "—",
    local: estoqueItem.localDisplay ?? "Sem local",
    ano: estoqueItem.anoPrincipal ?? "—",
    hodometro: estoqueItem.hodometroFormatado ?? "—",
    estado: estoqueItem.estadoVendaLabel ?? "Sem status",
    capaUrl: null,
    dataEntrada: registradoEmFormatado,
    caracteristicas: estoqueItem.caracteristicasPrincipais ?? [],
    temFotos: false,
    detailUrl: `/estoque/${estoqueItem.id}`,
  };
};

const LazyVehicleImage = ({ src, alt }: { src: string; alt: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = useMemo(() => resolveImageUrl(src), [src]);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setShouldLoad(false);
  }, [resolvedSrc]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !resolvedSrc || shouldLoad) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [resolvedSrc, shouldLoad]);

  const showSkeleton = (!shouldLoad || !isLoaded) && !hasError;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
    >
      {shouldLoad && !hasError && (
        <Image
          key={resolvedSrc}
          src={resolvedSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          priority={false}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
        />
      )}

      {showSkeleton && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/60 via-gray-100/60 to-gray-200/60 dark:from-gray-700/60 dark:via-gray-800/60 dark:to-gray-700/60"
          aria-hidden="true"
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            Sem foto de capa
          </span>
        </div>
      )}
    </div>
  );
};

const GridCards = ({ vehicles, domain }: { vehicles: (VeiculoLojaUI | VeiculoUI)[]; domain: Domain }) => (
  <ul className="grid max-w-screen-xl grid-cols-1 gap-6 px-4 mx-auto sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
    {vehicles.map((item) => {
      const data = getVehicleData(item, domain);
      const isSold = isEstadoVendido(data.estado);
      return (
        <li key={data.id} className="flex flex-col h-full w-full">
          <Card variant="default" padding="none" className="flex h-full w-full flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <Link href={data.detailUrl} className="block h-full w-full group">
              {data.capaUrl ? (
                <LazyVehicleImage src={data.capaUrl} alt={data.display} />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden">
                  <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sem foto de capa
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col gap-4 p-6 min-h-0 break-words">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <Badge variant={isSold ? "danger" : "info"} className="font-semibold shrink-0">
                    {data.estado}
                  </Badge>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400 break-words text-right sm:text-left min-w-0">
                    {getDisplayPrice(item)}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 clamp-2 leading-tight">
                    {data.display}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Placa {data.placa}
                  </p>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Local</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.local}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Ano</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.ano}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Disponível desde</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.dataEntrada}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Hodômetro</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.hodometro}</dd>
                  </div>
                </dl>

                {data.caracteristicas?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.caracteristicas.slice(0, 3).map((caracteristica: string) => (
                      <Badge key={caracteristica} variant="success" size="sm">
                        {caracteristica}
                      </Badge>
                    ))}
                    {data.caracteristicas.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{data.caracteristicas.length - 3} mais
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </Card>
        </li>
      );
    })}
  </ul>
);

const InfoCards = ({ vehicles, domain }: { vehicles: (VeiculoLojaUI | VeiculoUI)[]; domain: Domain }) => (
  <ul className="flex flex-col gap-4">
    {vehicles.map((item) => {
      const data = getVehicleData(item, domain);
      const isSold = isEstadoVendido(data.estado);
      return (
        <li key={data.id}>
          <Card variant="default" className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between hover:shadow-lg transition-shadow duration-300">
            <Link href={data.detailUrl}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {data.display}
                  </h2>
                  <Badge variant={isSold ? "danger" : "info"} className="font-semibold">
                    {data.estado}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Placa:</span> {data.placa}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Local:</span> {data.local}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Ano:</span> {data.ano}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Entrada:</span> {data.dataEntrada}
                  </span>
                  <span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Preço:</span> <span className="font-bold text-purple-600 dark:text-purple-400">{getDisplayPrice(item)}</span>
                  </span>
                </div>
                {data.caracteristicas?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.caracteristicas.slice(0, 4).map((caracteristica: string) => (
                      <Badge key={caracteristica} variant="success" size="sm">
                        {caracteristica}
                      </Badge>
                    ))}
                    {data.caracteristicas.length > 4 && (
                      <Badge variant="default" size="sm">
                        +{data.caracteristicas.length - 4} mais
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </Card>
        </li>
      );
    })}
  </ul>
);

const TableView = ({ vehicles, domain }: { vehicles: (VeiculoLojaUI | VeiculoUI)[]; domain: Domain }) => {
  const router = useRouter();
  
  return (
    <Card variant="default" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-[var(--border)]">
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Fotos</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
            {vehicles.map((item) => {
              const data = getVehicleData(item, domain);
              const isSold = isEstadoVendido(data.estado);
              return (
                <tr
                  key={data.id}
                  onClick={() => router.push(data.detailUrl)}
                  className="cursor-pointer select-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                >
                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis font-semibold text-gray-900 dark:text-gray-100">
                      {data.display}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis text-gray-700 dark:text-gray-300">
                      {data.placa}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis font-semibold text-purple-600 dark:text-purple-400">
                      {getDisplayPrice(item)}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span
                      className={`block overflow-hidden text-ellipsis ${
                        isSold ? 'text-[var(--danger)] font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {data.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis text-gray-700 dark:text-gray-300">
                      {data.local}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <Badge variant={data.temFotos ? "success" : "default"} size="sm">
                      {data.temFotos ? "Sim" : "Não"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export function RenderCards({
  vehicles,
  viewMode,
  domain,
  mode = "inline",
  focusMode = false,
  onClose,
  isLoading = false,
  initialScroll,
  onScrollChange,
}: RenderCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  
  const debouncedScrollPosition = useDebounce(scrollPositionRef.current, 500);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    if (onScrollChange && debouncedScrollPosition > 0) {
      onScrollChange(debouncedScrollPosition);
    }
  }, [debouncedScrollPosition, onScrollChange]);

  useEffect(() => {
    if (initialScroll !== undefined && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = initialScroll;
    }
  }, [initialScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !onScrollChange) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, onScrollChange]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-16 text-center text-sm text-gray-600 dark:text-gray-400">
        Carregando veículos…
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-16 text-center text-sm text-gray-600 dark:text-gray-400">
        Nenhum veículo encontrado.
      </div>
    );
  }

  const renderContent = () => {
    switch (viewMode) {
      case "table":
        return <TableView vehicles={vehicles} domain={domain} />;
      case "cards-info":
        return <InfoCards vehicles={vehicles} domain={domain} />;
      default:
        return <GridCards vehicles={vehicles} domain={domain} />;
    }
  };

  if (mode === "popup") {
    return (
      <>
        {focusMode && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div 
          ref={scrollContainerRef}
          className={`${focusMode ? 'fixed inset-0 z-50 overflow-auto' : 'relative'} p-6`}
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-gray-900 dark:text-gray-100" />
            </button>
          )}
          <div className={focusMode ? 'container mx-auto py-12' : ''}>
            {renderContent()}
          </div>
        </div>
      </>
    );
  }

  return (
    <div ref={scrollContainerRef} className="w-full overflow-auto">
      {renderContent()}
    </div>
  );
}
