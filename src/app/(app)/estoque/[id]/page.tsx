'use client';

import Link from "next/link";
import { useParams } from "next/navigation";

import type { Veiculo } from "@/types/estoque";
import { useVeiculo } from "@/hooks/use-veiculos";

export default function EstoqueDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const {
    data: veiculo,
    isLoading,
  } = useVeiculo(id);

  if (!Number.isFinite(id)) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo inválido
          </h1>
          <p className="text-sm text-zinc-500">
            Não foi possível identificar o veículo solicitado.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-3 text-center">
          <p className="text-base font-medium text-zinc-600">
            Carregando informações do veículo...
          </p>
        </main>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="bg-white px-6 py-10 text-zinc-900">
        <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Veículo não encontrado
          </h1>
          <p className="text-sm text-zinc-500">
            O veículo solicitado não está disponível ou foi removido do estoque.
          </p>
          <Link className="text-sm font-medium text-blue-600" href="/estoque">
            Voltar ao estoque
          </Link>
        </main>
      </div>
    );
  }

  const { marca, modelo, ano, cor, placa }: Veiculo = veiculo;

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              {marca} {modelo}
            </h1>
            <p className="text-sm text-zinc-500">Placa {placa}</p>
          </div>
          <Link
            className="text-sm font-medium text-blue-600 hover:underline"
            href="/estoque"
          >
            Voltar ao estoque
          </Link>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800">Detalhes do veículo</h2>
          <dl className="mt-4 grid grid-cols-1 gap-y-4 text-sm text-zinc-600 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-zinc-700">Ano</dt>
              <dd>{ano}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-700">Cor</dt>
              <dd>{cor}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-700">Modelo</dt>
              <dd>{modelo}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-700">Marca</dt>
              <dd>{marca}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
