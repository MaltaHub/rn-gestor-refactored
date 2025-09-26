import { useQuery } from "@tanstack/react-query";

import type { Veiculo } from "@/types/estoque";

type UseVeiculosOptions = {
  enabled?: boolean;
};

type UseVeiculoOptions = {
  enabled?: boolean;
};

const MOCK_VEICULOS: Veiculo[] = [
  {
    id: 1,
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2022,
    cor: "Prata",
    placa: "ABC1D23",
  },
  {
    id: 2,
    marca: "Honda",
    modelo: "Civic",
    ano: 2021,
    cor: "Preto",
    placa: "EFG4H56",
  },
  {
    id: 3,
    marca: "Chevrolet",
    modelo: "Onix",
    ano: 2020,
    cor: "Branco",
    placa: "IJK7L89",
  },
];

async function fetchVeiculos(): Promise<Veiculo[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_VEICULOS;
}

async function fetchVeiculo(id: number): Promise<Veiculo | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return MOCK_VEICULOS.find((veiculo) => veiculo.id === id);
}

export function useVeiculos(options: UseVeiculosOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["veiculos"],
    queryFn: fetchVeiculos,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

export function useVeiculo(id: number, options: UseVeiculoOptions = {}) {
  const isIdValid = Number.isFinite(id);
  const enabled = options.enabled ?? isIdValid;

  return useQuery({
    queryKey: ["veiculo", id],
    queryFn: () => fetchVeiculo(id),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
