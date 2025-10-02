"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";

const ESTADOS_VENDA: VeiculoUI["estado_venda"][] = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
];

const formatEstadoLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function EstoquePage() {
  const { data: veiculos = [], isLoading } = useVeiculosUI();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const estadoFiltroParam = searchParams.get("estado");
  const estadoFiltro = estadoFiltroParam && ESTADOS_VENDA.includes(estadoFiltroParam as VeiculoUI["estado_venda"])
    ? (estadoFiltroParam as VeiculoUI["estado_venda"])
    : null;

  const { filtrados, contagemPorEstado } = useMemo(() => {
    const porEstado = ESTADOS_VENDA.reduce<Record<string, number>>((acc, estado) => {
      acc[estado] = 0;
      return acc;
    }, {});

    const listaFiltrada = veiculos.filter((veiculo) => {
      const estadoAtual = veiculo.estado_venda;
      if (estadoAtual && porEstado[estadoAtual] >= 0) {
        porEstado[estadoAtual] += 1;
      }
      if (!estadoFiltro) return true;
      return estadoAtual === estadoFiltro;
    });

    return {
      filtrados: estadoFiltro ? listaFiltrada : veiculos,
      contagemPorEstado: porEstado,
    } as const;
  }, [estadoFiltro, veiculos]);

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <header className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Estoque de Veículos</h1>
            <p className="text-sm text-zinc-500">
              Visualize, edite e cadastre veículos disponíveis nas lojas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 sm:inline-flex">
              {veiculos.length} veículos
            </span>
            <Link
              href="/criar"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Cadastrar veículo
            </Link>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={pathname ?? "/estoque"}
            className={`rounded-full border px-3 py-1.5 transition ${
              !estadoFiltro
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
            }`}
          >
            Todos
            <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-zinc-500">
              {veiculos.length}
            </span>
          </Link>
          {ESTADOS_VENDA.map((estado) => {
            const active = estadoFiltro === estado;
            const href = `${pathname}?estado=${estado}`;
            return (
              <Link
                key={estado}
                href={href}
                className={`rounded-full border px-3 py-1.5 transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                }`}
              >
                {formatEstadoLabel(estado)}
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-zinc-500">
                  {contagemPorEstado[estado] ?? 0}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto mt-10 w-full max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-base font-medium text-zinc-600">
              Carregando veículos do estoque...
            </p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-base font-medium text-zinc-600">
              Nenhum veículo disponível no momento.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Cadastre novos veículos para acompanhar o estoque aqui.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((veiculo) => {
              const precoFormatado = veiculo.precoFormatado;
              const hodometroFormatado = veiculo.hodometroFormatado ?? "—";
              const caracteristicasResumo = veiculo.caracteristicasPrincipais;

              return (
                <li key={veiculo.id} className="h-full">
                  <article className="flex h-full flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                          {veiculo.estadoVendaLabel}
                        </span>
                        {precoFormatado && (
                          <span className="text-sm font-semibold text-zinc-800">
                            {precoFormatado}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-zinc-800">{veiculo.veiculoDisplay}</h2>
                        <p className="text-sm text-zinc-500">Placa {veiculo.placa}</p>
                      </div>
                      <dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Ano</dt>
                          <dd className="text-zinc-600">{veiculo.anoPrincipal ?? "—"}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Hodômetro</dt>
                          <dd className="text-zinc-600">{hodometroFormatado}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Estado do veículo</dt>
                          <dd className="text-zinc-600">{veiculo.estadoVeiculoLabel}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Localização</dt>
                          <dd className="text-zinc-600">{veiculo.localDisplay}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Documentação</dt>
                          <dd className="text-zinc-600">
                            {veiculo.estagio_documentacao ?? "Sem informação"}
                          </dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="font-semibold text-zinc-700">Cor</dt>
                          <dd className="text-zinc-600">{veiculo.cor}</dd>
                        </div>
                      </dl>
                      {caracteristicasResumo.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {caracteristicasResumo.map((nome) => (
                            <span
                              key={nome}
                              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
                            >
                              {nome}
                            </span>
                          ))}
                          {veiculo.caracteristicasExtrasTotal > 0 && (
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
                              +{veiculo.caracteristicasExtrasTotal} mais
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <footer className="mt-6 flex flex-wrap gap-2 text-sm">
                      <Link
                        href={`/estoque/${veiculo.id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                      >
                        Ver detalhes
                      </Link>
                      <Link
                        href={`/editar/${veiculo.id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700"
                      >
                        Editar
                      </Link>
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
