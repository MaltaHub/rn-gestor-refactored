import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getVeiculo, listVeiculos, updateVeiculo } from "@/services/estoque";
import type { VeiculoUpdateInput } from "@/services/estoque";
import type { Veiculo } from "@/types/estoque";

type UseVeiculosOptions = {
  enabled?: boolean;
};

type UseVeiculoOptions = {
  enabled?: boolean;
};

export function useVeiculos(options: UseVeiculosOptions = {}) {
  const { enabled = true } = options;

  return useQuery<Veiculo[]>({
    queryKey: ["veiculos"],
    queryFn: listVeiculos,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

export function useVeiculo(id: string, options: UseVeiculoOptions = {}) {
  const isIdValid = Boolean(id);
  const enabled = options.enabled ?? isIdValid;

  return useQuery<Veiculo | undefined>({
    queryKey: ["veiculo", id],
    queryFn: () => getVeiculo(id),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

type UpdateVeiculoVariables = {
  id: string;
  data: VeiculoUpdateInput;
};

export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateVeiculoVariables) => updateVeiculo(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["veiculo", updated.id], updated);
      queryClient.setQueryData<Veiculo[] | undefined>(["veiculos"], (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((item) => (item.id === updated.id ? updated : item));
      });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
    },
  });
}
