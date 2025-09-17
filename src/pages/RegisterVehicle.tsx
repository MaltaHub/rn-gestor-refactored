import { type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateVehicle } from "@/hooks/useVehicles"
import { useLocais, useModelos } from "@/hooks/useCompanyConfigurations"
import type { VehicleInsertInput } from "@/services/veiculos"

const ESTADO_VENDA_OPTIONS = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
] as const

const ESTADO_VEICULO_OPTIONS = [
  "novo",
  "seminovo",
  "usado",
  "sucata",
  "limpo",
  "sujo",
] as const

export default function RegisterVehicle() {
  const navigate = useNavigate()
  const createVehicle = useCreateVehicle()
  const { data: locais } = useLocais()
  const { data: modelos } = useModelos()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const dados: VehicleInsertInput = {
      placa: String(formData.get("placa") ?? "").trim().toUpperCase(),
      cor: String(formData.get("cor") ?? "").trim(),
      estado_venda: formData.get("estado_venda") as VehicleInsertInput["estado_venda"],
      hodometro: Number(formData.get("hodometro") ?? 0),
      estado_veiculo: (formData.get("estado_veiculo") || null) as VehicleInsertInput["estado_veiculo"],
      modelo_id: (formData.get("modelo_id") || null) as VehicleInsertInput["modelo_id"],
      local_id: (formData.get("local_id") || null) as VehicleInsertInput["local_id"],
      preco_venal: formData.get("preco_venal") ? Number(formData.get("preco_venal")) : null,
      observacao: (formData.get("observacao") || null) as VehicleInsertInput["observacao"],
    }

    try {
      await createVehicle.mutateAsync({ dados })
      event.currentTarget.reset()
      toast.success("Veiculo cadastrado com sucesso.")
      navigate("/app/estoque")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel cadastrar o veiculo."
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex w-fit items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card className="shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Cadastrar veiculo</CardTitle>
          <CardDescription>Informe os dados basicos para adicionar um veiculo ao estoque.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="placa">
                  Placa
                </label>
                <input
                  id="placa"
                  name="placa"
                  required
                  placeholder="ABC1D23"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm uppercase"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="cor">
                  Cor
                </label>
                <input
                  id="cor"
                  name="cor"
                  required
                  placeholder="Prata"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="estado_venda">
                  Estado de venda
                </label>
                <select
                  id="estado_venda"
                  name="estado_venda"
                  required
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  {ESTADO_VENDA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="estado_veiculo">
                  Estado do veiculo
                </label>
                <select
                  id="estado_veiculo"
                  name="estado_veiculo"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {ESTADO_VEICULO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="hodometro">
                  Hodometro (km)
                </label>
                <input
                  id="hodometro"
                  name="hodometro"
                  type="number"
                  min={0}
                  required
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="preco_venal">
                  Preco venal
                </label>
                <input
                  id="preco_venal"
                  name="preco_venal"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="local_id">
                  Local
                </label>
                <select
                  id="local_id"
                  name="local_id"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {locais?.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="modelo_id">
                  Modelo
                </label>
                <select
                  id="modelo_id"
                  name="modelo_id"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {modelos?.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {(modelo.marca ?? "Marca") + " " + modelo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="observacao">
                Observacao
              </label>
              <textarea
                id="observacao"
                name="observacao"
                rows={4}
                placeholder="Informacoes adicionais"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                  </span>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
