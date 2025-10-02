"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useLojaStore } from "@/stores/useLojaStore";
import { adicionarVeiculoLoja, removerVeiculoLoja } from "@/services/vitrine";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { veiculosLojaKeys } from "@/adapters/adaptador-vitrine";

type BaseActionButtonProps = {
  className?: string;
};

type AddButtonProps = BaseActionButtonProps & {
  veiculoId: string;
  empresaId: string;
  preco?: number | null;
  dataEntrada?: string;
  label?: string;
  onAdded?: () => void;
};

type RemoveButtonProps = BaseActionButtonProps & {
  veiculoLojaId: string;
  label?: string;
  onRemoved?: () => void;
  redirectTo?: string;
};

export function AddVehicleToStoreButton({
  veiculoId,
  empresaId,
  preco = null,
  dataEntrada,
  className,
  label = "Adicionar à loja",
  onAdded,
}: AddButtonProps) {
  const loja = useLojaStore((state) => state.lojaSelecionada);
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!loja?.id) {
        throw new Error("Selecione uma loja para adicionar o veículo.");
      }

      await adicionarVeiculoLoja({
        empresaId,
        lojaId: loja.id,
        veiculoId,
        preco,
        dataEntrada,
      });
    },
    onSuccess: async () => {
      if (loja?.id) {
        await queryClient.invalidateQueries({ queryKey: veiculosLojaKeys.lista(loja.id) });
      }
      invalidateVeiculos(queryClient);
      setErrorMessage(null);
      onAdded?.();
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Erro ao adicionar veículo na loja.");
      }
    },
  });

  const isDisabled = mutation.isPending || !loja?.id;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${
          className ?? ""
        }`}
        disabled={isDisabled}
      >
        {mutation.isPending ? "Adicionando..." : label}
      </button>
      {errorMessage && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

export function RemoveVehicleFromStoreButton({
  veiculoLojaId,
  className,
  label = "Remover da loja",
  onRemoved,
  redirectTo,
}: RemoveButtonProps) {
  const loja = useLojaStore((state) => state.lojaSelecionada);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await removerVeiculoLoja(veiculoLojaId);
    },
    onSuccess: async () => {
      if (loja?.id) {
        await queryClient.invalidateQueries({ queryKey: veiculosLojaKeys.lista(loja.id) });
      }
      await queryClient.invalidateQueries({ queryKey: veiculosLojaKeys.detalhe(veiculoLojaId) });
      invalidateVeiculos(queryClient);
      setErrorMessage(null);
      onRemoved?.();
      if (redirectTo) {
        router.replace(redirectTo);
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Erro ao remover veículo da loja.");
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        className={`inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${
          className ?? ""
        }`}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Removendo..." : label}
      </button>
      {errorMessage && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

