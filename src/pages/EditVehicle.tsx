import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeleteVehicle, useUpdateVehicle, useVehicles } from "@/hooks/useVehicles"
import type { VehicleRecord } from "@/services/veiculos"

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

type FormState = {
  cor: string
  hodometro: number
  precoVenal: number | null
  estadoVenda: (typeof ESTADO_VENDA_OPTIONS)[number]
  estadoVeiculo: (typeof ESTADO_VEICULO_OPTIONS)[number] | ""
  observacao: string
}

const DEFAULT_FORM: FormState = {
  cor: "",
  hodometro: 0,
  precoVenal: null,
  estadoVenda: "disponivel",
  estadoVeiculo: "",
  observacao: "",
}

function toFormState(vehicle: VehicleRecord): FormState {
  return {
    cor: vehicle.cor ?? "",
    hodometro: vehicle.hodometro ?? 0,
    precoVenal: vehicle.preco_venal ?? null,
    estadoVenda: vehicle.estado_venda ?? "disponivel",
    estadoVeiculo: vehicle.estado_veiculo ?? "",
    observacao: vehicle.observacao ?? "",
  }
}

export default function EditVehicle() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()

  const { data: vehicles, isLoading, isFetching, error } = useVehicles()
  const updateVehicle = useUpdateVehicle()
  const deleteVehicle = useDeleteVehicle()

  const vehicle = useMemo(() => {
    if (!vehicles || !vehicleId) return null
    return vehicles.find((item) => item.id === vehicleId) ?? null
  }, [vehicles, vehicleId])

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  useEffect(() => {
    if (!vehicle) return
    setForm(toFormState(vehicle))
  }, [vehicle])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-8 text-center">
        <p className="text-lg font-semibold text-destructive">Erro ao carregar veiculos.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    )
  }

  if (!vehicleId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground">Veiculo nao informado.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground">Veiculo nao encontrado.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await updateVehicle.mutateAsync({
        veiculoId: vehicle.id,
        dados: {
          cor: form.cor,
          hodometro: form.hodometro,
          preco_venal: form.precoVenal,
          estado_venda: form.estadoVenda,
          estado_veiculo: form.estadoVeiculo || null,
          observacao: form.observacao || null,
        },
      })

      toast.success("Veiculo atualizado com sucesso.")
      navigate(`/app/veiculos/${vehicle.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel atualizar o veiculo."
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Deseja remover este veiculo?")
    if (!confirmed) return

    try {
      await deleteVehicle.mutateAsync({ veiculoId: vehicle.id })
      toast.success("Veiculo removido.")
      navigate("/app/estoque")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel remover o veiculo."
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
          <CardTitle className="text-2xl font-bold">Editar veiculo</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Atualize os dados principais do veiculo cadastrado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="cor">
                Cor
              </label>
              <input
                id="cor"
                value={form.cor}
                onChange={(event) => setForm((prev) => ({ ...prev, cor: event.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="hodometro">
                Hodometro (km)
              </label>
              <input
                id="hodometro"
                type="number"
                min={0}
                value={Number.isNaN(form.hodometro) ? "" : form.hodometro}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, hodometro: Number(event.target.value) || 0 }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="precoVenal">
                Preco venal (R$)
              </label>
              <input
                id="precoVenal"
                type="number"
                min={0}
                step="0.01"
                value={form.precoVenal ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    precoVenal: event.target.value ? Number(event.target.value) : null,
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="estadoVenda">
                Estado de venda
              </label>
              <select
                id="estadoVenda"
                value={form.estadoVenda}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, estadoVenda: event.target.value as FormState["estadoVenda"] }))
                }
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
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="estadoVeiculo">
                Estado do veiculo
              </label>
              <select
                id="estadoVeiculo"
                value={form.estadoVeiculo}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    estadoVeiculo: event.target.value as FormState["estadoVeiculo"],
                  }))
                }
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
              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="observacao">
                Observacao
              </label>
              <textarea
                id="observacao"
                value={form.observacao}
                onChange={(event) => setForm((prev) => ({ ...prev, observacao: event.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteVehicle.isPending}
                className="sm:w-auto"
              >
                {deleteVehicle.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Removendo
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Remover veiculo
                  </span>
                )}
              </Button>

              <Button type="submit" disabled={updateVehicle.isPending} className="sm:w-auto">
                {updateVehicle.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                  </span>
                ) : (
                  "Salvar alteracoes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
