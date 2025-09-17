import { Tabelas } from "../../types";
import { useNavigate } from "react-router-dom";

type VeiculoRead = Tabelas.VeiculoRead;

export function VehicleCard({ vehicle }: { vehicle: VeiculoRead }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 duration-300">
      <div className="p-5 space-y-3">
        {/* Header */}
        <h3 className="font-bold text-xl text-indigo-600 truncate">
          {vehicle.modelo?.nome ?? "Modelo não informado"}
        </h3>

        <div className="flex flex-wrap gap-2 text-gray-700">
          <span>Ano: {vehicle.ano_modelo ?? "—"}</span>
          <span>KM: {vehicle.hodometro.toLocaleString()}</span>
          <span>Local: {vehicle.local?.nome ?? "Não informado"}</span>
        </div>

        <p className="text-gray-700">
          Estado de Venda:{" "}
          <span className="font-medium">{vehicle.estado_venda}</span>
        </p>

        {vehicle.estado_veiculo && (
          <p className="text-gray-700">
            Estado Veículo: <span className="font-medium">{vehicle.estado_veiculo}</span>
          </p>
        )}

        <p className="text-gray-700">
          Preço:{" "}
          <span className="font-semibold text-green-600">
            {vehicle.preco_venda
              ? `R$ ${vehicle.preco_venda.toLocaleString()}`
              : "Não informado"}
          </span>
        </p>

        {/* Características */}
        {vehicle.caracteristicas?.length ? (
          <div className="flex flex-wrap gap-2">
            {vehicle.caracteristicas.map((c) => (
              <span
                key={c.id}
                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
              >
                {c.nome}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Sem características</p>
        )}

        {/* Observação */}
        {vehicle.observacao && (
          <p className="text-sm text-gray-500 italic">Obs: {vehicle.observacao}</p>
        )}

        {/* Botão Editar */}
        <button
          onClick={() => navigate(`/editar/${vehicle.id}`)}
          className="mt-3 w-full text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-2 font-medium transition"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
