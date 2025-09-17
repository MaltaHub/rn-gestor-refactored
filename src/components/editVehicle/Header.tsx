import { ArrowLeft, Trash2 } from "lucide-react";
import { Tabelas } from "../../types";
import { Button } from "./button";

type Veiculo = Tabelas.Veiculo;

interface Props {
  vehicle: Veiculo;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
  onTransfer: () => void;
  canTransfer: boolean;
}

export function PageHeader({
  vehicle,
  canDelete,
  onBack,
  onDelete,
  onTransfer,
  canTransfer,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Detalhes
        </Button>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar Veículo
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {vehicle.placa} - {vehicle.modelo_id ?? "Modelo não informado"}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={onTransfer}
          disabled={!canTransfer || vehicle.estado_venda === "vendido"}
        >
          Transferir Loja
        </Button>

        {canDelete && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
