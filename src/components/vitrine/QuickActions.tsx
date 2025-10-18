"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { atualizarVeiculo } from "@/services/estoque";
import { atualizarPrecoVeiculoLoja } from "@/services/vitrine";
import { veiculosLojaKeys } from "@/adapters/adaptador-vitrine";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { Permission } from "@/types/rbac";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/PermissionGuard";

const ESTADOS_VENDA = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
] as const;

type EstadoVenda = (typeof ESTADOS_VENDA)[number];
type ActionType = "local" | "status" | "preco";

interface QuickActionsProps {
  veiculoLojaId: string;
  veiculoId: string;
  lojaId?: string;
  localAtualId?: string | null;
  statusAtual?: EstadoVenda;
  precoLojaAtual?: number | null;
  precoLojaFormatado?: string | null;
  precoEstoque?: number | null;
  locais: Array<{
    value: string;
    label: string;
    pertenceALoja: boolean;
  }>;
  lojaNome?: string | null;
}

const formatEnumLabel = (value?: string | null) =>
  value
    ? value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Não informado";

export function QuickActions({
  veiculoLojaId,
  veiculoId,
  lojaId,
  localAtualId,
  statusAtual,
  precoLojaAtual,
  // precoLojaFormatado, // Não usado atualmente
  precoEstoque,
  locais,
  lojaNome,
}: QuickActionsProps) {
  const { hasPermission, isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [localSelecionado, setLocalSelecionado] = useState<string>(localAtualId ?? "");
  const [statusSelecionado, setStatusSelecionado] = useState<EstadoVenda | "">(statusAtual ?? "");
  const [precoLoja, setPrecoLoja] = useState<string>(
    typeof precoLojaAtual === "number" ? precoLojaAtual.toString() : ""
  );
  const [feedback, setFeedback] = useState<{
    action: ActionType;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<ActionType | null>(null);

  const possuiUnidadeDaLoja = locais.some((option) => option.pertenceALoja);

  // Permissões por ação
  const canAlterarLocal = hasPermission(Permission.VITRINE_EDITAR_LOCAL) || isAdmin();
  const canAlterarStatus = hasPermission(Permission.VITRINE_EDITAR_STATUS) || isAdmin();
  const canAlterarPreco = hasPermission(Permission.VITRINE_EDITAR_PRECO) || isAdmin();

  const invalidateVitrineQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: veiculosLojaKeys.detalhe(veiculoLojaId),
      }),
      queryClient.invalidateQueries({
        queryKey: veiculosLojaKeys.lista(lojaId),
      }),
    ]);
    invalidateVeiculos(queryClient);
  }, [queryClient, veiculoLojaId, lojaId]);

  const handleUpdateLocal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving("local");
    setFeedback(null);
    try {
      await atualizarVeiculo(veiculoId, {
        local_id: localSelecionado === "" ? null : localSelecionado,
      });
      await invalidateVitrineQueries();
      setFeedback({
        action: "local",
        type: "success",
        message: "Local atualizado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "local",
        type: "error",
        message: "Não foi possível atualizar o local.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleUpdateStatus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!statusSelecionado) return;
    setIsSaving("status");
    setFeedback(null);
    try {
      await atualizarVeiculo(veiculoId, {
        estado_venda: statusSelecionado,
      });
      await invalidateVitrineQueries();
      setFeedback({
        action: "status",
        type: "success",
        message: "Status de venda atualizado.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "status",
        type: "error",
        message: "Não foi possível atualizar o status.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleUpdatePreco = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving("preco");
    setFeedback(null);
    try {
      const valorNormalizado = precoLoja.trim();
      const numero =
        valorNormalizado === ""
          ? null
          : Number(valorNormalizado.replace(/,/g, "."));
      if (numero !== null && Number.isNaN(numero)) {
        throw new Error("Informe um valor numérico válido.");
      }

      // Validação: preço da loja não pode ser menor que o preço do estoque
      if (numero !== null && precoEstoque !== null && precoEstoque !== undefined && numero < precoEstoque) {
        throw new Error("O preço da loja não pode ser menor que o preço do estoque.");
      }

      await atualizarPrecoVeiculoLoja(veiculoLojaId, numero);
      await invalidateVitrineQueries();
      setPrecoLoja(numero === null ? "" : String(numero));
      setFeedback({
        action: "preco",
        type: "success",
        message: "Preço da loja atualizado.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "preco",
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao atualizar o preço.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const toggleAction = (action: ActionType) => {
    setActiveAction((current) => (current === action ? null : action));
  };

  // Se não tiver nenhuma permissão relevante, não exibe o componente
  if (!canAlterarLocal && !canAlterarStatus && !canAlterarPreco) {
    return null;
  }

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl border-l-4 border-l-purple-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ações rápidas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajuste o local do veículo, o status de venda ou o preço específico desta loja.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {canAlterarLocal && (
            <Button
              type="button"
              variant={activeAction === "local" ? "primary" : "secondary"}
              onClick={() => toggleAction("local")}
            >
              Alterar local
            </Button>
          )}
          {canAlterarStatus && (
            <Button
              type="button"
              variant={activeAction === "status" ? "primary" : "secondary"}
              onClick={() => toggleAction("status")}
            >
              Alterar status
            </Button>
          )}
          {canAlterarPreco && (
            <Button
              type="button"
              variant={activeAction === "preco" ? "primary" : "secondary"}
              onClick={() => toggleAction("preco")}
            >
              Alterar valor
            </Button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-4">
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      {activeAction === "local" && canAlterarLocal && (
        <PermissionGuard permission={Permission.VITRINE_EDITAR_LOCAL}>
        <form className="mt-6 space-y-4" onSubmit={handleUpdateLocal}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="local">
              Selecione o novo local interno
            </label>
            <select
              id="local"
              value={localSelecionado}
              onChange={(e) => setLocalSelecionado(e.target.value)}
              className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-colors"
            >
              <option value="">Sem local vinculado</option>
              {locais.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {!possuiUnidadeDaLoja && lojaNome && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Nenhuma unidade cadastrada para {lojaNome}. Cadastre uma em configurações.
              </span>
            )}
          </div>
          <Button type="submit" variant="primary" disabled={isSaving === "local"}>
            {isSaving === "local" ? "Salvando..." : "Salvar local"}
          </Button>
        </form>
        </PermissionGuard>
      )}

      {activeAction === "status" && canAlterarStatus && (
        <PermissionGuard permission={Permission.VITRINE_EDITAR_STATUS}>
        <form className="mt-6 space-y-4" onSubmit={handleUpdateStatus}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="status">
              Status de venda
            </label>
            <select
              id="status"
              value={statusSelecionado}
              onChange={(e) => setStatusSelecionado(e.target.value as EstadoVenda)}
              className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-colors"
              required
            >
              <option value="" disabled>
                Selecione um status
              </option>
              {ESTADOS_VENDA.map((estado) => (
                <option key={estado} value={estado}>
                  {formatEnumLabel(estado)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" disabled={isSaving === "status"}>
            {isSaving === "status" ? "Salvando..." : "Salvar status"}
          </Button>
        </form>
        </PermissionGuard>
      )}

      {activeAction === "preco" && canAlterarPreco && (
        <PermissionGuard permission={Permission.VITRINE_EDITAR_PRECO}>
        <form className="mt-6 space-y-4" onSubmit={handleUpdatePreco}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="preco">
              Valor deste veículo na loja (R$)
            </label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={precoLoja}
              onChange={(e) => setPrecoLoja(e.target.value)}
              placeholder="Informe o valor"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Preço em estoque: {precoEstoque ?? "não definido"}
            </p>
          </div>
          <Button type="submit" variant="primary" disabled={isSaving === "preco"}>
            {isSaving === "preco" ? "Salvando..." : "Salvar preço"}
          </Button>
        </form>
        </PermissionGuard>
      )}
    </Card>
  );
}
