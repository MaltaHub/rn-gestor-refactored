"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { Button } from "@/components/ui/button";

function formatEnumLabel(value?: string | null) {
  if (!value) return "—";
  return value
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function formatCurrencyBRL(value?: number | null) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatKm(value?: number | null) {
  if (typeof value !== "number") return "—";
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`;
}

export default function ImprimirEstoquePage() {
  const { data: veiculos = [], isLoading } = useVeiculosUI();
  useEffect(() => {
    document.body.classList.add("estoque-imprimir-mode");
    return () => {
      document.body.classList.remove("estoque-imprimir-mode");
    };
  }, []);

  const grupos = useMemo(() => {
    const map = new Map<string, VeiculoUI[]>();
    veiculos.forEach((v) => {
      const key = v.local?.nome || "Sem unidade";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    // ordena por nome da unidade
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [veiculos]);

  const hoje = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    return formatter.format(new Date());
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Relatório de Estoque por Unidade</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Gerado em {hoje}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/estoque" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
              </Link>
            </Button>
            <Button type="button" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" />}>Imprimir</Button>
          </div>
        </header>

        {isLoading ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Carregando veículos...</div>
        ) : grupos.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Nenhum veículo para impressão.</div>
        ) : (
          <div className="space-y-12">
            {grupos.map(([unidade, lista], idx) => (
              <section key={unidade} className={idx > 0 ? "break-before-page" : undefined}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-xl font-semibold">{unidade}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{lista.length} veículo(s)</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 print:shadow-none">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        <th className="px-4 py-3">Modelo</th>
                        <th className="px-4 py-3">Edição / Combustível / Câmbio</th>
                        <th className="px-4 py-3">Cor</th>
                        <th className="px-4 py-3">Ano</th>
                        <th className="px-4 py-3">Hodômetro</th>
                        <th className="px-4 py-3 text-right">Preço venal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {lista
                        .slice()
                        .sort((a, b) => (a.modelo?.nome || "").localeCompare(b.modelo?.nome || "", "pt-BR"))
                        .map((v) => {
                          const modeloNome = v.modelo?.nome ?? "—";
                          const edicao = v.modelo?.edicao ?? null;
                          const combustivel = formatEnumLabel(v.modelo?.combustivel ?? null);
                          const cambio = formatEnumLabel(v.modelo?.tipo_cambio ?? null);
                          const combinação = [edicao, combustivel, cambio].filter(Boolean).join(" • ") || "—";
                          const ano = [v.ano_modelo ?? "—", v.ano_fabricacao ?? "—"].join("/");
                          return (
                            <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                              <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{modeloNome}</td>
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{combinação}</td>
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{v.cor ?? "—"}</td>
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{ano}</td>
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{formatKm(v.hodometro)}</td>
                              <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrencyBRL(v.preco_venal)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Estilos de impressão simples */}
      <style>{`
        body.estoque-imprimir-mode button[aria-label="Abrir menu"] {
          display: none !important;
        }

        @page {
          margin: 8mm;
        }

        @media print {
          .print\:hidden { display: none !important; }
          .break-before-page { break-before: page; page-break-before: always; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
