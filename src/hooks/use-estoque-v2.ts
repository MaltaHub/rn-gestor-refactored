/**
 * useEstoqueV2 - Nova versão usando Repository Pattern
 * Mantém backward compatibility com use-estoque.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estoqueService } from '@/services/estoque.service';
import type { VeiculoCreatePayload, VeiculoUpdatePayload } from '@/repositories/veiculo.repository';
import { QUERY_CONFIG } from '@/config';

export function useEstoqueV2(empresaId?: string) {
  const queryClient = useQueryClient();

  const { data: veiculos, isLoading } = useQuery({
    queryKey: ['veiculos', empresaId],
    queryFn: () => estoqueService.listarVeiculos(empresaId),
    ...QUERY_CONFIG.veiculos,
    enabled: !!empresaId,
  });

  const criarMutation = useMutation({
    mutationFn: (dados: VeiculoCreatePayload) => estoqueService.criarVeiculo(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: VeiculoUpdatePayload }) =>
      estoqueService.atualizarVeiculo(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: string) => estoqueService.deletarVeiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });

  return {
    veiculos: veiculos || [],
    isLoading,
    criar: criarMutation.mutateAsync,
    atualizar: atualizarMutation.mutateAsync,
    deletar: deletarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isDeletando: deletarMutation.isPending,
  };
}
