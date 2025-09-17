import { Tabelas } from "../../types";
import { VehicleCard } from "./VehicleCard.tsx";

// Definindo um alias para o tipo Veiculo
type VeiculoRead = Tabelas.VeiculoRead;

export function VehicleList({ vehicles }: { vehicles: VeiculoRead[] }) {
  if (vehicles.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500 text-lg font-medium">
        Nenhum veículo encontrado
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
