'use client';

import Link from "next/link";
import type { Veiculo } from "@/types/estoque";
import { useVeiculos } from "@/hooks/use-veiculos";

export default function EstoquePage() {
  const { data = [], isLoading } = useVeiculos();
  const veiculos: Veiculo[] = data;

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <header className="mx-auto flex w-full max-w-5xl flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estoque de Veículos</h1>
          <p className="text-sm text-zinc-500">
            Visualize os veículos cadastrados para cada loja.
          </p>
        </div>
        <span className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600">
          {veiculos.length} veículos
        </span>
      </header>

      <main className="mx-auto mt-10 w-full max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-base font-medium text-zinc-600">
              Carregando veículos do estoque...
            </p>
          </div>
        ) : veiculos.length === 0 ? (
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
            {veiculos.map((veiculo) => (
              <li
                key={veiculo.id}
                className="h-full"
              >
                <Link
                  href={`/estoque/${veiculo.id}`}
                  className="flex h-full flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                >
                  <div>
                    <h2 className="text-lg font-medium text-zinc-800">
                      {veiculo.marca} {veiculo.modelo}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">{veiculo.placa}</p>
                  </div>
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-600">
                    <div>
                      <dt className="font-semibold text-zinc-700">Ano</dt>
                      <dd>{veiculo.ano}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-700">Cor</dt>
                      <dd>{veiculo.cor}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
