'use client';

import Link from "next/link";

import { useVeiculos } from "@/hooks/use-veiculos";
import type { Veiculo } from "@/types/estoque";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatEnum(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return null;
  }

  return currencyFormatter.format(value);
}

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
            {veiculos.map((veiculo) => {
              const marcaModelo = [veiculo.modelo?.marca, veiculo.modelo?.nome]
                .filter(Boolean)
                .join(" ") || "Modelo não informado";
              const anoExibicao = veiculo.ano_modelo ?? veiculo.ano_fabricacao;
              const lojaNome = veiculo.loja?.loja?.nome ?? "Sem loja atribuída";
              const precoVitrine = veiculo.loja?.preco ?? veiculo.preco_venal;
              const precoFormatado = formatCurrency(precoVitrine);

              return (
                <li key={veiculo.id} className="h-full">
                  <Link
                    href={`/estoque/${veiculo.id}`}
                    className="flex h-full flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                        {formatEnum(veiculo.estado_venda)}
                      </span>
                      <h2 className="text-lg font-medium text-zinc-800">
                        {marcaModelo}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        Placa {veiculo.placa}
                      </p>
                    </div>
                    <dl className="mt-4 grid grid-cols-1 gap-y-3 text-sm text-zinc-600">
                      <div className="flex justify-between">
                        <dt className="font-semibold text-zinc-700">Ano</dt>
                        <dd>{anoExibicao ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-semibold text-zinc-700">Cor</dt>
                        <dd>{veiculo.cor}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-semibold text-zinc-700">Loja</dt>
                        <dd>{lojaNome}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-semibold text-zinc-700">Preço</dt>
                        <dd>{precoFormatado ?? "—"}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
