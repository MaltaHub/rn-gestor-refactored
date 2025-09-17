import { ArrowLeft, Trash2 } from "lucide-react"

import { Tabelas } from "@/types"
import { Button } from "./Button"

type Veiculo = Tabelas.Veiculo

type Props = {
  vehicle: Veiculo
  canDelete: boolean
  onBack: () => void
  onDelete: () => void
  onTransfer: () => void
  canTransfer: boolean
}

export function PageHeader({ vehicle, canDelete, onBack, onDelete, onTransfer, canTransfer }: Props) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos detalhes
        </Button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editar veiculo</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {vehicle.placa} - {vehicle.modelo_id ?? "Modelo nao informado"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onTransfer} disabled={!canTransfer || vehicle.estado_venda === "vendido"}>
          Transferir loja
        </Button>

        {canDelete && (
          <Button variant="destructive" onClick={onDelete} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  )
}
