"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import type { VeiculoLojaUI } from "@/adapters/adaptador-vitrine";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

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
}

const getDisplayPrice = (veiculo: any) => {
  if ('precoLojaFormatado' in veiculo) {
    return veiculo.precoLojaFormatado ?? veiculo.veiculo?.precoFormatado ?? "—";
  }
  return veiculo.precoFormatado ?? "—";
};

const getVehicleData = (item: any, domain: Domain) => {
  if (domain === "vitrine") {
    return {
      id: item.id,
      display: item.veiculo?.veiculoDisplay ?? "Veículo sem modelo",
      placa: item.veiculo?.placa ?? "—",
      local: item.veiculo?.localDisplay ?? "Sem local",
      ano: item.veiculo?.anoPrincipal ?? "—",
      hodometro: item.veiculo?.hodometroFormatado ?? "—",
      estado: item.veiculo?.estadoVendaLabel ?? "Sem status",
      capaUrl: item.capaUrl,
      dataEntrada: item.dataEntradaFormatada ?? "—",
      caracteristicas: item.veiculo?.caracteristicasPrincipais ?? [],
      temFotos: item.temFotos ?? false,
      detailUrl: `/vitrine/${item.id}`,
    };
  }
  
  return {
    id: item.id,
    display: item.veiculoDisplay ?? "Veículo sem modelo",
    placa: item.placa ?? "—",
    local: item.localDisplay ?? "Sem local",
    ano: item.anoPrincipal ?? "—",
    hodometro: item.hodometroFormatado ?? "—",
    estado: item.estadoVendaLabel ?? "Sem status",
    capaUrl: item.capaUrl,
    dataEntrada: item.registradoEmFormatado ?? "—",
    caracteristicas: item.caracteristicasPrincipais ?? [],
    temFotos: item.temFotos ?? false,
    detailUrl: `/estoque/${item.id}`,
  };
};

const GridCards = ({ vehicles, domain }: { vehicles: any[]; domain: Domain }) => (
  <ul className="grid max-w-screen-xl grid-cols-1 gap-6 px-4 mx-auto sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
    {vehicles.map((item) => {
      const data = getVehicleData(item, domain);
      return (
        <li key={data.id} className="flex flex-col h-full w-full">
          <Card variant="default" className="flex h-full w-full flex-col overflow-hidden">
            <Link href={data.detailUrl} className="block h-full w-full">
              <div className="relative aspect-video w-full bg-[var(--white-soft)] overflow-hidden">
                {data.capaUrl ? (
                  <Image
                    src={data.capaUrl}
                    alt={data.display}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                    Sem foto de capa
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5 min-h-0 break-words">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Badge variant="info">{data.estado}</Badge>
                  <span className="flex-shrink-0 text-sm sm:text-base lg:text-lg font-semibold text-[var(--text-primary)] truncate">
                    {getDisplayPrice(item)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--text-primary)] clamp-2 leading-tight">
                    {data.display}
                  </h4>
                  <p className="text-xs sm:text-sm lg:text-base text-[var(--text-secondary)]">
                    Placa {data.placa}
                  </p>
                </div>

                <dl className="grid gap-3 text-xs sm:text-sm lg:text-base text-[var(--text-secondary)] sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-[var(--text-primary)]">Local</dt>
                    <dd>{data.local}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--text-primary)]">Ano</dt>
                    <dd>{data.ano}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--text-primary)]">Disponível desde</dt>
                    <dd>{data.dataEntrada}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[var(--text-primary)]">Hodômetro</dt>
                    <dd>{data.hodometro}</dd>
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

const InfoCards = ({ vehicles, domain }: { vehicles: any[]; domain: Domain }) => (
  <ul className="flex flex-col gap-4">
    {vehicles.map((item) => {
      const data = getVehicleData(item, domain);
      return (
        <li key={data.id}>
          <Card variant="default" className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <Link href={data.detailUrl}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {data.display}
                  </h2>
                  <Badge variant="info">{data.estado}</Badge>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)]">
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">Placa:</span> {data.placa}
                  </span>
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">Local:</span> {data.local}
                  </span>
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">Ano:</span> {data.ano}
                  </span>
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">Entrada:</span> {data.dataEntrada}
                  </span>
                  <span>
                    <span className="font-medium text-[var(--text-primary)]">Preço:</span> {getDisplayPrice(item)}
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

const TableView = ({ vehicles, domain }: { vehicles: any[]; domain: Domain }) => {
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

          <thead className="bg-white text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Fotos</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-subtle)] bg-white text-sm text-[var(--text-secondary)]">
            {vehicles.map((item) => {
              const data = getVehicleData(item, domain);
              return (
                <tr
                  key={data.id}
                  onClick={() => router.push(data.detailUrl)}
                  className="cursor-pointer select-none transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis font-medium text-[var(--text-primary)]">
                      {data.display}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis">
                      {data.placa}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis">
                      {getDisplayPrice(item)}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis">
                      {data.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span className="block overflow-hidden text-ellipsis">
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
}: RenderCardsProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-white py-16 text-center text-sm text-[var(--text-secondary)]">
        Carregando veículos…
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-white py-16 text-center text-sm text-[var(--text-secondary)]">
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
        <div className={`${focusMode ? 'fixed inset-0 z-50 overflow-auto' : 'relative'} p-6`}>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-[var(--text-primary)]" />
            </button>
          )}
          <div className={focusMode ? 'container mx-auto py-12' : ''}>
            {renderContent()}
          </div>
        </div>
      </>
    );
  }

  return <div className="w-full">{renderContent()}</div>;
}
