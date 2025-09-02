import { Tabelas } from "../../types";

type Veiculo = Tabelas.Veiculo;

export function VehicleCard({ vehicle }: { vehicle: Veiculo }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition">
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-xl text-indigo-600">{vehicle.modelo_id ?? "Modelo não informado"}</h3>
        <p className="text-gray-700">Ano: {vehicle.ano_modelo ?? "—"}</p>
        <p className="text-gray-700">
          Preço:{" "}
          <span className="font-semibold text-green-600">
            {vehicle.preco_venda ? `R$ ${vehicle.preco_venda.toLocaleString()}` : "Não informado"}
          </span>
        </p>
        <p className="text-gray-700">KM: {vehicle.hodometro.toLocaleString()}</p>
        <p className="text-gray-700">
          Local: <span className="font-medium">{vehicle.local}</span>
        </p>
        <p className="text-gray-700">Estado de Venda: {vehicle.estado_venda}</p>
        {vehicle.estado_veiculo && <p className="text-gray-700">Estado Veículo: {vehicle.estado_veiculo}</p>}

        {vehicle.observacao && (
          <p className="text-sm text-gray-500 italic">Obs: {vehicle.observacao}</p>
        )}
      </div>
    </div>
  );
}
