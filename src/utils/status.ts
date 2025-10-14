/**
 * Helpers relacionados aos status de veículos.
 */

/**
 * Verifica se um status (já formatado para exibição) representa um veículo vendido.
 */
export const isEstadoVendido = (estado?: string | null): boolean => {
  if (!estado) return false;
  return estado.trim().toLowerCase() === 'vendido';
};

