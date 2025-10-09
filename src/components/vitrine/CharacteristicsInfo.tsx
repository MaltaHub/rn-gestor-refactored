"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Caracteristica } from "@/types";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";

interface CharacteristicsInfoProps {
  veiculo: VeiculoUI;
}

const sortCaracteristicas = (lista: string[]) =>
  [...lista].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

export function CharacteristicsInfo({ veiculo }: CharacteristicsInfoProps) {
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const todasCaracteristicas = useMemo(() => {
    const itens = (veiculo?.caracteristicas ?? []) as Caracteristica[];
    const nomes = itens
      .map((item: Caracteristica | null) => item?.nome ?? null)
      .filter((nome: string | null): nome is string => Boolean(nome && nome.trim() !== ""));

    if (nomes.length === 0) {
      return sortCaracteristicas(veiculo?.caracteristicasPrincipais ?? []);
    }

    const unicos = Array.from(new Set(nomes.map((nome) => nome.trim())));
    return sortCaracteristicas(unicos);
  }, [veiculo?.caracteristicas, veiculo?.caracteristicasPrincipais]);

  const caracteristicasVisiveis = useMemo(() => {
    if (mostrarTodas) return todasCaracteristicas;
    const principais = veiculo?.caracteristicasPrincipais ?? [];
    return sortCaracteristicas(principais);
  }, [mostrarTodas, todasCaracteristicas, veiculo?.caracteristicasPrincipais]);

  const extrasDisponiveis = Math.max(
    todasCaracteristicas.length - (veiculo?.caracteristicasPrincipais?.length ?? 0),
    0
  );

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Características
      </h2>
      {caracteristicasVisiveis.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhuma característica cadastrada.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {caracteristicasVisiveis.map((item: string) => (
              <span
                key={item}
                className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm text-gray-600 dark:text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>
          {extrasDisponiveis > 0 && (
            <button
              type="button"
              onClick={() => setMostrarTodas((prev) => !prev)}
              aria-expanded={mostrarTodas}
              className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 transition hover:text-purple-700 dark:hover:text-purple-300"
            >
              {mostrarTodas
                ? "Mostrar menos características"
                : `Ver todas (+${extrasDisponiveis})`}
            </button>
          )}
        </>
      )}
      {veiculo.observacao && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </h3>
          <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
            {veiculo.observacao}
          </p>
        </div>
      )}
    </Card>
  );
}
