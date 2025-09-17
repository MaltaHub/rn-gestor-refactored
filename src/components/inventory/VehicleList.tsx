import { Tabelas } from "@/types"

import { VehicleCard } from "./VehicleCard"

type VeiculoRead = Tabelas.VeiculoRead

type Props = {
  vehicles: VeiculoRead[]
}

export function VehicleList({ vehicles }: Props) {
  if (vehicles.length === 0) {
    return (
      <p className="col-span-full text-center text-lg font-medium text-gray-500">
        Nenhum veiculo encontrado
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
