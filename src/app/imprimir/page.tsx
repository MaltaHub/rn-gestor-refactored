"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLojaStore } from "@/stores/useLojaStore";
import { useVeiculosLojaUI, type VeiculoLojaUI } from "@/adapters/adaptador-vitrine";
import { useUnidadesLojaQuery } from "@/hooks/use-unidades-loja-query";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatEnumLabel(value?: string | null) {
  if (!value) return "—";
  return value
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return "—";
  return currencyFormatter.format(value);
}

function formatKm(value?: number | null) {
  if (typeof value !== "number") return "—";
  return `${numberFormatter.format(value)} km`;
}

function formatUnidadeNomeBruto(nome?: string | null) {
  if (!nome) return "Unidade";
  const partes = nome.split("*").map((parte) => parte.trim()).filter(Boolean);
  if (partes.length === 2) {
    return `${partes[0]} • ${partes[1]}`;
  }
  if (partes.length === 1) {
    return partes[0];
  }
  return nome.trim() || "Unidade";
}

type VeiculoDetalhado = NonNullable<VeiculoLojaUI["veiculo"]>;
type ModeloDetalhado = VeiculoDetalhado["modelo"];

type VeiculoLinha = {
  registro: VeiculoLojaUI & { veiculo: VeiculoDetalhado };
  precoReferencia: number;
  precoDisplay: string;
  modeloNome: string;
  placa: string;
  edicaoCombustivelCambio: string;
  anoDisplay: string;
  cor: string;
  hodometro: string;
  localDisplay: string;
  localId: string | null;
};

const resolverPreco = (registro: VeiculoLojaUI): number | null => {
  if (typeof registro.precoLoja === "number") return registro.precoLoja;
  const precoVenal = registro.veiculo?.preco_venal;
  return typeof precoVenal === "number" ? precoVenal : null;
};

const buildEdicaoCombustivelCambio = (modelo: ModeloDetalhado | null | undefined) => {
  const edicao = modelo?.edicao?.trim() ? modelo.edicao.trim() : null;
  const combustivel = formatEnumLabel(modelo?.combustivel ?? null);
  const cambio = formatEnumLabel(modelo?.tipo_cambio ?? null);

  const parts = [
    edicao,
    combustivel === "—" ? null : combustivel,
    cambio === "—" ? null : cambio,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return parts.length > 0 ? parts.join(" • ") : "—";
};

export default function ImprimirVitrinePage() {
  const lojaSelecionada = useLojaStore((state) => state.lojaSelecionada);
  const lojaId = lojaSelecionada?.id;

  const { data: veiculosLoja = [], isLoading } = useVeiculosLojaUI(lojaId);
  const { data: unidades = [], isLoading: isUnidadesLoading } = useUnidadesLojaQuery(lojaId);

  useEffect(() => {
    document.body.classList.add("vitrine-imprimir-mode");
    return () => {
      document.body.classList.remove("vitrine-imprimir-mode");
    };
  }, []);

  const dataHoraGeracao = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
    return formatter.format(new Date());
  }, []);

  const agrupamento = useMemo(() => {
    const porUnidadeMap = new Map<
      string,
      {
        nome: string;
        itens: VeiculoLinha[];
      }
    >();

    const ensureUnidade = (id: string | null | undefined, nome: string | null | undefined) => {
      if (!id) return null;
      const nomeNormalizado = formatUnidadeNomeBruto(nome ?? null);
      const existente = porUnidadeMap.get(id);
      if (existente) {
        if (existente.nome === "Unidade" && nomeNormalizado !== "Unidade") {
          existente.nome = nomeNormalizado;
        }
        return existente;
      }
      const entrada = {
        nome: nomeNormalizado,
        itens: [] as VeiculoLinha[],
      };
      porUnidadeMap.set(id, entrada);
      return entrada;
    };

    unidades.forEach((unidade) => {
      ensureUnidade(unidade.id, unidade.nomeFormatado ?? unidade.nome);
    });

    const disponiveisOrdenados = veiculosLoja
      .filter((registro): registro is VeiculoLojaUI & { veiculo: VeiculoDetalhado } => {
        const veiculo = registro.veiculo;
        if (!veiculo) return false;
        return veiculo.estado_venda === "disponivel";
      })
      .map<VeiculoLinha>((registro) => {
        const preco = resolverPreco(registro);
        const veiculo = registro.veiculo;
        const localInfo = veiculo.local ?? null;
        const localId = localInfo?.id ?? veiculo.local_id ?? null;
        const precoReferencia = typeof preco === "number" ? preco : Number.POSITIVE_INFINITY;
        const modeloNome = veiculo.modelo?.nome ?? veiculo.modeloDisplay ?? veiculo.veiculoDisplay ?? "—";
        const placa = veiculo.placa ?? "—";
        const anoModelo = veiculo.ano_modelo ?? null;
        const anoFabricacao = veiculo.ano_fabricacao ?? null;
        const anoDisplay =
          anoModelo || anoFabricacao ? [anoModelo, anoFabricacao].filter(Boolean).join("/") : "—";
        const edicaoCombustivelCambio = buildEdicaoCombustivelCambio(veiculo.modelo);
        const cor = veiculo.cor ?? "—";
        const hodometro = formatKm(veiculo.hodometro);
        const localDisplay =
          localInfo?.nome ?? veiculo.localDisplay ?? veiculo.local?.nome ?? "Sem local";

        return {
          registro,
          precoReferencia,
          precoDisplay: formatCurrency(preco),
          modeloNome,
          placa,
          edicaoCombustivelCambio,
          anoDisplay,
          cor,
          hodometro,
          localDisplay,
          localId,
        };
      })
      .sort((a, b) => a.precoReferencia - b.precoReferencia);

    disponiveisOrdenados.forEach((item) => {
      if (!item.localId) return;
      const nomePreferencial =
        porUnidadeMap.get(item.localId)?.nome ?? item.localDisplay ?? "Unidade";
      const registroUnidade = ensureUnidade(item.localId, nomePreferencial);
      if (registroUnidade) {
        registroUnidade.itens.push(item);
      }
    });

    const porUnidade = Array.from(porUnidadeMap.entries())
      .map(([id, { nome, itens }]) => ({
        id,
        nome,
        itens,
      }))
      .filter(({ itens }) => itens.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

    const totalDisponiveis = porUnidade.reduce(
      (acc, unidade) => acc + unidade.itens.length,
      0,
    );

    return {
      totalDisponiveis,
      porUnidade,
    };
  }, [unidades, veiculosLoja]);

  const estaCarregando = isLoading || isUnidadesLoading;

  if (!lojaId) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">Impressão de vitrine</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecione uma loja na vitrine antes de gerar o relatório de impressão.
            </p>
          </header>
          <Button asChild variant="primary" className="w-fit">
            <Link href="/vitrine" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a vitrine
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Relatório de Vitrine</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {lojaSelecionada?.nome ? `Loja ${lojaSelecionada.nome} • ` : ""}
              Gerado em {dataHoraGeracao}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/vitrine" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => window.print()}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Imprimir
            </Button>
          </div>
        </header>

        {estaCarregando ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">Carregando veículos...</div>
        ) : agrupamento.totalDisponiveis === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Nenhum veículo disponível para impressão no momento.
          </div>
        ) : (
          <div className="space-y-12">
            {agrupamento.porUnidade.map(({ id, nome, itens }, idx) => (
              <section
                key={id}
                className={idx > 0 ? "break-before-page space-y-3" : "space-y-3"}
              >
                <header className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-xl font-semibold">{nome}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{dataHoraGeracao}</span>
                    <span>•</span>
                    <span>Nº de veículos: {itens.length}</span>
                  </div>
                </header>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 print:shadow-none">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        <th className="px-4 py-3">Modelo</th>
                        <th className="px-4 py-3">Placa</th>
                        <th className="px-4 py-3">Edição / Combustível / Câmbio</th>
                        <th className="px-4 py-3">Ano</th>
                        <th className="px-4 py-3">Cor</th>
                        <th className="px-4 py-3">Hodômetro</th>
                        <th className="px-4 py-3 text-right">Preço</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {itens.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400"
                            colSpan={7}
                          >
                            Nenhum veículo disponível nesta unidade.
                          </td>
                        </tr>
                      ) : (
                        itens.map((item) => (
                          <tr key={item.registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                              {item.modeloNome}
                            </td>
                            <td className="px-4 py-2 font-mono text-gray-700 dark:text-gray-300">
                              {item.placa}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {item.edicaoCombustivelCambio}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {item.anoDisplay}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {item.cor}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {item.hodometro}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                              {item.precoDisplay}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style>{`
        body.vitrine-imprimir-mode button[aria-label="Abrir menu"] {
          display: none !important;
        }

        @page {
          margin: 8mm;
        }

        @media print {
          .print\\:hidden { display: none !important; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .break-before-page { break-before: page; page-break-before: always; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
