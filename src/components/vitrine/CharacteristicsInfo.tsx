"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import type { Caracteristica } from "@/types";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";
import { useCaracteristicas } from "@/hooks/use-configuracoes";
import { atualizarVeiculo, calcularDiffCaracteristicas } from "@/services/estoque";
import { Permission } from "@/types/rbac";
import { usePermissions } from "@/hooks/use-permissions";

interface CharacteristicsInfoProps {
  veiculo: VeiculoUI;
}

const sortCaracteristicas = (lista: string[]) =>
  [...lista].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

export function CharacteristicsInfo({ veiculo }: CharacteristicsInfoProps) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [editarCaracteristicas, setEditarCaracteristicas] = useState(false);
  const [editedCaracteristicas, setEditedCaracteristicas] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { hasPermission } = usePermissions();
  const canEditarCaracteristicas = hasPermission(Permission.VITRINE_EDITAR_CARACTERISTICAS);

  const {
    data: caracteristicasDisponiveis = [],
    // add: adicionarCaracteristica, // Não usado atualmente
  } = useCaracteristicas();

  const caracteristicasOrdenadas = useMemo(
    () =>
      [...caracteristicasDisponiveis].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      ),
    [caracteristicasDisponiveis]
  );

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

  useEffect(() => {
    setEditedCaracteristicas(todasCaracteristicas);
  }, [todasCaracteristicas]);

  useEffect(() => {
    if (!canEditarCaracteristicas && editarCaracteristicas) {
      setEditarCaracteristicas(false);
    }
  }, [canEditarCaracteristicas, editarCaracteristicas]);

  const handleAdicionarCaracteristica = (id: string, nome: string) => {
    if (!editedCaracteristicas.includes(nome)) {
      setEditedCaracteristicas([...editedCaracteristicas, nome]);
    }
  };

  const handleRemoverCaracteristica = (nome: string) => {
    setEditedCaracteristicas(editedCaracteristicas.filter(item => item !== nome));
  };

  const handleSalvar = async () => {
    if (!canEditarCaracteristicas || !veiculo || !veiculo.id) return;
    setIsSaving(true);
    const original = todasCaracteristicas.map(nome => ({ id: nome, nome }));
    const updated = editedCaracteristicas.map(nome => ({ id: nome, nome }));
    const diff = calcularDiffCaracteristicas(original, updated);
    try {
      await atualizarVeiculo(veiculo.id, {
        adicionar_caracteristicas: diff.adicionar.map(item => ({ id: item.id, nome: item.nome })),
        remover_caracteristicas: diff.remover.map(item => ({ id: item.id, nome: item.nome }))
      });
      setEditarCaracteristicas(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Características
        </h2>
        {canEditarCaracteristicas && (
          <button
            type="button"
            onClick={() => {
              if (editarCaracteristicas) {
                handleSalvar();
              } else {
                setEditarCaracteristicas(true);
              }
            }}
            disabled={isSaving}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {editarCaracteristicas ? (isSaving ? "Salvando..." : "Salvar") : "Editar"}
          </button>
        )}
      </div>
      {editarCaracteristicas ? (
        <>
          <div className="flex flex-wrap gap-2">
            {editedCaracteristicas.map(item => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoverCaracteristica(item)}
                  className="ml-1 text-red-500"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4">
            <label
              htmlFor="caracteristicas"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Adicionar Características
            </label>
            <ul
              id="caracteristicas"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              {caracteristicasOrdenadas
                .filter(c => !editedCaracteristicas.includes(c.nome))
                .map(c => (
                  <li
                    key={c.id}
                    className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleAdicionarCaracteristica(c.id, c.nome)}
                  >
                    {c.nome}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Clique em uma característica para adicioná-la.
            </p>
          </div>
        </>
      ) : (
        todasCaracteristicas.length === 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma característica cadastrada.
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {caracteristicasVisiveis.map((item: string) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
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
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 transition hover:text-purple-700 dark:hover:text-purple-300"
              >
                {mostrarTodas ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Mostrar menos características
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Ver todas (+{extrasDisponiveis})
                  </>
                )}
              </button>
            )}
          </>
        )
      )}
      {veiculo.observacao && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Observações
          </h3>
          <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {veiculo.observacao}
          </p>
        </div>
      )}
    </Card>
  );
}
