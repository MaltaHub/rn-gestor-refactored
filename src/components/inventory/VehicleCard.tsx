import { useNavigate } from "react-router-dom"

import { Tabelas } from "@/types"

type VeiculoRead = Tabelas.VeiculoRead

type Caracteristica = NonNullable<VeiculoRead["caracteristicas"]>[number]

type Props = {
  vehicle: VeiculoRead
}

export function VehicleCard({ vehicle }: Props) {
  const navigate = useNavigate()

  const caracteristicas = vehicle.caracteristicas ?? []

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
      <div className="space-y-3 p-5">
        <h3 className="truncate text-xl font-bold text-indigo-600">
          {vehicle.modelo?.nome ?? "Modelo nao informado"}
        </h3>

        <div className="flex flex-wrap gap-2 text-gray-700">
          <span>Ano: {vehicle.ano_modelo ?? "---"}</span>
          <span>KM: {vehicle.hodometro.toLocaleString()}</span>
          <span>Local: {vehicle.local?.nome ?? "Nao informado"}</span>
        </div>

        <p className="text-gray-700">
          Estado de venda: <span className="font-medium">{vehicle.estado_venda}</span>
        </p>

        {vehicle.estado_veiculo && (
          <p className="text-gray-700">
            Estado veiculo: <span className="font-medium">{vehicle.estado_veiculo}</span>
          </p>
        )}

        <p className="text-gray-700">
          Preco:
          <span className="ml-1 font-semibold text-green-600">
            {vehicle.preco_venal ? `R$ ${vehicle.preco_venal.toLocaleString()}` : "Nao informado"}
          </span>
        </p>

        {caracteristicas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {caracteristicas.map((caracteristica: Caracteristica) => (
              <span key={caracteristica.id} className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800">
                {caracteristica.nome}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">Sem caracteristicas</p>
        )}

        {vehicle.observacao && (
          <p className="text-sm italic text-gray-500">Obs: {vehicle.observacao}</p>
        )}

        <button
          onClick={() => navigate(`/editar/${vehicle.id}`)}
          className="mt-3 w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          Editar
        </button>
      </div>
    </div>
  )
}
